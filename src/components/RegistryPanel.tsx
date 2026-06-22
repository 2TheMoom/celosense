"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/celo";

interface Props {
  address: `0x${string}`;
}

interface RegistryStatus {
  isRegistered: boolean;
  registeredAt: string | null;
  totalRegistered: string;
  queryCount: string;
}

interface Registration {
  wallet: string;
  timestamp: string;
  txHash: string;
  blockNumber: string;
  isActive: boolean;
}

export function RegistryPanel({ address }: Props) {
  const [status, setStatus] = useState<RegistryStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [feed, setFeed] = useState<Registration[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);

  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/register?address=${address}`);
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchFeed = async () => {
    setFeedLoading(true);
    try {
      const res = await fetch("/api/registry/feed");
      const data = await res.json();
      setFeed(data.registrations || []);
    } catch (e) {
      console.error(e);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchFeed();
  }, [address]);

  useEffect(() => {
    if (isSuccess) {
      fetchStatus();
      fetchFeed();
    }
  }, [isSuccess]);

  const handleRegister = () => {
    writeContract({
      address: REGISTRY_ADDRESS,
      abi: REGISTRY_ABI,
      functionName: "register",
    });
  };

  const handleDeregister = () => {
    writeContract({
      address: REGISTRY_ADDRESS,
      abi: REGISTRY_ABI,
      functionName: "deregister",
    });
  };

  const isTxPending = isPending || isConfirming;

  return (
    <div>
      <div className="card">
        <div className="card-title">CeloSense Registry</div>
        {statusLoading ? (
          <div className="loading-text">Checking registry…</div>
        ) : status ? (
          <>
            <div className="registry-status">
              <div className={`reg-dot ${status.isRegistered ? "on" : "off"}`} />
              <div className="reg-info">
                <div className={`reg-label ${status.isRegistered ? "on" : "off"}`}>
                  {status.isRegistered ? "REGISTERED" : "NOT REGISTERED"}
                </div>
                <div className="reg-sub">
                  {status.isRegistered && status.registeredAt
                    ? `Since ${new Date(status.registeredAt).toLocaleDateString()}`
                    : "Register to enable monitoring for your wallet"}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div className="metric-label" style={{ marginBottom: 4 }}>Total Registered Wallets</div>
              <div className="metric-value green">{status.totalRegistered}</div>
            </div>

            {status.isRegistered && status.registeredAt && (
              <div className="card-grid" style={{ marginBottom: 20 }}>
                <div className="metric">
                  <div className="metric-label">Days Registered</div>
                  <div className="metric-value navy">
                    {Math.max(0, Math.floor((Date.now() - new Date(status.registeredAt).getTime()) / (1000 * 60 * 60 * 24)))}
                  </div>
                  <div className="metric-sub">since {new Date(status.registeredAt).toLocaleDateString()}</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Your Queries</div>
                  <div className="metric-value">{status.queryCount}</div>
                  <div className="metric-sub">paid on-chain</div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {!status.isRegistered ? (
                <button className="btn btn-primary" onClick={handleRegister} disabled={isTxPending}>
                  {isTxPending ? <><span className="spinner" /> {isConfirming ? "Confirming…" : "Submitting…"}</> : <>◈ Register Wallet</>}
                </button>
              ) : (
                <button className="btn btn-danger" onClick={handleDeregister} disabled={isTxPending}>
                  {isTxPending ? <><span className="spinner" /> {isConfirming ? "Confirming…" : "Submitting…"}</> : <>✕ Deregister</>}
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => { fetchStatus(); fetchFeed(); }}>↻ Refresh</button>
            </div>

            {isSuccess && txHash && (
              <div className="alert alert-green" style={{ marginTop: 14 }}>
                <span className="alert-icon">✓</span>
                <div>Transaction confirmed. <a href={`https://celoscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="tx-link">View on Celoscan ↗</a></div>
              </div>
            )}
            {writeError && <div className="error-text" style={{ marginTop: 12 }}>{writeError.message.slice(0, 120)}</div>}
          </>
        ) : (
          <div className="error-text">Could not load registry status</div>
        )}
      </div>

      {/* ─── Live Registration Feed ────────────────────────────────────── */}
      <div className="card section-gap">
        <div className="card-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Recent Registrations</span>
          <button className="btn btn-secondary" onClick={fetchFeed} style={{ padding: "4px 10px", fontSize: 11 }}>↻ Refresh</button>
        </div>

        {feedLoading ? (
          <div className="loading-text">Loading registrations…</div>
        ) : feed.length === 0 ? (
          <div className="empty-text">No registrations found in the monitored window.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {feed.slice(0, 20).map((reg, i) => {
              const isYou = reg.wallet?.toLowerCase() === address?.toLowerCase();
              const date = reg.timestamp ? new Date(parseInt(reg.timestamp) * 1000).toLocaleString() : "—";
              return (
                <div key={i} style={{
                  padding: "10px 14px",
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderLeft: isYou ? "3px solid var(--navy)" : reg.isActive ? "3px solid var(--green)" : "3px solid var(--border2)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a href={`https://celoscan.io/address/${reg.wallet}`} target="_blank" rel="noopener noreferrer" style={{
                      fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700,
                      color: isYou ? "var(--navy)" : "var(--text)", textDecoration: "none",
                    }}>
                      {reg.wallet?.slice(0, 10)}…{reg.wallet?.slice(-6)}
                      {isYou && <span style={{ marginLeft: 6, color: "var(--navy)", fontSize: 10 }}>(you)</span>}
                    <button
                      onClick={() => navigator.clipboard.writeText(reg.wallet)}
                      style={{ marginLeft: 6, background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 10, fontFamily: "var(--mono)", padding: "0 4px" }}
                      title="Copy address"
                    >⎘</button>
                    </a>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", marginTop: 2 }}>{date}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    <span style={{
                      fontFamily: "var(--mono)", fontSize: 10, padding: "2px 7px", borderRadius: 2,
                      background: reg.isActive ? "rgba(26,107,60,0.08)" : "rgba(160,160,168,0.1)",
                      color: reg.isActive ? "var(--green)" : "var(--faint)",
                      border: `1px solid ${reg.isActive ? "rgba(26,107,60,0.3)" : "var(--border)"}`,
                      textTransform: "uppercase", letterSpacing: 0.5,
                    }}>
                      {reg.isActive ? "Active" : "Inactive"}
                    </span>
                    {reg.txHash && (
                      <a href={`https://celoscan.io/tx/${reg.txHash}`} target="_blank" rel="noopener noreferrer" className="tx-link" style={{ fontSize: 10 }}>↗</a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: 12, fontSize: 11, color: "var(--faint)", fontFamily: "var(--mono)" }}>
          Showing recent registrations · powered by CeloSenseRegistry on-chain events
        </div>
      </div>

      {/* ─── How it works ─────────────────────────────────────────────── */}
      <div className="card section-gap" style={{ opacity: 0.85 }}>
        <div className="card-title">How the Registry Works</div>
        <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
          <p style={{ marginBottom: 8 }}>
            Registering writes your wallet to <span className="mono" style={{ color: "var(--text)", fontSize: 12 }}>CeloSenseRegistry</span> on Celo mainnet — a permanent, verifiable on-chain credential.
          </p>
          <p>Non-upgradeable, no admin keys. Registration costs only gas.</p>
        </div>
        <div style={{ marginTop: 14 }}>
          <a href={`https://celoscan.io/address/${REGISTRY_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="tx-link" style={{ fontSize: 12 }}>
            View contract on Celoscan ↗
          </a>
        </div>
      </div>
    </div>
  );
}