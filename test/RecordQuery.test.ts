import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs.js";

describe("CeloSenseRegistry - recordQuery()", function () {
  let registry: any;
  let usdc: any;
  let owner: any;
  let querier: any;
  let target: any;
  let feeRecipient: any;
  let poorUser: any;

  const QUERY_PRICE = 10000n; // $0.01 (6 decimals)
  const DECISION_PRICE = 100n;
  const MINT_AMOUNT = 1_000_000n; // $1.00

  beforeEach(async function () {
    [owner, querier, target, feeRecipient, poorUser] = await ethers.getSigners();

    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();

    const Registry = await ethers.getContractFactory("CeloSenseRegistry");
    registry = await Registry.deploy(
      await usdc.getAddress(),
      feeRecipient.address,
      owner.address,
      QUERY_PRICE,
      DECISION_PRICE
    );
    await registry.waitForDeployment();

    await usdc.mint(querier.address, MINT_AMOUNT);
  });

  it("should revert if querier has not approved USDC", async function () {
    await expect(registry.connect(querier).recordQuery(target.address))
      .to.be.revertedWith("insufficient allowance");
  });

  it("should record a query and transfer USDC to feeRecipient", async function () {
    await usdc.connect(querier).approve(await registry.getAddress(), QUERY_PRICE);

    await expect(registry.connect(querier).recordQuery(target.address))
      .to.emit(registry, "QueryRecorded");

    expect(await usdc.balanceOf(feeRecipient.address)).to.equal(QUERY_PRICE);
    expect(await usdc.balanceOf(querier.address)).to.equal(MINT_AMOUNT - QUERY_PRICE);
  });

  it("should increment queryCount for the querier", async function () {
    await usdc.connect(querier).approve(await registry.getAddress(), QUERY_PRICE * 2n);

    await registry.connect(querier).recordQuery(target.address);
    await registry.connect(querier).recordQuery(target.address);

    expect(await registry.queryCount(querier.address)).to.equal(2n);
  });

  it("should increment totalQueries", async function () {
    await usdc.connect(querier).approve(await registry.getAddress(), QUERY_PRICE);

    const before = await registry.totalQueries();
    await registry.connect(querier).recordQuery(target.address);
    const after = await registry.totalQueries();

    expect(after).to.equal(before + 1n);
  });

  it("should revert if querier has insufficient USDC balance", async function () {
    await usdc.connect(poorUser).approve(await registry.getAddress(), QUERY_PRICE);

    await expect(registry.connect(poorUser).recordQuery(target.address))
      .to.be.revertedWith("insufficient balance");
  });

  it("should emit QueryRecorded with correct querier and target addresses", async function () {
    await usdc.connect(querier).approve(await registry.getAddress(), QUERY_PRICE);

    await expect(registry.connect(querier).recordQuery(target.address))
      .to.emit(registry, "QueryRecorded")
      .withArgs(querier.address, target.address, anyValue);
  });
});