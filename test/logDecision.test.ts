import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs.js";

describe("CeloSenseRegistry - logDecision()", function () {
  let registry: any;
  let usdc: any;
  let owner: any;
  let agent: any;
  let nonAgent: any;
  let target: any;
  let feeRecipient: any;

  const QUERY_PRICE = 10000n;
  const DECISION_PRICE = 100n;
  const MINT_AMOUNT = 1_000_000n;

  beforeEach(async function () {
    [owner, agent, nonAgent, target, feeRecipient] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    const Registry = await ethers.getContractFactory("CeloSenseRegistry");
    registry = await Registry.deploy(
      await usdc.getAddress(),
      feeRecipient.address,
      agent.address,
      QUERY_PRICE,
      DECISION_PRICE
    );
    await registry.waitForDeployment();

    await usdc.mint(agent.address, MINT_AMOUNT);
    await usdc.mint(nonAgent.address, MINT_AMOUNT);
  });

  it("should revert if called by a non-agent wallet", async function () {
    await usdc.connect(nonAgent).approve(await registry.getAddress(), DECISION_PRICE);

    await expect(
      registry.connect(nonAgent).logDecision("NORMAL", target.address, 20)
    ).to.be.revertedWithCustomError(registry, "Unauthorized");
  });

  it("should allow the agent wallet to log a decision", async function () {
    await usdc.connect(agent).approve(await registry.getAddress(), DECISION_PRICE);

    await expect(
      registry.connect(agent).logDecision("NORMAL", target.address, 20)
    ).to.emit(registry, "DecisionLogged")
      .withArgs(agent.address, "NORMAL", target.address, 20n, anyValue);
  });

  it("should transfer decisionPrice in USDC to feeRecipient", async function () {
    await usdc.connect(agent).approve(await registry.getAddress(), DECISION_PRICE);
    await registry.connect(agent).logDecision("NORMAL", target.address, 20);

    expect(await usdc.balanceOf(feeRecipient.address)).to.equal(DECISION_PRICE);
  });

  it("should increment totalDecisions", async function () {
    await usdc.connect(agent).approve(await registry.getAddress(), DECISION_PRICE * 2n);

    const before = await registry.totalDecisions();
    await registry.connect(agent).logDecision("NORMAL", target.address, 20);
    await registry.connect(agent).logDecision("WHALE_DETECTED", target.address, 60);
    const after = await registry.totalDecisions();

    expect(after).to.equal(before + 2n);
  });

  it("should revert if agent has not approved USDC", async function () {
    await expect(
      registry.connect(agent).logDecision("NORMAL", target.address, 20)
    ).to.be.revertedWith("insufficient allowance");
  });

  it("should allow the owner to update the agent wallet via setAgentWallet", async function () {
    await registry.connect(owner).setAgentWallet(nonAgent.address);

    await usdc.connect(nonAgent).approve(await registry.getAddress(), DECISION_PRICE);

    await expect(
      registry.connect(nonAgent).logDecision("NORMAL", target.address, 20)
    ).to.emit(registry, "DecisionLogged");

    await usdc.connect(agent).approve(await registry.getAddress(), DECISION_PRICE);
    await expect(
      registry.connect(agent).logDecision("NORMAL", target.address, 20)
    ).to.be.revertedWithCustomError(registry, "Unauthorized");
  });

  it("should revert setAgentWallet if called by non-owner", async function () {
    await expect(
      registry.connect(nonAgent).setAgentWallet(nonAgent.address)
    ).to.be.revertedWithCustomError(registry, "Unauthorized");
  });

  it("should revert setAgentWallet with zero address", async function () {
    await expect(
      registry.connect(owner).setAgentWallet(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(registry, "ZeroAddress");
  });
});