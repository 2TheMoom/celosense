"use client";

import { useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from "wagmi";
import { USDC_ADDRESS, USDC_ABI, QUERY_PRICE } from "@/lib/usdc";

const FEE_RECIPIENT = (process.env.NEXT_PUBLIC_FEE_RECIPIENT || "0x701F6eab7854509A578143f51b2AEc5BcC308De7") as `0x${string}`;

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
  const [step, setStep] = useState<"idle" | "paying" | "confirming" | "fetching">("idle");

  const { writeContractAsync } = useWriteContract();

  const fetchIntelligence = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Step 1: Send $0.01 USDC to FEE_RECIPIENT
      setStep("paying");
      const txHash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [FEE_RECIPIENT, QUERY_PRICE],
      });

      // Step 2: Wait briefly for tx to land
      setStep("confirming");
      await new Promise((res) => setTimeout(res, 3000));

      // Step 3: Fetch intelligence with tx hash as proof
      setStep("fetching");
      const res = await fetch(`/api/intelligence?address=${queryAddress}`, {
        headers: {
          "X-PAYMENT": txHash,
        },
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
      } else if (e.message?.includes("insufficient")) {
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
    if (step === "paying") return <><span className="spinner" /> Approve payment…</>;
    if (step === "confirming") return <><span className="spinner" /> Confirming tx…</>;
    if (step === "fetching") return <><span className="spinner" /> Fetching data…</>;
    return <><span className="spinner" /> Loading…</>;
  };

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
            style={{ flex: 1 }}
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
          Each query costs $0.01 USDC · paid on-chain from your wallet
        </div>
      </div>

      {error && <div className="error-text">{error}</div>}

      {data && (
        <>
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

          <div className="card section-gap">
            <div className="card-title">Balances</div>
            <div className="card-grid">
              <div className="metric">
                <div className="metric-label">CELO</div>
                <div className="metric-value green">{parseFloat(data.balances.celo).toFixed(4)}</div>
                <div className="metric-sub">native</div>
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
              <div className="metric">
                <div className="metric-label">Activity Score</div>
                <div className={`metric-value ${data.activityScore > 60 ? "navy" : data.activityScore > 30 ? "green" : ""}`}>
                  {data.activityScore}
                  <span style={{ fontSize: 14, color: "var(--muted)" }}>/100</span>
                </div>
                <div className="score-bar-wrap">
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{ width: `${data.activityScore}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                      <span className="transfer-to">→ {t.to?.slice(0, 8)}…{t.to?.slice(-4)}</span>
                      <span className={`transfer-amount ${isWhale ? "whale" : ""}`}>
                        {parseFloat(t.amount).toLocaleString()} USDC
                      </span>
                      {isWhale && <span className="whale-tag">WHALE</span>}
                      {t.txHash && (
                        <a href={`https://celoscan.io/tx/${t.txHash}`} target="_blank" rel="noopener noreferrer" className="tx-link">↗</a>
                      )}
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