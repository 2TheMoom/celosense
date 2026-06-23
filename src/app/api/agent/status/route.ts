import { NextResponse } from "next/server";
import { getLastAgentRun } from "@/lib/agentState";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const status = getLastAgentRun();
  return NextResponse.json(
    status ?? { status: "unknown", message: "Agent has not run since last cold start." },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}