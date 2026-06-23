// Module-level in-memory store for last agent run status.
// Persists across requests while the Vercel function is warm.
// Since cron-job.org hits /api/agent/run every 5 minutes,
// this function stays warm continuously in production.

export interface AgentRunStatus {
  decisionType: string;
  score: number;
  totalTransfers: number;
  totalVolume: string;
  whaleTxs: number;
  logged: boolean;
  txHash: string | null;
  timestamp: string;
  blockRange: { from: string; to: string };
}

let lastAgentRun: AgentRunStatus | null = null;

export function setLastAgentRun(status: AgentRunStatus) {
  lastAgentRun = status;
}

export function getLastAgentRun(): AgentRunStatus | null {
  return lastAgentRun;
}