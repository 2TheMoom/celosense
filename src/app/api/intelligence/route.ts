import { NextRequest, NextResponse } from "next/server";
import { publicClient, TOKENS } from "@/lib/celo";
import { formatUnits, parseAbiItem, getAddress } from "viem";

const FEE_RECIPIENT = (process.env.FEE_RECIPIENT || "0x701F6eab7854509A578143f51b2AEc5BcC308De7").toLowerCase();
const USDC_ADDRESS = "0xceba9300f2b948710d2653dd7b07f33a8b32118c";
const QUERY_PRICE_RAW = 10000n; // $0.01 USDC in raw units (6 decimals)

// ─── Verify payment on-chain ──────────────────────────────────────────────────
async function verifyX402Payment(request: NextRequest): Promise<boolean> {
  const txHash = request.headers.get("X-PAYMENT") as `0x${string}` | null;
  if (!txHash || !txHash.startsWith("0x")) return false;

  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
    if (!receipt || receipt.status !== "success") return false;

    // Check logs for USDC Transfer to FEE_RECIPIENT of at least $0.01
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== USDC_ADDRESS) continue;
      // Transfer(address indexed from, address indexed to, uint256 value)
      if (log.topics.length < 3) continue;
      const to = "0x" + log.topics[2]?.slice(26);
      if (to.toLowerCase() !== FEE_RECIPIENT) continue;
      const value = BigInt(log.data);
      if (value >= QUERY_PRICE_RAW) return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ─── On-chain intelligence fetcher ───────────────────────────────────────────
async function analyzeWallet(address: `0x${string}`) {
  address = getAddress(address);

  const [celoBalance, usdcBalance, usdtBalance, latestBlock] = await Promise.all([
    publicClient.getBalance({ address }),
    publicClient.readContract({
      address: TOKENS.USDC,
      abi: [parseAbiItem("function balanceOf(address) view returns (uint256)")],
      functionName: "balanceOf",
      args: [address],
    }),
    publicClient.readContract({
      address: TOKENS.USDT,
      abi: [parseAbiItem("function balanceOf(address) view returns (uint256)")],
      functionName: "balanceOf",
      args: [address],
    }),
    publicClient.getBlockNumber(),
  ]);

  const fromBlock = latestBlock - 500n;
  const transferLogs = await publicClient.getLogs({
    address: TOKENS.USDC,
    event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
    args: { from: address },
    fromBlock,
    toBlock: latestBlock,
  });

  const recentTransfers = transferLogs.map((log: any) => ({
    to: log.args.to,
    amount: formatUnits(log.args.value ?? 0n, 6),
    block: log.blockNumber?.toString(),
    txHash: log.transactionHash,
  }));

  const whaleActivity = recentTransfers.filter((t: any) => parseFloat(t.amount) > 10_000);
  const usdcFloat = parseFloat(formatUnits(usdcBalance as bigint, 6));

  const activityScore = Math.min(
    100,
    recentTransfers.length * 10 + (usdcFloat > 1000 ? 20 : 0) + (whaleActivity.length > 0 ? 30 : 0)
  );

  return {
    address,
    balances: {
      celo: formatUnits(celoBalance, 18),
      usdc: formatUnits(usdcBalance as bigint, 6),
      usdt: formatUnits(usdtBalance as bigint, 6),
    },
    recentTransfers,
    whaleActivity,
    activityScore,
    isWhale: whaleActivity.length > 0,
    analyzedAt: new Date().toISOString(),
    blockRange: { from: fromBlock.toString(), to: latestBlock.toString() },
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address") as `0x${string}` | null;

  if (!address || !address.startsWith("0x")) {
    return NextResponse.json({ error: "Invalid address" }, { status: 400 });
  }

  const paid = await verifyX402Payment(request);
  if (!paid) {
    return NextResponse.json(
      { error: "Payment required", price: "$0.01", token: "USDC", network: "celo" },
      {
        status: 402,
        headers: {
          "X-Payment-Required": "true",
          "X-Payment-Price": "0.01",
          "X-Payment-Token": "USDC",
        },
      }
    );
  }

  try {
    const data = await analyzeWallet(address);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Intelligence fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch intelligence" }, { status: 500 });
  }
}