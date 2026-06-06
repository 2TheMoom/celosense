import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CeloSense — On-Chain Intelligence",
  description: "Autonomous wallet intelligence agent on Celo. Powered by AI.",
  other: {
    "talentapp:project_verification": "0bab0daec3e5be9d24c74c0833670944f1536a4c92b648e838a65de5ec39fdf0dc34e5561d3d2b790f86918434fe42ab506e9595e47a6916f821394c31682393",
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