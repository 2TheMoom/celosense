import { NextRequest, NextResponse } from "next/server";
import { publicClient, REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/celo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address") as `0x${string}` | null;

  if (!address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }

  try {
    const [isRegistered, timestamp] = (await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: REGISTRY_ABI,
      functionName: "getStatus",
      args: [address],
    })) as [boolean, bigint];

    const totalRegistered = (await publicClient.readContract({
      address: REGISTRY_ADDRESS,
      abi: REGISTRY_ABI,
      functionName: "totalRegistered",
    })) as bigint;

    return NextResponse.json({
      address,
      isRegistered,
      registeredAt: isRegistered ? new Date(Number(timestamp) * 1000).toISOString() : null,
      totalRegistered: totalRegistered.toString(),
    });
  } catch (err) {
    console.error("Registry check error:", err);
    return NextResponse.json({ error: "Failed to check registry" }, { status: 500 });
  }
}