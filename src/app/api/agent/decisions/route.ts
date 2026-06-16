import { NextResponse } from "next/server";
import { publicClient, REGISTRY_ADDRESS, TOKENS } from "@/lib/celo";
import { parseAbiItem } from "viem";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// For a given decision, find the specific USDC transfer tx that triggered it
// by searching a tight window of blocks right before the decision was logged.
async function findTransferTxHash(target: string, decisionBlock: bigint): Promise<string | null> {
  try {
    const fromBlock = decisionBlock > 600n ? decisionBlock - 600n : 0n;

    const logs = await publicClient.getLogs({
      address: TOKENS.USDC,
      event: parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)"),
      args: { from: target as `0x${string}` },
      fromBlock,
      toBlock: decisionBlock,
    });

    if (logs.length === 0) return null;

    // Most recent matching transfer before the decision was logged
    const latest = logs[logs.length - 1] as any;
    return latest.transactionHash;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock > 5000n ? latestBlock - 5000n : 0n;

    const logs = await publicClient.getLogs({
      address: REGISTRY_ADDRESS,
      event: parseAbiItem(
        "event DecisionLogged(address indexed agent, string decisionType, address indexed target, uint256 score, uint256 timestamp)"
      ),
      fromBlock,
      toBlock: latestBlock,
    });

    const sorted = [...logs].reverse();

    // Only look up transfer tx hashes for whale-related decisions to keep this fast
    const decisions = await Promise.all(
      sorted.map(async (log: any) => {
        const target = log.args?.target;
        const decisionType = log.args?.decisionType;
        const isWhaleType = decisionType === "WHALE_DETECTED" || decisionType === "HIGH_WHALE_ACTIVITY";

        let transferTxHash: string | null = null;
        if (isWhaleType && target && target !== ZERO_ADDRESS) {
          transferTxHash = await findTransferTxHash(target, log.blockNumber);
        }

        return {
          agent: log.args?.agent,
          decisionType,
          target,
          score: log.args?.score?.toString(),
          timestamp: log.args?.timestamp?.toString(),
          txHash: log.transactionHash,
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