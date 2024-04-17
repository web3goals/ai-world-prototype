"use client";

import { SiteConfigContracts } from "@/config/site";
import { aiAppAbi } from "@/contracts/abi/ai-app-abi";
import useMetadataLoader from "@/hooks/useMetadataLoader";
import { AIAppMetadata } from "@/types/ai-app-metadata";
import { erc20Abi, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { AIAppConversation } from "./ai-app-conversation";
import { AIAppUnlockForm } from "./ai-app-unlock-form";

export function AIApp(props: {
  aiApp: string;
  contracts: SiteConfigContracts;
}) {
  const { address } = useAccount();

  /**
   * Define params
   */
  const { data: aiAppParams, isFetched: isAiAppParamsFetched } =
    useReadContract({
      address: props.contracts.aiApp,
      abi: aiAppAbi,
      functionName: "getParams",
      args: [BigInt(props.aiApp)],
      chainId: props.contracts.chain.id,
    });

  /**
   * Define metadata
   */
  const { data: aiAppMetadataUri, isFetched: isAiAppMetadataUriFetched } =
    useReadContract({
      address: props.contracts.aiApp,
      abi: aiAppAbi,
      functionName: "tokenURI",
      args: [BigInt(props.aiApp)],
      chainId: props.contracts.chain.id,
    });
  const { data: aiAppMetadata, isLoaded: isAiAppMetadataLoaded } =
    useMetadataLoader<AIAppMetadata>(aiAppMetadataUri);

  /**
   * Define token symbol
   */
  const { data: aiAppTokenSymbol, isFetched: isAiAppTokenSymbol } =
    useReadContract({
      address: aiAppParams?.token || zeroAddress,
      abi: erc20Abi,
      functionName: "symbol",
    });

  /**
   * Define user status
   */
  const {
    data: isAiAppUser,
    isFetched: isAiAppUserFetched,
    refetch: isAiAppUserRefetch,
  } = useReadContract({
    address: props.contracts.aiApp,
    abi: aiAppAbi,
    functionName: "isUser",
    args: [BigInt(props.aiApp), address || zeroAddress],
    chainId: props.contracts.chain.id,
  });

  if (
    !isAiAppParamsFetched ||
    !isAiAppMetadataUriFetched ||
    !isAiAppMetadataLoaded ||
    !isAiAppTokenSymbol ||
    !isAiAppUserFetched
  ) {
    return <Skeleton className="w-full h-8" />;
  }

  return (
    <div className="flex flex-col items-start">
      <Avatar className="size-36">
        <AvatarImage src="" alt="Icon" />
        <AvatarFallback className="text-5xl bg-primary">
          {aiAppMetadata?.icon}
        </AvatarFallback>
      </Avatar>
      <p className="text-4xl font-bold mt-8">{aiAppMetadata?.label}</p>
      <p className="text-xl text-muted-foreground whitespace-pre-line mt-3">
        {aiAppMetadata?.description}
      </p>
      <Separator className="my-8" />
      {isAiAppUser ? (
        <AIAppConversation />
      ) : (
        <AIAppUnlockForm
          aiApp={props.aiApp}
          aiAppCost={aiAppParams?.cost as bigint}
          aiAppToken={aiAppParams?.token as `0x${string}`}
          aiAppTokenSymbol={aiAppTokenSymbol as string}
          contracts={props.contracts}
          onUnlock={() => isAiAppUserRefetch()}
        />
      )}
    </div>
  );
}
