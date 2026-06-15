import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("CeloSenseRegistry - register()", function () {
  let registry: any;
  let owner: any;
  let user1: any;
  let user2: any;

  const USDC_PLACEHOLDER = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
  const QUERY_PRICE = 10000n;
  const DECISION_PRICE = 100n;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("CeloSenseRegistry");
    registry = await Registry.deploy(
      USDC_PLACEHOLDER,
      owner.address,
      owner.address,
      QUERY_PRICE,
      DECISION_PRICE
    );
    await registry.waitForDeployment();
  });

  it("should allow a wallet to register", async function () {
    await expect(registry.connect(user1).register())
      .to.emit(registry, "WalletRegistered");

    const [isRegistered, timestamp] = await registry.getStatus(user1.address);
    expect(isRegistered).to.equal(true);
    expect(timestamp).to.be.gt(0);
  });

  it("should increment totalRegistered", async function () {
    const before = await registry.totalRegistered();
    await registry.connect(user1).register();
    const after = await registry.totalRegistered();
    expect(after).to.equal(before + 1n);
  });

  it("should revert if wallet is already registered", async function () {
    await registry.connect(user1).register();
    await expect(registry.connect(user1).register())
      .to.be.revertedWithCustomError(registry, "AlreadyRegistered");
  });

  it("should allow multiple different wallets to register independently", async function () {
    await registry.connect(user1).register();
    await registry.connect(user2).register();

    const [isReg1] = await registry.getStatus(user1.address);
    const [isReg2] = await registry.getStatus(user2.address);

    expect(isReg1).to.equal(true);
    expect(isReg2).to.equal(true);
    expect(await registry.totalRegistered()).to.equal(2n);
  });

  it("should record registeredAt timestamp matching block.timestamp", async function () {
    const tx = await registry.connect(user1).register();
    const receipt = await tx.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);

    const [, timestamp] = await registry.getStatus(user1.address);
    expect(timestamp).to.equal(block!.timestamp);
  });
});