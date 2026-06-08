import pkg from "hardhat";
const { ethers, network } = pkg;

// Celo mainnet USDC
const USDC = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
// $0.01 USDC = 10000 raw units (6 decimals)
const QUERY_PRICE = 10000n;

async function main() {
  const signers = await ethers.getSigners();
  if (signers.length === 0) throw new Error("No signers — check DEPLOYER_PRIVATE_KEY");

  const [deployer] = signers;
  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;

  console.log("Network:", network.name);
  console.log("Deploying with:", deployer.address);
  console.log("Fee recipient:", feeRecipient);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "CELO"
  );

  const Registry = await ethers.getContractFactory("CeloSenseRegistry");
  const registry = await Registry.deploy(USDC, feeRecipient, QUERY_PRICE);
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("\n✅ CeloSenseRegistry deployed to:", address);
  console.log("🔍 Verify:");
  console.log(`   npx hardhat verify --network celo ${address} "${USDC}" "${feeRecipient}" "10000"`);
  console.log("\nAdd to .env.local:");
  console.log(`NEXT_PUBLIC_REGISTRY_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});