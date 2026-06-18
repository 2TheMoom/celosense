import { NextResponse } from "next/server";
import { publicClient, REGISTRY_ADDRESS } from "@/lib/celo";
import { parseAbiItem } from "viem";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const WHALE_TYPES = new Set(["WHALE_DETECTED", "HIGH_WHALE_ACTIVITY"]);
const CHUNK_SIZE = 800n; // safely under every fallback RPC's observed range limit

interface WhaleEntry {
  address: string;
  flagCount: number;
  highActivityCount: number;
  lastFlaggedAt: string;
  lastTxHash: string;
}

// Splits a wide block range into small chunks and queries each sequentially,
// merging results. Avoids "block range too large" errors across providers
// with different, undocumented, or inconsistent eth_getLogs limits.
async function getLogsChunked(params: {
  address: `0x${string}`;
  event: any;
  fromBlock: bigint;
  toBlock: bigint;
}) {
  const allLogs: any[] = [];
  let start = params.fromBlock;

  while (start <= params.toBlock) {
    const end = start + CHUNK_SIZE - 1n > params.toBlock ? params.toBlock : start + CHUNK_SIZE - 1n;
    try {
      const chunkLogs = await publicClient.getLogs({
        address: params.address,
        event: params.event,
        fromBlock: start,
        toBlock: end,
      });
      allLogs.push(...chunkLogs);
    } catch (err) {
      console.error(`Chunk ${start}-${end} failed:`, err);
    }
    start = end + 1n;
  }

  return allLogs;
}

export async function GET() {
  try {
    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock > 10000n ? latestBlock - 10000n : 0n;

    const logs = await getLogsChunked({
      address: REGISTRY_ADDRESS,
      event: parseAbiItem(
        "event DecisionLogged(address indexed agent, string decisionType, address indexed target, uint256 score, uint256 timestamp)"
      ),
      fromBlock,
      toBlock: latestBlock,
    });

    const tally = new Map<string, WhaleEntry>();

    for (const log of logs as any[]) {
      const decisionType = log.args?.decisionType;
      const target = log.args?.target as string;
      const timestamp = log.args?.timestamp?.toString();
      const txHash = log.transactionHash;

      if (!WHALE_TYPES.has(decisionType)) continue;
      if (!target || target.toLowerCase() === ZERO_ADDRESS) continue;

      const key = target.toLowerCase();
      const existing = tally.get(key);

      if (existing) {
        existing.flagCount += 1;
        if (decisionType === "HIGH_WHALE_ACTIVITY") existing.highActivityCount += 1;
        // Keep the most recent timestamp/tx since logs are in ascending block order
        existing.lastFlaggedAt = timestamp;
        existing.lastTxHash = txHash;
      } else {
        tally.set(key, {
          address: target,
          flagCount: 1,
          highActivityCount: decisionType === "HIGH_WHALE_ACTIVITY" ? 1 : 0,
          lastFlaggedAt: timestamp,
          lastTxHash: txHash,
        });
      }
    }

    const leaderboard = Array.from(tally.values()).sort((a, b) => b.flagCount - a.flagCount);

    return NextResponse.json(
      {
        leaderboard,
        total: leaderboard.length,
        blockRange: { from: fromBlock.toString(), to: latestBlock.toString() },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: any) {
    console.error("Leaderboard fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}