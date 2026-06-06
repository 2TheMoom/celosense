import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CeloSenseRegistry with:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "CELO"
  );

  const Registry = await ethers.getContractFactory("CeloSenseRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("\n✅ CeloSenseRegistry deployed to:", address);
  console.log("🔍 Verify on Celoscan:");
  console.log(`   npx hardhat verify --network celo ${address}`);
  console.log("\nAdd this to your .env.local:");
  console.log(`NEXT_PUBLIC_REGISTRY_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});