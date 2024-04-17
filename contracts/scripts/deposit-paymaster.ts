import hre, { ethers } from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'deposit-paymaster'");

  const network = hre.network.name;

  const entryPointContract = await ethers.getContractAt(
    "CustomEntryPoint",
    CONTRACTS[network].entryPoint as `0x${string}`
  );
  const tx = await entryPointContract.depositTo(
    CONTRACTS[network].paymaster as `0x${string}`,
    {
      value: ethers.parseEther("0.2"),
    }
  );
  await tx.wait();
  const paymasterDepositInfo = await entryPointContract.getDepositInfo(
    CONTRACTS[network].paymaster as `0x${string}`
  );
  console.log("paymasterDepositInfo:", paymasterDepositInfo);
  console.log("🏁 Script finished");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
