"use client";

import { useState, useEffect } from "react";

interface Decision {
  agent: string;
  decisionType: string;
  target: string;
  score: string;
  timestamp: string;
  txHash: string;
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

  const fetchDecisions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agent/decisions");
      const data = await res.json();
      setDecisions(data.decisions || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDecisions, 5 * 60 * 1000);
    return () => clearInterval(interval);
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
          <div style={{ marginLeft: "auto", fontFamily: "var(--headline)", fontSize: 20, fontWeight: 800, color: "var(--navy)" }}>
            {total} <span style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)", fontWeight: 400 }}>decisions logged</span>
          </div>
        </div>
      </div>

      {/* Decisions feed */}
      <div className="card">
        <div className="card-title" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Decision Log</span>
          <button className="btn btn-secondary" onClick={fetchDecisions} style={{ padding: "4px 10px", fontSize: 11 }}>
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-text">Loading decisions…</div>
        ) : decisions.length === 0 ? (
          <div className="empty-text">No decisions logged yet. Agent will run shortly.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {decisions.slice(0, 20).map((d, i) => {
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
                        Target: {d.target.slice(0, 8)}…{d.target.slice(-4)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                    <span style={{
                      fontFamily: "var(--mono)", fontSize: 10,
                      color: "var(--navy)",
                      background: "rgba(31,58,143,0.06)",
                      border: "1px solid rgba(31,58,143,0.2)",
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
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: "var(--faint)", fontFamily: "var(--mono)", textAlign: "right" }}>
        Showing last 20 decisions · Agent wallet: 0x1074…E3EE
      </div>
    </div>
  );
}