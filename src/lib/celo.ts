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

export const FEE_ADAPTERS = {
  USDC: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B" as `0x${string}`,
  USDT: "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72" as `0x${string}`,
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
] as const;