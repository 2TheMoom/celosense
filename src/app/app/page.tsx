"use client";

import React, { useState, useEffect } from "react";
import { useMiniPay } from "@/hooks/useMiniPay";
import { WalletConnect } from "@/components/WalletConnect";
import { IntelligencePanel } from "@/components/IntelligencePanel";
import { RegistryPanel } from "@/components/RegistryPanel";
import { AgentPanel } from "@/components/AgentPanel";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { Logo } from "@/components/Logo";
import { publicClient, REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/celo";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { isMiniPay, isDetecting, address, isConnected } = useMiniPay();
  const [activeTab, setActiveTab] = useState<"intelligence" | "registry" | "agent" | "leaderboard">("intelligence");
  const [totalDecisions, setTotalDecisions] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Fetch total decisions for status bar
    async function fetchDecisions() {
      try {
        const total = await publicClient.readContract({
          address: REGISTRY_ADDRESS,
          abi: REGISTRY_ABI,
          functionName: "totalDecisions",
        }) as bigint;
        setTotalDecisions(total.toString());
      } catch {
        setTotalDecisions(null);
      }
    }
    fetchDecisions();
    // Refresh every 5 minutes in sync with agent cycle
    const interval = setInterval(fetchDecisions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
        {totalDecisions !== null && (
          <div className="status-item">
            <span className="status-label">Decisions</span>
            <span className="status-value" style={{ color: "#4ade80" }}>{totalDecisions}</span>
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
            <button
              className={`tab ${activeTab === "agent" ? "active" : ""}`}
              onClick={() => setActiveTab("agent")}
            >
              <span className="tab-icon">⚙</span> Agent
            </button>
            <button
              className={`tab ${activeTab === "leaderboard" ? "active" : ""}`}
              onClick={() => setActiveTab("leaderboard")}
            >
              <span className="tab-icon">🐋</span> Leaderboard
            </button>
          </div>
          <div className="content">
            {activeTab === "intelligence" && (
              <IntelligencePanel address={address} isMiniPay={isMiniPay} />
            )}
            {activeTab === "registry" && (
              <RegistryPanel address={address} />
            )}
            {activeTab === "agent" && (
              <AgentPanel />
            )}
            {activeTab === "leaderboard" && (
              <LeaderboardPanel />
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