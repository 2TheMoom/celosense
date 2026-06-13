import { NextResponse } from "next/server";
import { publicClient, REGISTRY_ADDRESS } from "@/lib/celo";
import { parseAbiItem } from "viem";

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

    const decisions = logs.map((log: any) => ({
      agent: log.args?.agent,
      decisionType: log.args?.decisionType,
      target: log.args?.target,
      score: log.args?.score?.toString(),
      timestamp: log.args?.timestamp?.toString(),
      txHash: log.transactionHash,
      blockNumber: log.blockNumber?.toString(),
    })).reverse();

    return NextResponse.json({ decisions, total: decisions.length });
  } catch (err: any) {
    console.error("Decisions fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}