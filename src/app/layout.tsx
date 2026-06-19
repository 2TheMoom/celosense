import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

const BASE_URL = "https://celosense.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "CeloSense — Autonomous On-Chain Intelligence for Celo",
  description:
    "Autonomous on-chain intelligence agent for Celo. Detects whale movements, scores wallet activity, and logs decisions on-chain every 5 minutes. Pay-per-query via x402. Registered on ERC-8004.",
  keywords: [
    "Celo",
    "on-chain intelligence",
    "whale detection",
    "autonomous agent",
    "MiniPay",
    "x402",
    "ERC-8004",
    "DeFi",
    "wallet analytics",
  ],
  authors: [{ name: "Abu Olumi", url: "https://x.com/olumi441" }],
  creator: "Abu Olumi",
  openGraph: {
    type: "website",
    url: BASE_URL,
    title: "CeloSense — Autonomous On-Chain Intelligence for Celo",
    description:
      "Whale detection, wallet scoring, and live decision logs — every 5 minutes, fully on-chain.",
    siteName: "CeloSense",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CeloSense — Autonomous On-Chain Intelligence for Celo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CeloSense — Autonomous On-Chain Intelligence for Celo",
    description:
      "Whale detection, wallet scoring, and live decision logs — every 5 minutes, fully on-chain.",
    creator: "@olumi441",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}