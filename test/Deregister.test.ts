import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("CeloSenseRegistry - deregister()", function () {
  let registry: any;
  let owner: any;
  let user1: any;

  const USDC_PLACEHOLDER = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";
  const QUERY_PRICE = 10000n;
  const DECISION_PRICE = 100n;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

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

  it("should revert if wallet is not registered", async function () {
    await expect(registry.connect(user1).deregister())
      .to.be.revertedWithCustomError(registry, "NotRegistered");
  });

  it("should allow a registered wallet to deregister", async function () {
    await registry.connect(user1).register();

    await expect(registry.connect(user1).deregister())
      .to.emit(registry, "WalletDeregistered");

    const [isRegistered, timestamp] = await registry.getStatus(user1.address);
    expect(isRegistered).to.equal(false);
    expect(timestamp).to.equal(0n);
  });

  it("should decrement totalRegistered", async function () {
    await registry.connect(user1).register();
    const before = await registry.totalRegistered();

    await registry.connect(user1).deregister();
    const after = await registry.totalRegistered();

    expect(after).to.equal(before - 1n);
  });

  it("should revert if deregistering twice", async function () {
    await registry.connect(user1).register();
    await registry.connect(user1).deregister();

    await expect(registry.connect(user1).deregister())
      .to.be.revertedWithCustomError(registry, "NotRegistered");
  });

  it("should allow re-registration after deregistering", async function () {
    await registry.connect(user1).register();
    await registry.connect(user1).deregister();

    await expect(registry.connect(user1).register())
      .to.emit(registry, "WalletRegistered");

    const [isRegistered] = await registry.getStatus(user1.address);
    expect(isRegistered).to.equal(true);
  });
});