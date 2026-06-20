import { NextResponse } from "next/server";
import { publicClient, REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/celo";
import { parseAbiItem } from "viem";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CHUNK_SIZE = 800n;

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

    const [registerLogs, deregisterLogs, totalRegistered] = await Promise.all([
      getLogsChunked({
        address: REGISTRY_ADDRESS,
        event: parseAbiItem("event WalletRegistered(address indexed wallet, uint256 timestamp)"),
        fromBlock,
        toBlock: latestBlock,
      }),
      getLogsChunked({
        address: REGISTRY_ADDRESS,
        event: parseAbiItem("event WalletDeregistered(address indexed wallet, uint256 timestamp)"),
        fromBlock,
        toBlock: latestBlock,
      }),
      publicClient.readContract({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: "totalRegistered",
      }) as Promise<bigint>,
    ]);

    const deregistered = new Set(
      deregisterLogs.map((log: any) => (log.args?.wallet as string)?.toLowerCase())
    );

    const registrations = registerLogs
      .map((log: any) => ({
        wallet: log.args?.wallet as string,
        timestamp: log.args?.timestamp?.toString(),
        txHash: log.transactionHash,
        blockNumber: log.blockNumber?.toString(),
        isActive: !deregistered.has((log.args?.wallet as string)?.toLowerCase()),
      }))
      .reverse();

    return NextResponse.json(
      {
        registrations,
        total: Number(totalRegistered),
        blockRange: { from: fromBlock.toString(), to: latestBlock.toString() },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: any) {
    console.error("Registry feed error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}