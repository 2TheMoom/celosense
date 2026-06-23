"use client";

import { useState, useEffect } from "react";
import { ActivityTimeline } from "@/components/ActivityTimeline";

interface Decision {
  agent: string;
  decisionType: string;
  target: string;
  score: string;
  timestamp: string;
  txHash: string;
  transferTxHash: string | null;
  blockNumber: string;
}

const DECISION_COLORS: Record<string, string> = {
  HIGH_WHALE_ACTIVITY: "crimson",
  WHALE_DETECTED: "crimson",
  HIGH_VOLUME: "navy",
  NORMAL: "green",
  QUIET_PERIOD: "",
};

const DECISION_ICONS: Record<string, string> = {
  HIGH_WHALE_ACTIVITY: "⚠",
  WHALE_DETECTED: "🐋",
  HIGH_VOLUME: "⬡",
  NORMAL: "✓",
  QUIET_PERIOD: "○",
};

export function AgentPanel() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [whaleCount, setWhaleCount] = useState(0);
  const [lastRun, setLastRun] = useState<any>(null);
  const [expanded, setExpanded] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const PREVIEW_COUNT = 5;

  const fetchDecisions = async () => {
    setLoading(true);
    try {
      const [res, statusRes] = await Promise.all([
        fetch("/api/agent/decisions"),
        fetch("/api/agent/status"),
      ]);
      const data = await res.json();
      const statusData = await statusRes.json();
      setDecisions(data.decisions || []);
      setTotal(data.total || 0);
      const whales = (data.decisions || []).filter((d: any) => d.decisionType === "WHALE_DETECTED" || d.decisionType === "HIGH_WHALE_ACTIVITY");
      setWhaleCount(whales.length);
      if (statusData.timestamp) setLastRun(statusData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDecisions();
      setCountdown(300);
    }, 5 * 60 * 1000);

    // Countdown timer — ticks every second
    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev <= 1 ? 300 : prev - 1);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <div>
      {/* Agent status */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Autonomous Agent</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="status-dot active" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 6px rgba(26,107,60,0.8)", display: "inline-block" }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--green)", fontWeight: 700 }}>ACTIVE</span>
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
            Runs every 5 min · $0.0001 USDC per decision
          </div>
          <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <div style={{ fontFamily: "var(--headline)", fontSize: 20, fontWeight: 800, color: "var(--navy)" }}>
              {total} <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", fontWeight: 400 }}>decisions logged</span>
            </div>
            {whaleCount > 0 && (
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--crimson)", fontWeight: 700 }}>
                ⚠ {whaleCount} whale alert{whaleCount > 1 ? "s" : ""} in window
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Last run status banner */}
      {lastRun && (
        <div style={{
          padding: "10px 14px",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderLeft: lastRun.logged ? "3px solid var(--crimson)" : "3px solid var(--border2)",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}>
          <div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginBottom: 2, textTransform: "uppercase", letterSpacing: 1 }}>
              Last Agent Run
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: lastRun.logged ? "var(--crimson)" : "var(--muted)", fontWeight: 700 }}>
              {lastRun.logged
                ? `⚠ ${lastRun.decisionType.replace(/_/g, " ")} — logged on-chain`
                : `○ ${lastRun.decisionType.replace(/_/g, " ")} — no action taken`}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
              {lastRun.totalTransfers} transfers · ${parseFloat(lastRun.totalVolume).toLocaleString(undefined, { maximumFractionDigits: 0 })} USDC volume · {new Date(lastRun.timestamp).toLocaleTimeString()}
            </div>
          </div>
          {lastRun.logged && lastRun.txHash && (
            <a href={`https://celoscan.io/tx/${lastRun.txHash}`} target="_blank" rel="noopener noreferrer" className="tx-link" style={{ fontSize: 10 }}>
              View tx ↗
            </a>
          )}
        </div>
      )}

      {/* Decisions feed */}
      <div className="card">
        <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Decision Log</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
              ↻ {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}
            </span>
            <button className="btn btn-secondary" onClick={fetchDecisions} style={{ padding: "4px 10px", fontSize: 11 }}>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-text">Loading decisions…</div>
        ) : decisions.length === 0 ? (
          <div className="empty-text">No decisions logged yet. Agent will run shortly.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(expanded ? decisions : decisions.slice(0, PREVIEW_COUNT)).map((d, i) => {
              const color = DECISION_COLORS[d.decisionType] || "";
              const icon = DECISION_ICONS[d.decisionType] || "◈";
              const date = d.timestamp
                ? new Date(parseInt(d.timestamp) * 1000).toLocaleString()
                : "—";

              return (
                <div key={i} style={{
                  padding: "12px 14px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderLeft: color === "crimson" ? "3px solid var(--crimson)" :
                              color === "navy" ? "3px solid var(--navy)" :
                              color === "green" ? "3px solid var(--green)" :
                              "3px solid var(--border)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: "var(--headline)",
                      fontSize: 13,
                      fontWeight: 800,
                      color: color === "crimson" ? "var(--crimson)" :
                             color === "navy" ? "var(--navy)" :
                             color === "green" ? "var(--green)" :
                             "var(--muted)",
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}>
                      {d.decisionType.replace(/_/g, " ")}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
                      Score: {d.score} · {date}
                    </div>
                    {d.target && d.target !== "0x0000000000000000000000000000000000000000" && (
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                        Target:{" "}
                        <a
                          href={
                            d.transferTxHash
                              ? `https://celoscan.io/tx/${d.transferTxHash}`
                              : `https://celoscan.io/address/${d.target}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "var(--navy)", textDecoration: "none" }}
                        >
                          {d.target.slice(0, 8)}…{d.target.slice(-4)}
                          {d.transferTxHash ? " (view transfer) ↗" : " ↗"}
                        </a>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{
                      fontFamily: "var(--mono)", fontSize: 10,
                      color: color === "crimson" ? "var(--crimson)" : color === "navy" ? "var(--navy)" : color === "green" ? "var(--green)" : "var(--muted)",
                      background: color === "crimson" ? "rgba(176,28,46,0.06)" : color === "navy" ? "rgba(31,58,143,0.06)" : color === "green" ? "rgba(26,107,60,0.06)" : "var(--surface)",
                      border: color === "crimson" ? "1px solid rgba(176,28,46,0.2)" : color === "navy" ? "1px solid rgba(31,58,143,0.2)" : color === "green" ? "1px solid rgba(26,107,60,0.2)" : "1px solid var(--border)",
                      padding: "2px 6px", borderRadius: 2,
                    }}>
                      Score {d.score}/100
                    </span>
                    {d.txHash && (
                      <a
                        href={`https://celoscan.io/tx/${d.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-link"
                        style={{ fontSize: 10 }}
                      >
                        View on Celoscan ↗
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {decisions.length > PREVIEW_COUNT && (
              <button
                className="btn btn-secondary"
                onClick={() => setExpanded(!expanded)}
                style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
              >
                {expanded
                  ? `▲ Show less`
                  : `▼ Show all ${decisions.length} decisions (${decisions.length - PREVIEW_COUNT} more)`}
              </button>
            )}
          </div>
        )}
      </div>

      <ActivityTimeline />

      <div style={{ marginTop: 12, fontSize: 11, color: "var(--faint)", fontFamily: "var(--mono)", textAlign: "right" }}>
        Showing {expanded ? decisions.length : Math.min(PREVIEW_COUNT, decisions.length)} of {decisions.length} decisions · Agent wallet: 0x1074…E3EE
      </div>
    </div>
  );
}