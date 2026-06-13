import { createPublicClient, createWalletClient, http, custom } from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

export const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org"),
});

export function getAgentWalletClient() {
  if (!process.env.AGENT_PRIVATE_KEY) throw new Error("AGENT_PRIVATE_KEY not set");
  const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);
  return createWalletClient({
    account,
    chain: celo,
    transport: http("https://forno.celo.org"),
  });
}

export function getMiniPayWalletClient() {
  if (typeof window === "undefined" || !(window as any).ethereum) return null;
  return createWalletClient({
    chain: celo,
    transport: custom((window as any).ethereum),
  });
}

export const TOKENS = {
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as `0x${string}`,
  USDT: "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e" as `0x${string}`,
  USDm: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as `0x${string}`,
} as const;

export const REGISTRY_ADDRESS = (
  process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

export const REGISTRY_ABI = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "deregister",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "recordQuery",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "target", type: "address" }],
    outputs: [],
  },
  {
    name: "logDecision",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "decisionType", type: "string" },
      { name: "target", type: "address" },
      { name: "score", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getStatus",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [
      { name: "isRegistered", type: "bool" },
      { name: "timestamp", type: "uint256" },
    ],
  },
  {
    name: "totalRegistered",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalQueries",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalDecisions",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "queryCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "WalletRegistered",
    type: "event",
    inputs: [
      { name: "wallet", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "QueryRecorded",
    type: "event",
    inputs: [
      { name: "querier", type: "address", indexed: true },
      { name: "target", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "DecisionLogged",
    type: "event",
    inputs: [
      { name: "agent", type: "address", indexed: true },
      { name: "decisionType", type: "string", indexed: false },
      { name: "target", type: "address", indexed: true },
      { name: "score", type: "uint256", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;