import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CeloSense — Autonomous On-Chain Intelligence for Celo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#E9E6DF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#1A6B3C",
              boxShadow: "0 0 8px #1A6B3C",
            }}
          />
          <span style={{ color: "#1A6B3C", fontSize: "14px", letterSpacing: "2px" }}>
            CELO MAINNET · AGENT ACTIVE
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "80px",
              fontWeight: 800,
              color: "#161719",
              letterSpacing: "-1px",
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            CELOSENSE
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "#5A5A60",
              maxWidth: "700px",
              lineHeight: 1.4,
            }}
          >
            Autonomous on-chain intelligence for Celo. Whale detection, wallet scoring, and live decision logs — every 5 minutes.
          </div>
        </div>

        {/* Bottom stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: "48px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "32px", fontWeight: 800, color: "#1F3A8F" }}>$0.01</span>
            <span style={{ fontSize: "12px", color: "#5A5A60", letterSpacing: "1.5px" }}>PER QUERY</span>
          </div>
          <div style={{ width: "1px", height: "40px", background: "#D8D4CC" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "32px", fontWeight: 800, color: "#1F3A8F" }}>5 MIN</span>
            <span style={{ fontSize: "12px", color: "#5A5A60", letterSpacing: "1.5px" }}>AGENT CYCLE</span>
          </div>
          <div style={{ width: "1px", height: "40px", background: "#D8D4CC" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "32px", fontWeight: 800, color: "#B01C2E" }}>ERC-8004</span>
            <span style={{ fontSize: "12px", color: "#5A5A60", letterSpacing: "1.5px" }}>REGISTERED AGENT</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
            <span style={{ fontSize: "20px", fontWeight: 700, color: "#161719" }}>celosense.vercel.app</span>
            <span style={{ fontSize: "12px", color: "#5A5A60", letterSpacing: "1px" }}>Built by Abu Olumi · @olumi441</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}