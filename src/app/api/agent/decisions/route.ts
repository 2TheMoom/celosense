import { NextResponse } from "next/server";
import { publicClient, REGISTRY_ADDRESS, TOKENS } from "@/lib/celo";
import { parseAbiItem } from "viem";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const CHUNK_SIZE = 800n;

const transferCache = new Map<string, string | null>();

async function getLogsChunked(params: {
  address: `0x${string}`;
  event: any;
  fromBlock: bigint;
  toBlock: bigint;
  args?: any;
}) {
  const allLogs: any[] = [];
  let start = params.fromBlock;

  while (start <= params.toBlock) {
    const end = start + CHUNK_SIZE - 1n > params.toBlock ? params.toBlock : start + CHUNK_SIZE - 1n;
    try {
      const chunkLogs = await publicClient.getLogs({
        address: params.address,
        event: params.event,
        args: params.args,
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

async function findTransferTxHash(
  decisionTxHash: string,
  target: string,
  decisionBlock: bigint
): Promise<string | null> {
  if (transferCache.has(decisionTxHash)) {
    return transferCache.get(decisionTxHash) ?? null;
  }

  try {
    const fromBlock = decisionBlock > 800n ? decisionBlock - 800n : 0n;

    const logs = await getLogsChunked({
      address: TOKENS.USDC,
      event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
      args: { from: target as `0x${string}` },
      fromBlock,
      toBlock: decisionBlock,
    });

    if (logs.length === 0) {
      transferCache.set(decisionTxHash, null);
      return null;
    }

    // Find the largest transfer — not just the most recent one.
    // The most recent may be a small DEX swap; the whale trigger was the largest.
    const largest = (logs as any[]).reduce((max, log) => {
      const val = log.args?.value ?? 0n;
      const maxVal = max.args?.value ?? 0n;
      return val > maxVal ? log : max;
    });

    const result = largest.transactionHash ?? null;
    transferCache.set(decisionTxHash, result);
    return result;
  } catch {
    transferCache.set(decisionTxHash, null);
    return null;
  }
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

    const sorted = [...logs].reverse();

    const decisions = await Promise.all(
      sorted.map(async (log: any) => {
        const target = log.args?.target;
        const decisionType = log.args?.decisionType;
        const isWhaleType = decisionType === "WHALE_DETECTED" || decisionType === "HIGH_WHALE_ACTIVITY";
        const txHash = log.transactionHash;

        let transferTxHash: string | null = null;
        if (isWhaleType && target && target !== ZERO_ADDRESS) {
          transferTxHash = await findTransferTxHash(txHash, target, log.blockNumber);
        }

        return {
          agent: log.args?.agent,
          decisionType,
          target,
          score: log.args?.score?.toString(),
          timestamp: log.args?.timestamp?.toString(),
          txHash,
          transferTxHash,
          blockNumber: log.blockNumber?.toString(),
        };
      })
    );

    return NextResponse.json(
      { decisions, total: decisions.length },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: any) {
    console.error("Decisions fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}