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
}

export function RegistryPanel({ address }: Props) {
  const [status, setStatus] = useState<RegistryStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

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

  useEffect(() => {
    fetchStatus();
  }, [address]);

  // Refetch after successful tx
  useEffect(() => {
    if (isSuccess) fetchStatus();
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

        {/* Registration status */}
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

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {!status.isRegistered ? (
                <button
                  className="btn btn-primary"
                  onClick={handleRegister}
                  disabled={isTxPending}
                >
                  {isTxPending ? (
                    <><span className="spinner" /> {isConfirming ? "Confirming…" : "Submitting…"}</>
                  ) : (
                    <>◈ Register Wallet</>
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-danger"
                  onClick={handleDeregister}
                  disabled={isTxPending}
                >
                  {isTxPending ? (
                    <><span className="spinner" /> {isConfirming ? "Confirming…" : "Submitting…"}</>
                  ) : (
                    <>✕ Deregister</>
                  )}
                </button>
              )}
              <button className="btn btn-secondary" onClick={fetchStatus}>
                ↻ Refresh
              </button>
            </div>

            {isSuccess && txHash && (
              <div className="alert alert-green" style={{ marginTop: 14 }}>
                <span className="alert-icon">✓</span>
                <div>
                  Transaction confirmed.{" "}
                  <a
                    href={`https://celoscan.io/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tx-link"
                  >
                    View on Celoscan ↗
                  </a>
                </div>
              </div>
            )}

            {writeError && (
              <div className="error-text" style={{ marginTop: 12 }}>
                {writeError.message.slice(0, 120)}
              </div>
            )}
          </>
        ) : (
          <div className="error-text">Could not load registry status</div>
        )}
      </div>

      {/* Info */}
      <div className="card section-gap" style={{ borderColor: "var(--border)", opacity: 0.85 }}>
        <div className="card-title">How the Registry Works</div>
        <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
          <p style={{ marginBottom: 8 }}>
            Registering writes your wallet address to the{" "}
            <span className="mono" style={{ color: "var(--text)", fontSize: 12 }}>CeloSenseRegistry</span>{" "}
            smart contract on Celo mainnet. This creates a public on-chain credential
            that flags your wallet for active monitoring.
          </p>
          <p>
            The contract is minimal, non-upgradeable, and has no admin keys.
            Registration and deregistration cost only gas (paid in USDC via fee abstraction).
          </p>
        </div>
        <div style={{ marginTop: 14 }}>
          <a
            href={`https://celoscan.io/address/${REGISTRY_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tx-link"
            style={{ fontSize: 12 }}
          >
            View contract on Celoscan ↗
          </a>
        </div>
      </div>
    </div>
  );
}
