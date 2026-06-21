"use client";

import { useState, useCallback } from "react";
import { useWriteContract } from "wagmi";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/celo";
import { USDC_ADDRESS, USDC_ABI, QUERY_PRICE } from "@/lib/usdc";

interface Transfer {
  from: string;
  to: string;
  amount: string;
  block: string;
  txHash: string;
}

interface IntelligenceData {
  address: string;
  balances: { celo: string; usdc: string; usdt: string };
  celoPrice: number | null;
  celoUsdValue: number | null;
  recentTransfers: Transfer[];
  whaleActivity: Transfer[];
  activityScore: number;
  isWhale: boolean;
  analyzedAt: string;
  blockRange: { from: string; to: string };
  summary: string;
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
  const [step, setStep] = useState<"idle" | "approving" | "recording" | "confirming" | "fetching">("idle");

  const { writeContractAsync } = useWriteContract();

  const fetchIntelligence = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      setStep("approving");
      await writeContractAsync({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "approve",
        args: [REGISTRY_ADDRESS, QUERY_PRICE],
      });

      setStep("recording");
      const txHash = await writeContractAsync({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: "recordQuery",
        args: [queryAddress as `0x${string}`],
      });

      setStep("confirming");
      await new Promise((res) => setTimeout(res, 3000));

      setStep("fetching");
      const res = await fetch(`/api/intelligence?address=${queryAddress}`, {
        headers: { "X-PAYMENT": txHash },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch");
      }

      const json = await res.json();
      setData(json);
    } catch (e: any) {
      if (e.message?.includes("User rejected")) {
        setError("Transaction rejected — query cancelled.");
      } else if (e.message?.includes("insufficient") || e.message?.includes("ERC20")) {
        setError("Insufficient USDC balance. You need at least $0.01 USDC to query.");
      } else {
        setError(e.message || "Failed to fetch intelligence");
      }
    } finally {
      setLoading(false);
      setStep("idle");
    }
  }, [queryAddress, writeContractAsync]);

  const getButtonLabel = () => {
    if (!loading) return <>⬡ Analyze — $0.01 USDC</>;
    if (step === "approving") return <><span className="spinner" /> Approving USDC…</>;
    if (step === "recording") return <><span className="spinner" /> Recording query…</>;
    if (step === "confirming") return <><span className="spinner" /> Confirming…</>;
    if (step === "fetching") return <><span className="spinner" /> Fetching data…</>;
    return <><span className="spinner" /> Loading…</>;
  };

  const totalVolume = data
    ? data.recentTransfers.reduce((acc, t) => acc + parseFloat(t.amount), 0)
    : 0;

  return (
    <div>
      {/* Query bar */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Query Wallet Intelligence</div>
        <div className="query-bar">
          <input
            type="text"
            value={queryAddress}
            onChange={(e) => setQueryAddress(e.target.value as `0x${string}`)}
            placeholder="0x wallet address"
          />
          <button
            className="btn btn-primary"
            onClick={fetchIntelligence}
            disabled={loading}
          >
            {getButtonLabel()}
          </button>
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--muted)", fontFamily: "var(--mono)" }}>
          Each query costs $0.01 USDC · recorded on-chain to CeloSenseRegistry
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      {data && (
        <>
          {/* ─── Intelligence Summary Card ─────────────────────────────── */}
          <div className="card section-gap" style={{
            borderLeft: `3px solid ${data.isWhale ? "var(--crimson)" : "var(--green)"}`,
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="card-title" style={{ margin: 0 }}>Intelligence Summary</div>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: "var(--mono)",
                padding: "3px 10px",
                borderRadius: 2,
                background: data.isWhale ? "rgba(176,28,46,0.08)" : "rgba(26,107,60,0.08)",
                color: data.isWhale ? "var(--crimson)" : "var(--green)",
                border: `1px solid ${data.isWhale ? "rgba(176,28,46,0.3)" : "rgba(26,107,60,0.3)"}`,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}>
                {data.isWhale ? "⚠ Whale Detected" : "✓ Normal Activity"}
              </span>
            </div>

            {/* Summary text */}
            <p style={{
              fontFamily: "var(--body)",
              fontSize: 13,
              color: "var(--text)",
              lineHeight: 1.85,
              marginBottom: 16,
            }}>
              {data.summary}
            </p>

            {/* Divider */}
            <div style={{ height: 1, background: "var(--border)", margin: "4px 0 14px" }} />

            {/* Metric tiles */}
            <div className="card-grid">
              <div className="metric">
                <div className="metric-label">Activity Score</div>
                <div className={`metric-value ${data.activityScore > 60 ? "navy" : data.activityScore > 30 ? "green" : ""}`}>
                  {data.activityScore}
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>/100</span>
                </div>
                <div className="score-bar-wrap">
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{ width: `${data.activityScore}%` }} />
                  </div>
                </div>
              </div>
              <div className="metric">
                <div className="metric-label">Transfers</div>
                <div className="metric-value">{data.recentTransfers.length}</div>
                <div className="metric-sub">in monitored window</div>
              </div>
              <div className="metric">
                <div className="metric-label">Total Volume</div>
                <div className={`metric-value ${data.isWhale ? "crimson" : ""}`}>
                  ${totalVolume > 1000
                    ? (totalVolume / 1000).toFixed(1) + "K"
                    : totalVolume.toFixed(0)}
                </div>
                <div className="metric-sub">USDC transferred</div>
              </div>
              <div className="metric">
                <div className="metric-label">CELO Balance</div>
                <div className="metric-value green">
                  {parseFloat(data.balances.celo) > 1000
                    ? (parseFloat(data.balances.celo) / 1000).toFixed(1) + "K"
                    : parseFloat(data.balances.celo).toFixed(2)}
                </div>
                <div className="metric-sub">
                  {data.celoUsdValue !== null ? `≈ $${data.celoUsdValue.toFixed(2)} USD` : "native"}
                </div>
              </div>
            </div>

            {/* Signal pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
              {data.isWhale && (
                <span style={{
                  fontSize: 11, fontFamily: "var(--mono)", padding: "3px 10px", borderRadius: 2,
                  background: "rgba(176,28,46,0.08)", color: "var(--crimson)",
                  border: "1px solid rgba(176,28,46,0.3)",
                }}>
                  ⚠ {data.whaleActivity.length} whale transfer{data.whaleActivity.length > 1 ? "s" : ""}
                </span>
              )}
              {!data.isWhale && (
                <span style={{
                  fontSize: 11, fontFamily: "var(--mono)", padding: "3px 10px", borderRadius: 2,
                  background: "rgba(26,107,60,0.08)", color: "var(--green)",
                  border: "1px solid rgba(26,107,60,0.3)",
                }}>
                  ✓ No whale flags
                </span>
              )}
              {data.recentTransfers.length > 0 && (
                <span style={{
                  fontSize: 11, fontFamily: "var(--mono)", padding: "3px 10px", borderRadius: 2,
                  background: "rgba(31,58,143,0.06)", color: "var(--navy)",
                  border: "1px solid rgba(31,58,143,0.2)",
                }}>
                  ⬡ {data.recentTransfers.length} transfer{data.recentTransfers.length > 1 ? "s" : ""} detected
                </span>
              )}
              {parseFloat(data.balances.usdc) + parseFloat(data.balances.usdt) > 1000 && (
                <span style={{
                  fontSize: 11, fontFamily: "var(--mono)", padding: "3px 10px", borderRadius: 2,
                  background: "rgba(26,107,60,0.06)", color: "var(--green)",
                  border: "1px solid rgba(26,107,60,0.2)",
                }}>
                  ◈ Significant stables
                </span>
              )}
              <span style={{
                fontSize: 11, fontFamily: "var(--mono)", padding: "3px 10px", borderRadius: 2,
                background: "var(--surface)", color: "var(--muted)",
                border: "1px solid var(--border)",
              }}>
                ○ Last ~1,000 blocks
              </span>
            </div>
          </div>

          {/* ─── Balances Card ─────────────────────────────────────────── */}
          <div className="card section-gap">
            <div className="card-title">Balances</div>
            <div className="card-grid">
              <div className="metric">
                <div className="metric-label">CELO</div>
                <div className="metric-value green">{parseFloat(data.balances.celo).toFixed(4)}</div>
                <div className="metric-sub">
                  {data.celoUsdValue !== null ? `≈ $${data.celoUsdValue.toFixed(2)} USD` : "native"}
                </div>
              </div>
              <div className="metric">
                <div className="metric-label">USDC</div>
                <div className="metric-value">{parseFloat(data.balances.usdc).toFixed(2)}</div>
                <div className="metric-sub">stablecoin</div>
              </div>
              <div className="metric">
                <div className="metric-label">USDT</div>
                <div className="metric-value">{parseFloat(data.balances.usdt).toFixed(2)}</div>
                <div className="metric-sub">stablecoin</div>
              </div>
            </div>
          </div>

          {/* ─── Whale Breakdown ───────────────────────────────────────── */}
          {data.isWhale && data.whaleActivity.length > 0 && (
            <div className="card section-gap" style={{ borderLeft: "3px solid var(--crimson)" }}>
              <div className="card-title" style={{ color: "var(--crimson)" }}>
                ⚠ Whale Transfer Breakdown
              </div>
              <div className="transfers-list">
                {data.whaleActivity.map((t, i) => {
                  const celoscanLink = t.txHash
                    ? `https://celoscan.io/tx/${t.txHash}`
                    : `https://celoscan.io/address/${t.from || t.to}`;
                  return (
                    <div key={i} className="transfer-row whale">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>
                          {t.from ? `${t.from.slice(0, 8)}…${t.from.slice(-4)}` : "—"}
                          {" → "}
                          {t.to?.slice(0, 8)}…{t.to?.slice(-4)}
                        </div>
                        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)" }}>
                          Block {t.block}
                        </div>
                      </div>
                      <span className="transfer-amount whale">
                        ${parseFloat(t.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC
                      </span>
                      <span className="whale-tag">WHALE</span>
                      <a
                        href={celoscanLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tx-link"
                        style={{ fontSize: 11, fontWeight: 700 }}
                      >
                        View tx ↗
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Recent Transfers ──────────────────────────────────────── */}
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
                  const celoscanLink = t.txHash
                    ? `https://celoscan.io/tx/${t.txHash}`
                    : `https://celoscan.io/address/${t.from || t.to}`;
                  return (
                    <div key={i} className={`transfer-row ${isWhale ? "whale" : ""}`}>
                      <span className="transfer-to">
                        {t.from ? `${t.from.slice(0, 6)}…${t.from.slice(-4)}` : "—"}
                        {" → "}
                        {t.to?.slice(0, 6)}…{t.to?.slice(-4)}
                      </span>
                      <span className={`transfer-amount ${isWhale ? "whale" : ""}`}>
                        {parseFloat(t.amount).toLocaleString()} USDC
                      </span>
                      {isWhale && <span className="whale-tag">WHALE</span>}
                      <a href={celoscanLink} target="_blank" rel="noopener noreferrer" className="tx-link">↗</a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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