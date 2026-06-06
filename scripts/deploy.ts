import pkg from "hardhat";
const { ethers, network } = pkg;

async function main() {
  console.log("Network:", network.name);
  console.log("RPC:", network.config);

  const signers = await ethers.getSigners();
  console.log("Signers count:", signers.length);

  if (signers.length === 0) {
    throw new Error("No signers found — DEPLOYER_PRIVATE_KEY not loaded");
  }

  const [deployer] = signers;
  console.log("Deploying with:", deployer.address);
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
  console.log(`NEXT_PUBLIC_REGISTRY_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});