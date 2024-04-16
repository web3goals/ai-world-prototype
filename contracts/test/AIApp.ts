import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("AIApp", function () {
  async function initFixture() {
    // Get signers
    const [deployer, userOne, userTwo, userThree] = await ethers.getSigners();
    // Deploy contracts
    const usdTokenContractFactory = await ethers.getContractFactory("USDToken");
    const usdTokenContract = await usdTokenContractFactory.deploy();
    const aiAppContractFactory = await ethers.getContractFactory("AIApp");
    const aiAppContract = await aiAppContractFactory.deploy();
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
      aiAppContract,
    };
  }

  it("Should support the main flow", async function () {
    const { userOne, userTwo, userThree, usdTokenContract, aiAppContract } =
      await loadFixture(initFixture);
    // Create ai app
    await expect(aiAppContract.connect(userOne).create("ipfs://1")).to.be.not
      .reverted;
    const aiAppId = (await aiAppContract.getNextTokenId()) - 1n;
    // Set params
    await expect(
      aiAppContract
        .connect(userOne)
        .setParams(
          aiAppId,
          ethers.parseEther("2"),
          usdTokenContract.getAddress()
        )
    ).to.be.not.reverted;
    // Approve
    await expect(
      usdTokenContract
        .connect(userTwo)
        .approve(aiAppContract.getAddress(), ethers.MaxUint256)
    ).to.be.not.reverted;
    // Unlock
    await expect(
      aiAppContract.connect(userTwo).unlock(aiAppId)
    ).to.changeTokenBalances(
      usdTokenContract,
      [userTwo, aiAppContract],
      [ethers.parseEther("-2"), ethers.parseEther("2")]
    );
    // Check user
    expect(await aiAppContract.isUser(aiAppId, userTwo)).to.be.equal(true);
    // Withraw
    await expect(
      aiAppContract.connect(userOne).withdraw(aiAppId, userThree)
    ).to.changeTokenBalances(
      usdTokenContract,
      [userThree, aiAppContract],
      [ethers.parseEther("2"), ethers.parseEther("-2")]
    );
  });
});
