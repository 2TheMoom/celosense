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

  const totalFlags = leaderboard.reduce((acc, e) => acc + e.flagCount, 0);
  const topWallet = leaderboard[0] || null;
  const mostRecentFlag = leaderboard.reduce((latest, e) => {
    const ts = parseInt(e.lastFlaggedAt);
    return ts > latest ? ts : latest;
  }, 0);

  return (
    <div>
      {/* ─── Premium Summary Card ─────────────────────────────────────── */}
      <div className="card" style={{ borderLeft: "3px solid var(--crimson)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="card-title" style={{ margin: 0 }}>Whale Leaderboard</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 11, fontFamily: "var(--mono)", padding: "3px 10px", borderRadius: 2,
              background: "rgba(176,28,46,0.08)", color: "var(--crimson)",
              border: "1px solid rgba(176,28,46,0.3)", textTransform: "uppercase", letterSpacing: 0.5,
            }}>
              🐋 Live Rankings
            </span>
            <button className="btn btn-secondary" onClick={fetchLeaderboard} style={{ padding: "4px 10px", fontSize: 11 }}>
              ↻
            </button>
          </div>
        </div>

        <p style={{ fontFamily: "var(--body)", fontSize: 13, color: "var(--muted)", lineHeight: 1.8, marginBottom: 16 }}>
          {loading ? "Loading leaderboard data…" : leaderboard.length === 0
            ? "No whale activity detected in the current monitoring window. The agent checks every 5 minutes."
            : (() => {
                const activityLevel = totalFlags > 20 ? "elevated" : totalFlags > 10 ? "moderate" : "low";
                const highActivity = leaderboard.filter(e => e.highActivityCount > 0);
                const topAddr = topWallet ? `${topWallet.address.slice(0, 8)}…${topWallet.address.slice(-4)}` : "";
                const timeSince = mostRecentFlag > 0
                  ? Math.floor((Date.now() - mostRecentFlag * 1000) / 60000)
                  : null;

                return `Whale activity is ${activityLevel} — ${leaderboard.length} unique wallet${leaderboard.length > 1 ? "s" : ""} flagged across ${totalFlags} detection event${totalFlags > 1 ? "s" : ""} in the current window.${topWallet ? ` ${topAddr} leads with ${topWallet.flagCount} flag${topWallet.flagCount > 1 ? "s" : ""}.` : ""}${highActivity.length > 0 ? ` ${highActivity.length} wallet${highActivity.length > 1 ? "s" : ""} triggered HIGH_WHALE_ACTIVITY classification.` : ""}${timeSince !== null ? ` Last detection ${timeSince < 2 ? "just now" : `${timeSince} min ago`}.` : ""}`;
              })()
          }
        </p>

        <div style={{ height: 1, background: "var(--border)", margin: "4px 0 14px" }} />

        {/* Metric tiles */}
        <div className="card-grid">
          <div className="metric">
            <div className="metric-label">Unique Whales</div>
            <div className="metric-value crimson">{loading ? "—" : leaderboard.length}</div>
            <div className="metric-sub">flagged wallets</div>
          </div>
          <div className="metric">
            <div className="metric-label">Total Flags</div>
            <div className="metric-value">{loading ? "—" : totalFlags}</div>
            <div className="metric-sub">detection events</div>
          </div>
          <div className="metric">
            <div className="metric-label">Top Flag Count</div>
            <div className="metric-value navy">{loading ? "—" : topWallet ? topWallet.flagCount : "—"}</div>
            <div className="metric-sub">most flagged wallet</div>
          </div>
          <div className="metric">
            <div className="metric-label">Last Detection</div>
            <div className="metric-value" style={{ fontSize: 16 }}>
              {loading || !mostRecentFlag ? "—" : new Date(mostRecentFlag * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="metric-sub">agent cycle: 5 min</div>
          </div>
        </div>

        {/* Signal pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {!loading && leaderboard.length > 0 && (
            <span style={{
              fontSize: 11, fontFamily: "var(--mono)", padding: "3px 10px", borderRadius: 2,
              background: "rgba(176,28,46,0.08)", color: "var(--crimson)",
              border: "1px solid rgba(176,28,46,0.3)",
            }}>
              ⚠ {leaderboard.filter(e => e.highActivityCount > 0).length} high activity wallets
            </span>
          )}
          <span style={{
            fontSize: 11, fontFamily: "var(--mono)", padding: "3px 10px", borderRadius: 2,
            background: "rgba(31,58,143,0.06)", color: "var(--navy)",
            border: "1px solid rgba(31,58,143,0.2)",
          }}>
            ⬡ Threshold: $10,000 USDC
          </span>
          <span style={{
            fontSize: 11, fontFamily: "var(--mono)", padding: "3px 10px", borderRadius: 2,
            background: "var(--surface)", color: "var(--muted)",
            border: "1px solid var(--border)",
          }}>
            ○ {blockRange ? `Blocks ${blockRange.from}–${blockRange.to}` : "Last ~10,000 blocks"}
          </span>
          <span style={{
            fontSize: 11, fontFamily: "var(--mono)", padding: "3px 10px", borderRadius: 2,
            background: "var(--surface)", color: "var(--muted)",
            border: "1px solid var(--border)",
          }}>
            ◈ Powered by CeloSenseRegistry
          </span>
        </div>
      </div>

      {/* ─── Rankings List ─────────────────────────────────────────────── */}
      <div className="card">
        <div className="card-title">Rankings</div>
        {loading ? (
          <div className="loading-text">Loading rankings…</div>
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
                      {entry.highActivityCount > 0 && (
                        <span style={{ marginLeft: 8, color: "var(--crimson)" }}>
                          · {entry.highActivityCount} high activity
                        </span>
                      )}
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
        Ranked by flag frequency · auto-refreshes every 5 min
      </div>
    </div>
  );
}