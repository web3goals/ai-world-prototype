"use server";

import { SiteConfigContracts } from "@/config/site";
import { accountAbi } from "@/contracts/abi/account";
import { accountFactoryAbi } from "@/contracts/abi/account-factory";
import { entryPointAbi } from "@/contracts/abi/entry-point";
import { OpenAiMessage } from "@/types/open-ai-message";
import axios from "axios";
import {
  createPublicClient,
  createWalletClient,
  decodeErrorResult,
  encodeFunctionData,
  etherUnits,
  http,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

export async function sendMessagesToOpenAI(
  messages: OpenAiMessage[],
  model: "gpt-3.5-turbo",
  temperature: 0.7
): Promise<string> {
  console.log("sendMessagesToOpenAI");
  const { data } = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: model,
      messages: messages,
      temperature: temperature,
    },
    { headers: { Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}` } }
  );
  return JSON.parse(JSON.stringify(data?.choices?.[0]?.message?.content));
}

export async function getSmartAccountAddress(
  owner: `0x${string}`,
  contracts: SiteConfigContracts
): Promise<string | undefined> {
  console.log("getSmartAccountAddress");

  const fakeBundlerAccount = privateKeyToAccount(
    process.env.FAKE_BUNDLER_ACCOUNT_PRIVATE_KEY as `0x${string}`
  );

  const fakeBundlerWalletClient = createWalletClient({
    account: fakeBundlerAccount,
    chain: contracts.chain,
    transport: http(),
  });

  let initCode =
    contracts.accountFactory +
    encodeFunctionData({
      abi: accountFactoryAbi,
      functionName: "createAccount",
      args: [owner],
    }).slice(2);
  console.log("initCode:", initCode);

  let sender;
  try {
    await fakeBundlerWalletClient.writeContract({
      address: contracts.entryPoint,
      abi: entryPointAbi,
      functionName: "getSenderAddress",
      args: [initCode as `0x${string}`],
    });
  } catch (error: any) {
    const decodedError = decodeErrorResult({
      abi: entryPointAbi,
      data: error?.cause?.cause?.cause?.cause?.cause?.data as `0x${string}`,
    });
    sender = decodedError.args[0];
  }
  console.log("sender:", sender);

  return JSON.parse(JSON.stringify(sender));
}

export async function executeViaSmartAccount(
  owner: `0x${string}`,
  executeDestination: `0x${string}`,
  executeFunction: `0x${string}`,
  contracts: SiteConfigContracts
): Promise<string> {
  console.log("executeViaSmartAccount");

  const fakeBundlerAccount = privateKeyToAccount(
    process.env.FAKE_BUNDLER_ACCOUNT_PRIVATE_KEY as `0x${string}`
  );

  const publicClient = createPublicClient({
    chain: contracts.chain,
    transport: http(),
  });

  const fakeBundlerWalletClient = createWalletClient({
    account: fakeBundlerAccount,
    chain: contracts.chain,
    transport: http(),
  });

  let initCode =
    contracts.accountFactory +
    encodeFunctionData({
      abi: accountFactoryAbi,
      functionName: "createAccount",
      args: [owner],
    }).slice(2);
  console.log("initCode:", initCode);

  let sender;
  try {
    await fakeBundlerWalletClient.writeContract({
      address: contracts.entryPoint,
      abi: entryPointAbi,
      functionName: "getSenderAddress",
      args: [initCode as `0x${string}`],
    });
  } catch (error: any) {
    const decodedError = decodeErrorResult({
      abi: entryPointAbi,
      data: error?.cause?.cause?.cause?.cause?.cause?.data as `0x${string}`,
    });
    sender = decodedError.args[0];
  }
  console.log("sender:", sender);

  const code = await publicClient.getBytecode({
    address: sender as `0x${string}`,
  });
  if (code) {
    initCode = "0x";
  }
  console.log("code:", code);

  const nonce = await publicClient.readContract({
    address: contracts.entryPoint,
    abi: entryPointAbi,
    functionName: "getNonce",
    args: [sender as `0x${string}`, BigInt(0)],
  });
  console.log("nonce:", nonce);

  const callData = encodeFunctionData({
    abi: accountAbi,
    functionName: "execute",
    args: [executeDestination, BigInt(0), executeFunction],
  });
  console.log("callData:", callData);

  const userOp = {
    sender: sender as `0x${string}`,
    nonce: nonce,
    initCode: initCode as `0x${string}`,
    callData: callData as `0x${string}`,
    callGasLimit: BigInt(2_000_000),
    verificationGasLimit: BigInt(500_000),
    preVerificationGas: BigInt(100_000),
    maxFeePerGas: parseUnits("80", etherUnits.gwei),
    maxPriorityFeePerGas: parseUnits("80", etherUnits.gwei),
    paymasterAndData: contracts.paymaster,
    signature:
      "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c" as `0x${string}`,
  };

  // Handle user operation without real bundler
  const tx = await fakeBundlerWalletClient.writeContract({
    address: contracts.entryPoint,
    abi: entryPointAbi,
    functionName: "handleOps",
    args: [[userOp], process.env.FAKE_BUNDLER_ACCOUNT_ADDRESS as `0x${string}`],
  });
  console.log("tx:", tx);

  return JSON.parse(JSON.stringify(tx));
}
