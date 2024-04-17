import hre, { ethers } from "hardhat";
import { CONTRACTS } from "./data/deployed-contracts";

async function main() {
  console.log("👟 Start script 'sandbox'");

  const network = hre.network.name;

  // Get signers
  const [deployer, userOne, userTwo, userThree] = await ethers.getSigners();

  // Define factories
  const accountFactoryContractFactory = await ethers.getContractFactory(
    "AccountFactory"
  );
  const accountContractFactory = await ethers.getContractFactory("Account");
  const usdTokenContractFactory = await ethers.getContractFactory("USDToken");

  // Define contracts
  const entryPointContract = await ethers.getContractAt(
    "CustomEntryPoint",
    CONTRACTS[network].entryPoint as `0x${string}`
  );

  let initCode =
    (CONTRACTS[network].accountFactory as `0x${string}`) +
    accountFactoryContractFactory.interface
      .encodeFunctionData("createAccount", [await deployer.getAddress()])
      .slice(2);
  console.log("initCode:", initCode);

  let sender;
  try {
    await entryPointContract.getSenderAddress(initCode);
  } catch (error: any) {
    if (network === "localhost") {
      sender = "0x" + error.data.message.slice(-43, -3);
    } else {
      sender = "0x" + error.data.slice(-40);
    }
  }
  console.log("sender:", sender);

  const code = await ethers.provider.getCode(sender as string);
  if (code !== "0x") {
    initCode = "0x";
  }
  console.log("code:", code);

  const nonce = Number(await entryPointContract.getNonce(sender as string, 0));
  console.log("nonce:", nonce);

  const callData = accountContractFactory.interface.encodeFunctionData(
    "execute",
    [
      CONTRACTS[network].usdToken as `0x${string}`,
      ethers.ZeroHash,
      usdTokenContractFactory.interface.encodeFunctionData("mint", [2]),
    ]
  );
  console.log("callData:", callData);

  const userOp = {
    sender: sender as string,
    nonce: nonce,
    initCode,
    callData,
    callGasLimit: 2_000_000,
    verificationGasLimit: 500_000,
    preVerificationGas: 100_000,
    maxFeePerGas: ethers.parseUnits("80", "gwei"),
    maxPriorityFeePerGas: Number(ethers.parseUnits("80", "gwei")),
    paymasterAndData: CONTRACTS[network].paymaster as `0x${string}`,
    signature:
      "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
  };

  const userOpHash = await entryPointContract.getUserOpHash(userOp);
  const signature = await deployer.signMessage(ethers.getBytes(userOpHash));
  userOp.signature = signature;
  console.log("signature:", signature);

  // Handle user operation without bundler
  const tx = await entryPointContract.handleOps(
    [userOp],
    await deployer.getAddress()
  );
  console.log("tx.hash:", tx.hash);

  console.log("🏁 Script finished");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
