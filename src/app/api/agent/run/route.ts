import { NextRequest, NextResponse } from "next/server";
import { publicClient, TOKENS, REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/celo";
import { createWalletClient, http, fallback, formatUnits, parseAbiItem, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

const USDC_ADDRESS = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}`;
const DECISION_PRICE = parseUnits("0.0001", 6);

const USDC_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const dynamic = "force-dynamic";
export const revalidate = 0;

function verifyCron(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

async function runAgent() {
  const latestBlock = await publicClient.getBlockNumber();
  const fromBlock = latestBlock - 500n;

  const logs = await publicClient.getLogs({
    address: TOKENS.USDC,
    event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
    fromBlock,
    toBlock: latestBlock,
  });

  const whaleTxs = logs.filter((log: any) => {
    const value = log.args?.value ?? 0n;
    return value > parseUnits("10000", 6);
  });

  const totalVolume = logs.reduce((acc: bigint, log: any) => {
    return acc + (log.args?.value ?? 0n);
  }, 0n);

  let decisionType = "NORMAL";
  let score = 0;

  if (whaleTxs.length > 5) {
    decisionType = "HIGH_WHALE_ACTIVITY";
    score = 90;
  } else if (whaleTxs.length > 0) {
    decisionType = "WHALE_DETECTED";
    score = 60;
  } else if (logs.length > 100) {
    decisionType = "HIGH_VOLUME";
    score = 40;
  } else if (logs.length === 0) {
    decisionType = "QUIET_PERIOD";
    score = 5;
  } else {
    decisionType = "NORMAL";
    score = 20;
  }

  // Defensive extraction: prefer decoded args.from, but fall back to decoding
  // the indexed "from" address directly from topics[1] if args is incomplete.
  // This guards against partial log decoding under RPC load.
  function extractFromAddress(log: any): string {
    if (log.args?.from) return log.args.from;
    const topic = log.topics?.[1];
    if (topic && topic.length === 66) {
      return "0x" + topic.slice(26);
    }
    return "0x0000000000000000000000000000000000000000";
  }

  const target = whaleTxs.length > 0
    ? extractFromAddress(whaleTxs[0])
    : "0x0000000000000000000000000000000000000000";

  if (whaleTxs.length > 0 && target === "0x0000000000000000000000000000000000000000") {
    console.warn("Whale detected but target extraction failed. Raw log:", JSON.stringify(whaleTxs[0]));
  }

  if (!process.env.AGENT_PRIVATE_KEY) throw new Error("AGENT_PRIVATE_KEY not set");
  const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    account,
    chain: celo,
    transport: fallback([
      http("https://forno.celo.org", { timeout: 25_000, retryCount: 2, retryDelay: 1_000 }),
      http("https://rpc.ankr.com/celo", { timeout: 25_000, retryCount: 2, retryDelay: 1_000 }),
    ]),
  });

  // Get current gas price and bump it to avoid "replacement underpriced"
  const currentGasPrice = await publicClient.getGasPrice();
  const bumpedGasPrice = (currentGasPrice * 150n) / 100n; // +50%

  // Get pending nonce (includes any stuck pending txs)
  const nonce = await publicClient.getTransactionCount({
    address: account.address,
    blockTag: "pending",
  });

  // Check current allowance — skip approve if already sufficient
  const allowance = await publicClient.readContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: "allowance",
    args: [account.address, REGISTRY_ADDRESS],
  }) as bigint;

  let currentNonce = nonce;

  // Only log on-chain for whale-level decisions — saves gas and USDC
  // for routine NORMAL / HIGH_VOLUME / QUIET_PERIOD runs
  const shouldLog = decisionType === "WHALE_DETECTED" || decisionType === "HIGH_WHALE_ACTIVITY";

  let txHash: string | null = null;

  if (shouldLog) {
    if (allowance < DECISION_PRICE * 1000n) {
      await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [REGISTRY_ADDRESS, DECISION_PRICE * 1000000n],
        gasPrice: bumpedGasPrice,
        nonce: currentNonce,
      });
      currentNonce++;
    }

    txHash = await walletClient.writeContract({
      address: REGISTRY_ADDRESS,
      abi: REGISTRY_ABI,
      functionName: "logDecision",
      args: [decisionType, target as `0x${string}`, BigInt(score)],
      gasPrice: bumpedGasPrice,
      nonce: currentNonce,
    });
  }

  return {
    decisionType,
    score,
    target,
    whaleTxs: whaleTxs.length,
    totalTransfers: logs.length,
    totalVolume: formatUnits(totalVolume, 6),
    blockRange: { from: fromBlock.toString(), to: latestBlock.toString() },
    txHash: txHash ?? "skipped — non-whale decision",
    logged: shouldLog,
    timestamp: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  if (!verifyCron(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runAgent();
    console.log("Agent decision logged:", result);
    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("Agent run error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}