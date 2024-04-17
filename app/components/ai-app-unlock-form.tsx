"use client";

import { SiteConfigContracts } from "@/config/site";
import { aiAppAbi } from "@/contracts/abi/ai-app-abi";
import useError from "@/hooks/useError";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { Button } from "./ui/button";
import { toast } from "./ui/use-toast";
import { erc20Abi, formatEther, parseEther } from "viem";

export function AIAppUnlockForm(props: {
  aiApp: string;
  aiAppCost: bigint;
  aiAppToken: `0x${string}`;
  aiAppTokenSymbol: string;
  contracts: SiteConfigContracts;
  onUnlock: () => void;
}) {
  const { handleError } = useError();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  async function onSubmit() {
    try {
      setIsFormSubmitting(true);
      // Check public client
      if (!publicClient) {
        throw new Error("Public client is not ready");
      }
      // Check wallet
      if (!address || !walletClient) {
        throw new Error("Wallet is not connected");
      }
      // Send request to approve transfers
      const approveAmount = parseEther("1000");
      const approveTxHash = await walletClient.writeContract({
        address: props.aiAppToken,
        abi: erc20Abi,
        functionName: "approve",
        args: [props.contracts.aiApp, approveAmount],
        chain: props.contracts.chain,
      });
      await publicClient.waitForTransactionReceipt({
        hash: approveTxHash,
      });
      // Send request to unlock
      const unlockTxHash = await walletClient.writeContract({
        address: props.contracts.aiApp,
        abi: aiAppAbi,
        functionName: "unlock",
        args: [BigInt(props.aiApp)],
        chain: props.contracts.chain,
      });
      await publicClient.waitForTransactionReceipt({
        hash: unlockTxHash as `0x${string}`,
      });
      // Show success message
      toast({
        title: "AI app unlocked 👌",
      });
      props.onUnlock();
    } catch (error: any) {
      handleError(error, true);
      setIsFormSubmitting(false);
    }
  }

  return (
    <Button disabled={isFormSubmitting} onClick={() => onSubmit()}>
      {isFormSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Unlock for {formatEther(props.aiAppCost)} {props.aiAppTokenSymbol}
    </Button>
  );
}
