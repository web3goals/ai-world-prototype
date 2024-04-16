import {
  loadFixture,
  time,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { expect } from "chai";

describe("App", function () {
  async function initFixture() {
    // Get signers
    const [deployer, userOne, userTwo, userThree] = await ethers.getSigners();
    // Deploy contracts
    const usdTokenContractFactory = await ethers.getContractFactory("USDToken");
    const usdTokenContract = await usdTokenContractFactory.deploy();
    const appContractFactory = await ethers.getContractFactory("App");
    const appContract = await appContractFactory.deploy();
    // Send usd tokens to users
    await usdTokenContract
      .connect(deployer)
      .transfer(userOne, ethers.parseEther("100"));
    await usdTokenContract
      .connect(deployer)
      .transfer(userTwo, ethers.parseEther("50"));
    await usdTokenContract
      .connect(deployer)
      .transfer(userThree, ethers.parseEther("10"));
    return {
      deployer,
      userOne,
      userTwo,
      userThree,
      usdTokenContract,
      appContract,
    };
  }

  it("Should support the main flow", async function () {
    const { userOne, userTwo, userThree, usdTokenContract, appContract } =
      await loadFixture(initFixture);
    // Create app
    await expect(appContract.connect(userOne).create("ipfs://1")).to.be.not
      .reverted;
    const appId = (await appContract.getNextTokenId()) - 1n;
    // Set params
    await expect(
      appContract
        .connect(userOne)
        .setParams(appId, ethers.parseEther("2"), usdTokenContract.getAddress())
    ).to.be.not.reverted;
    // Approve
    await expect(
      usdTokenContract
        .connect(userTwo)
        .approve(appContract.getAddress(), ethers.MaxUint256)
    ).to.be.not.reverted;
    // Unlock
    await expect(
      appContract.connect(userTwo).unlock(appId)
    ).to.changeTokenBalances(
      usdTokenContract,
      [userTwo, appContract],
      [ethers.parseEther("-2"), ethers.parseEther("2")]
    );
    // Check user
    expect(await appContract.isUser(appId, userTwo)).to.be.equal(true);
    // Withraw
    await expect(
      appContract.connect(userOne).withdraw(appId, userThree)
    ).to.changeTokenBalances(
      usdTokenContract,
      [userThree, appContract],
      [ethers.parseEther("2"), ethers.parseEther("-2")]
    );
  });
});
