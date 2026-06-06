import { NextRequest, NextResponse } from "next/server";
import { publicClient, TOKENS } from "@/lib/celo";
import { formatUnits, parseAbiItem } from "viem";

// ─── x402 Payment Gate ────────────────────────────────────────────────────────
// Price: $0.01 USDC per query
// Uses thirdweb facilitator for settlement on Celo
const QUERY_PRICE_USD = 0.01;
const FEE_RECIPIENT = process.env.FEE_RECIPIENT as `0x${string}`;

async function verifyX402Payment(request: NextRequest): Promise<boolean> {
  // In production: use thirdweb settlePayment() here
  // For MVP/testing: check for payment header presence
  const paymentHeader =
    request.headers.get("X-PAYMENT") ||
    request.headers.get("PAYMENT-SIGNATURE");

  if (!paymentHeader) return false;

  // TODO: Replace with full thirdweb settlement:
  // const result = await settlePayment({
  //   resourceUrl: request.url,
  //   method: "GET",
  //   paymentData: paymentHeader,
  //   payTo: FEE_RECIPIENT,
  //   network: celo,
  //   price: `$${QUERY_PRICE_USD}`,
  //   facilitator: thirdwebFacilitator,
  // });
  // return result.status === 200;

  return true; // remove when thirdweb settlement is wired up
}

// ─── On-chain intelligence fetcher ───────────────────────────────────────────
async function analyzeWallet(address: `0x${string}`) {
  const [celoBalance, usdcBalance, usdtBalance, latestBlock] =
    await Promise.all([
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

  // Fetch recent USDC Transfer events involving this wallet (last ~500 blocks ≈ ~8 min)
  const fromBlock = latestBlock - 500n;
  const transferLogs = await publicClient.getLogs({
    address: TOKENS.USDC,
    event: parseAbiItem(
      "event Transfer(address indexed from, address indexed to, uint256 value)"
    ),
    args: { from: address },
    fromBlock,
    toBlock: latestBlock,
  });

  const recentTransfers = transferLogs.map((log) => ({
    to: log.args.to,
    amount: formatUnits(log.args.value ?? 0n, 6),
    block: log.blockNumber?.toString(),
    txHash: log.transactionHash,
  }));

  // Whale flag: any single transfer > 10,000 USDC in last 500 blocks
  const whaleActivity = recentTransfers.filter(
    (t) => parseFloat(t.amount) > 10_000
  );

  const usdcFloat = parseFloat(formatUnits(usdcBalance as bigint, 6));
  const usdtFloat = parseFloat(formatUnits(usdtBalance as bigint, 6));

  // Simple activity score: 0–100
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

  // x402 payment check
  const paid = await verifyX402Payment(request);
  if (!paid) {
    return NextResponse.json(
      {
        error: "Payment required",
        price: `$${QUERY_PRICE_USD}`,
        token: "USDC",
        network: "celo",
      },
      {
        status: 402,
        headers: {
          "X-Payment-Required": "true",
          "X-Payment-Price": QUERY_PRICE_USD.toString(),
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
