"use client";

import { useState, useCallback } from "react";

interface Transfer {
  to: string;
  amount: string;
  block: string;
  txHash: string;
}

interface IntelligenceData {
  address: string;
  balances: { celo: string; usdc: string; usdt: string };
  recentTransfers: Transfer[];
  whaleActivity: Transfer[];
  activityScore: number;
  isWhale: boolean;
  analyzedAt: string;
  blockRange: { from: string; to: string };
}

interface Props {
  address: `0x${string}`;
  isMiniPay: boolean;
}

export function IntelligencePanel({ address, isMiniPay }: Props) {
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryAddress, setQueryAddress] = useState(address);

  const fetchIntelligence = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/intelligence?address=${queryAddress}`, {
        headers: {
          // x402 payment header — in production this is signed by the user's wallet
          // via thirdweb useFetchWithPayment hook
          "X-PAYMENT": "demo-payment-header",
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch");
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [queryAddress]);

  return (
    <div>
      {/* Query bar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Query Wallet Intelligence</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            value={queryAddress}
            onChange={(e) => setQueryAddress(e.target.value as `0x${string}`)}
            placeholder="0x wallet address"
            style={{
              flex: 1,
              background: "var(--surface2)",
              border: "1px solid var(--border2)",
              borderRadius: 3,
              padding: "8px 12px",
              color: "var(--text)",
              fontFamily: "var(--mono)",
              fontSize: 12,
              outline: "none",
            }}
          />
          <button
            className="btn btn-primary"
            onClick={fetchIntelligence}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" /> Analyzing…
              </>
            ) : (
              <>⬡ Analyze — $0.01 USDC</>
            )}
          </button>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>
          Each query costs $0.01 USDC via x402 · paid from your connected wallet
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      {data && (
        <>
          {/* Whale alert */}
          {data.isWhale && (
            <div className="alert alert-whale">
              <span className="alert-icon">⚠</span>
              <div>
                <strong>Whale Activity Detected</strong>
                <div style={{ fontSize: 12, marginTop: 3 }}>
                  {data.whaleActivity.length} transfer(s) over 10,000 USDC in the last ~500 blocks
                </div>
              </div>
            </div>
          )}

          {!data.isWhale && (
            <div className="alert alert-green">
              <span className="alert-icon">✓</span>
              <div>No whale activity detected in the monitored window</div>
            </div>
          )}

          {/* Balances */}
          <div className="card section-gap">
            <div className="card-title">Balances</div>
            <div className="card-grid">
              <div className="metric">
                <div className="metric-label">CELO</div>
                <div className="metric-value green">
                  {parseFloat(data.balances.celo).toFixed(4)}
                </div>
                <div className="metric-sub">native</div>
              </div>
              <div className="metric">
                <div className="metric-label">USDC</div>
                <div className="metric-value">
                  {parseFloat(data.balances.usdc).toFixed(2)}
                </div>
                <div className="metric-sub">stablecoin</div>
              </div>
              <div className="metric">
                <div className="metric-label">USDT</div>
                <div className="metric-value">
                  {parseFloat(data.balances.usdt).toFixed(2)}
                </div>
                <div className="metric-sub">stablecoin</div>
              </div>
              <div className="metric">
                <div className="metric-label">Activity Score</div>
                <div className={`metric-value ${data.activityScore > 60 ? "gold" : data.activityScore > 30 ? "green" : ""}`}>
                  {data.activityScore}
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>/100</span>
                </div>
                <div className="score-bar-wrap">
                  <div className="score-bar-track">
                    <div
                      className="score-bar-fill"
                      style={{ width: `${data.activityScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent transfers */}
          <div className="card section-gap">
            <div className="card-title">
              Recent USDC Transfers
              <span style={{ marginLeft: 8, color: "var(--faint)", fontWeight: 400 }}>
                blocks {data.blockRange.from}–{data.blockRange.to}
              </span>
            </div>
            {data.recentTransfers.length === 0 ? (
              <div className="empty-text">No USDC transfers in monitored window</div>
            ) : (
              <div className="transfers-list">
                {data.recentTransfers.map((t, i) => {
                  const isWhale = parseFloat(t.amount) > 10_000;
                  return (
                    <div key={i} className={`transfer-row ${isWhale ? "whale" : ""}`}>
                      <span className="transfer-to">
                        → {t.to?.slice(0, 8)}…{t.to?.slice(-4)}
                      </span>
                      <span className={`transfer-amount ${isWhale ? "whale" : ""}`}>
                        {parseFloat(t.amount).toLocaleString()} USDC
                      </span>
                      {isWhale && <span className="whale-tag">WHALE</span>}
                      {t.txHash && (
                        <a
                          href={`https://celoscan.io/tx/${t.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tx-link"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer meta */}
          <div style={{ marginTop: 12, fontSize: 11, color: "var(--faint)", fontFamily: "var(--mono)", textAlign: "right" }}>
            analyzed at {new Date(data.analyzedAt).toLocaleTimeString()}
          </div>
        </>
      )}

      {!data && !loading && !error && (
        <div className="loading-text">
          Enter a wallet address and run a query to see on-chain intelligence.
        </div>
      )}
    </div>
  );
}
