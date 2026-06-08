"use client";

import React, { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { publicClient, REGISTRY_ADDRESS, REGISTRY_ABI } from "@/lib/celo";

export default function Landing() {
  const [totalRegistered, setTotalRegistered] = useState<string>("...");

  useEffect(() => {
    async function fetchTotal() {
      try {
        const total = await publicClient.readContract({
          address: REGISTRY_ADDRESS,
          abi: REGISTRY_ABI,
          functionName: "totalRegistered",
        }) as bigint;
        setTotalRegistered(total.toString());
      } catch {
        setTotalRegistered("—");
      }
    }
    fetchTotal();
  }, []);

  return (
    <div className="land">
      {/* Nav */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <div className="land-brand">
            <Logo size={28} />
            <span className="land-brand-name">CELOSENSE</span>
          </div>
          <div className="land-nav-links">
            <a href="https://celoscan.io/address/0xda0f76E12d9571f3fc62D3C65CFF1662E4235046#code" target="_blank" rel="noopener noreferrer" className="land-nav-link">Contract</a>
            <a href="https://github.com/2TheMoom/celosense" target="_blank" rel="noopener noreferrer" className="land-nav-link">GitHub</a>
            <a href="/app" className="land-btn-sm">Launch App</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="land-hero">
        <div className="land-hero-inner">
          <div className="land-hero-badge">
            <span className="land-badge-dot" />
            Live on Celo Mainnet · Chain ID 42220
          </div>
          <div className="land-hero-logo">
            <Logo size={96} />
          </div>
          <h1 className="land-h1">
            On-Chain Intelligence<br />for the Celo Ecosystem
          </h1>
          <p className="land-subhead">
            CeloSense is an autonomous agent that monitors wallet activity,
            flags whale movements, and delivers pay-per-query insights
            natively inside MiniPay.
          </p>
          <div className="land-hero-ctas">
            <a href="/app" className="land-btn-primary">Launch App</a>
            <a href="https://celoscan.io/address/0xda0f76E12d9571f3fc62D3C65CFF1662E4235046#code" target="_blank" rel="noopener noreferrer" className="land-btn-secondary">View Contract ↗</a>
          </div>
          <div className="land-stat-row">
            <div className="land-stat">
              <span className="land-stat-value">{totalRegistered}</span>
              <span className="land-stat-label">Registered Wallets</span>
            </div>
            <div className="land-stat-divider" />
            <div className="land-stat">
              <span className="land-stat-value">$0.01</span>
              <span className="land-stat-label">Per Query (USDC)</span>
            </div>
            <div className="land-stat-divider" />
            <div className="land-stat">
              <span className="land-stat-value">42220</span>
              <span className="land-stat-label">Celo Mainnet</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="land-section">
        <div className="land-section-inner">
          <div className="land-section-label">HOW IT WORKS</div>
          <h2 className="land-h2">Three steps to on-chain intelligence</h2>
          <div className="land-steps">
            <div className="land-step">
              <div className="land-step-num">01</div>
              <div className="land-step-icon">⬡</div>
              <h3 className="land-step-title">Connect</h3>
              <p className="land-step-body">Connect your wallet. Inside MiniPay, CeloSense detects and connects automatically — no button tap needed.</p>
            </div>
            <div className="land-step-arrow">→</div>
            <div className="land-step">
              <div className="land-step-num">02</div>
              <div className="land-step-icon">◈</div>
              <h3 className="land-step-title">Analyze</h3>
              <p className="land-step-body">Enter any Celo wallet address. Pay $0.01 USDC via x402 and get live balances, transfer history, and activity scoring.</p>
            </div>
            <div className="land-step-arrow">→</div>
            <div className="land-step">
              <div className="land-step-num">03</div>
              <div className="land-step-icon">⚑</div>
              <h3 className="land-step-title">Monitor</h3>
              <p className="land-step-body">Register your wallet on-chain. CeloSense flags whale activity, large transfers, and unusual movements in real time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="land-section land-section-alt">
        <div className="land-section-inner">
          <div className="land-section-label">FEATURES</div>
          <h2 className="land-h2">Built for the Celo ecosystem</h2>
          <div className="land-features">
            <div className="land-feature">
              <div className="land-feature-icon navy">⬡</div>
              <h3 className="land-feature-title">MiniPay Native</h3>
              <p className="land-feature-body">Detects MiniPay automatically and connects your wallet without friction. Built to the MiniPay Mini App spec.</p>
            </div>
            <div className="land-feature">
              <div className="land-feature-icon green">◈</div>
              <h3 className="land-feature-title">x402 Payments</h3>
              <p className="land-feature-body">Every intelligence query is gated by x402 micropayments — $0.01 USDC settled on-chain. No subscriptions, no API keys.</p>
            </div>
            <div className="land-feature">
              <div className="land-feature-icon crimson">⚠</div>
              <h3 className="land-feature-title">Whale Detection</h3>
              <p className="land-feature-body">Flags transfers over 10,000 USDC in real time. Activity scoring from 0-100 based on on-chain behavior.</p>
            </div>
            <div className="land-feature">
              <div className="land-feature-icon navy">⛓</div>
              <h3 className="land-feature-title">On-Chain Registry</h3>
              <p className="land-feature-body">Register your wallet in the CeloSenseRegistry contract on mainnet. Immutable, non-upgradeable, no admin keys.</p>
            </div>
            <div className="land-feature">
              <div className="land-feature-icon green">⬡</div>
              <h3 className="land-feature-title">Live Balances</h3>
              <p className="land-feature-body">Real-time CELO, USDC, and USDT balances pulled directly from Celo mainnet via viem. No intermediaries.</p>
            </div>
            <div className="land-feature">
              <div className="land-feature-icon crimson">◈</div>
              <h3 className="land-feature-title">Autonomous Agent</h3>
              <p className="land-feature-body">The backend runs autonomously — no manual input, no dashboard. Just on-chain data, processed and delivered.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="land-cta-banner">
        <div className="land-section-inner" style={{ textAlign: "center" }}>
          <Logo size={56} />
          <h2 className="land-h2" style={{ marginTop: 20 }}>Start analyzing wallets now</h2>
          <p className="land-subhead" style={{ maxWidth: 480, margin: "12px auto 28px" }}>
            Connect your wallet and query any address on Celo mainnet for $0.01 USDC.
          </p>
          <a href="/app" className="land-btn-primary">Launch App</a>
        </div>
      </section>

      {/* Footer */}
      <footer className="land-footer">
        <div className="land-footer-inner">
          <div className="land-brand">
            <Logo size={20} />
            <span className="land-brand-name" style={{ fontSize: 13 }}>CELOSENSE</span>
          </div>
          <div className="land-footer-links">
            <a href="https://celoscan.io/address/0xda0f76E12d9571f3fc62D3C65CFF1662E4235046#code" target="_blank" rel="noopener noreferrer" className="land-footer-link">Contract</a>
            <a href="https://github.com/2TheMoom/celosense" target="_blank" rel="noopener noreferrer" className="land-footer-link">GitHub</a>
            <a href="/app" className="land-footer-link">App</a>
          </div>
          <a
            href="https://x.com/olumi441"
            target="_blank"
            rel="noopener noreferrer"
            className="land-credit"
          >
            Built by Abu Olumi
          </a>
        </div>
      </footer>
    </div>
  );
}