"use client";

import React, { useState, useEffect } from "react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { WalletConnect } from "@/components/WalletConnect";
import { IntelligencePanel } from "@/components/IntelligencePanel";
import { RegistryPanel } from "@/components/RegistryPanel";
import { Logo } from "@/components/Logo";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { isMiniPay, isDetecting, address, isConnected } = useMiniPay();
  const [activeTab, setActiveTab] = useState<"intelligence" | "registry">("intelligence");

  useEffect(() => { setMounted(true); }, []);

  return (
    <main className="app">
      <header className="header">
        <div className="header-left">
          <a href="/landing" style={{ textDecoration: "none" }}>
            <div className="logo">
              <Logo size={36} />
              <span className="logo-text">CeloSense</span>
            </div>
          </a>
          <span className="tagline">on-chain intelligence</span>
        </div>
        <div className="header-right">
          {mounted && isMiniPay && (
            <span className="minipay-badge">
              <span className="badge-dot" />
              MiniPay
            </span>
          )}
          {mounted && !isMiniPay && !isDetecting && <WalletConnect />}
        </div>
      </header>

      <div className="statusbar">
        <div className="status-item">
          <span className="status-dot active" />
          <span>Celo Mainnet</span>
        </div>
        <div className="status-item">
          <span className="status-label">Chain ID</span>
          <span className="status-value">42220</span>
        </div>
        {mounted && address && (
          <div className="status-item">
            <span className="status-label">Wallet</span>
            <span className="status-value mono">
              {address.slice(0, 6)}…{address.slice(-4)}
            </span>
          </div>
        )}
        <div className="status-item ml-auto">
          <span className="status-label">Agent</span>
          <span className="status-value active-text">ACTIVE</span>
        </div>
      </div>

      {mounted && !isConnected && !isDetecting && (
        <div className="connect-prompt">
          <div className="connect-inner">
            <Logo size={64} />
            <h2>Connect to CeloSense</h2>
            <p>Connect your wallet to access on-chain intelligence for the Celo ecosystem.</p>
            <WalletConnect large />
          </div>
        </div>
      )}

      {mounted && isConnected && address && (
        <>
          <div className="tabs">
            <button
              className={`tab ${activeTab === "intelligence" ? "active" : ""}`}
              onClick={() => setActiveTab("intelligence")}
            >
              <span className="tab-icon">⬡</span> Intelligence
            </button>
            <button
              className={`tab ${activeTab === "registry" ? "active" : ""}`}
              onClick={() => setActiveTab("registry")}
            >
              <span className="tab-icon">◈</span> Registry
            </button>
          </div>
          <div className="content">
            {activeTab === "intelligence" && (
              <IntelligencePanel address={address} isMiniPay={isMiniPay} />
            )}
            {activeTab === "registry" && (
              <RegistryPanel address={address} />
            )}
          </div>
        </>
      )}

      <a
        href="https://x.com/olumi441"
        target="_blank"
        rel="noopener noreferrer"
        className="credit-tag"
        style={{ display: "block", textDecoration: "none" }}
      >
        Abu Olumi
      </a>
    </main>
  );
}