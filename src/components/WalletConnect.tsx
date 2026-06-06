"use client";

import { useConnect, useDisconnect, useAccount } from "wagmi";
import { injected } from "wagmi/connectors";

interface Props { large?: boolean; }

export function WalletConnect({ large }: Props) {
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  if (isConnected && address) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--muted)" }}>
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button className="btn btn-secondary" onClick={() => disconnect()}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      className={`btn btn-primary ${large ? "btn-large" : ""}`}
      onClick={() => connect({ connector: injected() })}
      disabled={isPending}
    >
      {isPending ? <><span className="spinner" /> Connecting…</> : <>◈ Connect Wallet</>}
    </button>
  );
}