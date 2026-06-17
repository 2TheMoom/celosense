"use client";

import { useState, useEffect } from "react";

interface WhaleEntry {
  address: string;
  flagCount: number;
  highActivityCount: number;
  lastFlaggedAt: string;
  lastTxHash: string;
}

export function LeaderboardPanel() {
  const [leaderboard, setLeaderboard] = useState<WhaleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockRange, setBlockRange] = useState<{ from: string; to: string } | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agent/leaderboard");
      const data = await res.json();
      setLeaderboard(data.leaderboard || []);
      setBlockRange(data.blockRange || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const medalFor = (rank: number) => {
    if (rank === 0) return "🥇";
    if (rank === 1) return "🥈";
    if (rank === 2) return "🥉";
    return `#${rank + 1}`;
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Whale Leaderboard</span>
          <button className="btn btn-secondary" onClick={fetchLeaderboard} style={{ padding: "4px 10px", fontSize: 11 }}>
            ↻ Refresh
          </button>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>
          Wallets most frequently flagged for large USDC movements by the autonomous agent
          {blockRange && (
            <> · blocks {blockRange.from}–{blockRange.to}</>
          )}
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-text">Loading leaderboard…</div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-text">No whale activity detected yet in the monitored window.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {leaderboard.map((entry, i) => {
              const date = entry.lastFlaggedAt
                ? new Date(parseInt(entry.lastFlaggedAt) * 1000).toLocaleString()
                : "—";

              return (
                <div
                  key={entry.address}
                  style={{
                    padding: "14px 16px",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderLeft: i < 3 ? "3px solid var(--crimson)" : "3px solid var(--border2)",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--headline)",
                    fontSize: i < 3 ? 22 : 14,
                    fontWeight: 800,
                    color: i < 3 ? "var(--crimson)" : "var(--muted)",
                    minWidth: 36,
                    textAlign: "center",
                  }}>
                    {medalFor(i)}
                  </span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a
                      href={`https://celoscan.io/address/${entry.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--navy)",
                        textDecoration: "none",
                      }}
                    >
                      {entry.address.slice(0, 10)}…{entry.address.slice(-6)} ↗
                    </a>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                      Last flagged: {date}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{
                      fontFamily: "var(--headline)",
                      fontSize: 18,
                      fontWeight: 800,
                      color: "var(--crimson)",
                    }}>
                      {entry.flagCount}
                    </span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>
                      flag{entry.flagCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {entry.lastTxHash && (
                    <a
                      href={`https://celoscan.io/tx/${entry.lastTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tx-link"
                      style={{ fontSize: 10 }}
                    >
                      Latest flag ↗
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: "var(--faint)", fontFamily: "var(--mono)", textAlign: "right" }}>
        Ranked by flag frequency · powered by CeloSenseRegistry on-chain decision log
      </div>
    </div>
  );
}