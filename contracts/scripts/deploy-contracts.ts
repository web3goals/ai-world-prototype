import hre, { ethers } from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'deploy-contracts'");

  const network = hre.network.name;

  if (!CONTRACTS[network].aiApp) {
    const contractFactory = await ethers.getContractFactory("AIApp");
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    console.log(`Contract 'AIApp' deployed to: ${await contract.getAddress()}`);
  }

  if (!CONTRACTS[network].usdToken) {
    const contractFactory = await ethers.getContractFactory("USDToken");
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    console.log(
      `Contract 'USDToken' deployed to: ${await contract.getAddress()}`
    );
  }

  if (!CONTRACTS[network].entryPoint) {
    const contractFactory = await ethers.getContractFactory("CustomEntryPoint");
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    console.log(
      `Contract 'EntryPoint' deployed to: ${await contract.getAddress()}`
    );
  }

  if (!CONTRACTS[network].accountFactory) {
    const contractFactory = await ethers.getContractFactory("AccountFactory");
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    console.log(
      `Contract 'AccountFactory' deployed to: ${await contract.getAddress()}`
    );
  }

  if (!CONTRACTS[network].paymaster) {
    const contractFactory = await ethers.getContractFactory("Paymaster");
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();
    console.log(
      `Contract 'Paymaster' deployed to: ${await contract.getAddress()}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
