"use client";

import { SiteConfigContracts } from "@/config/site";
import { aiAppAbi } from "@/contracts/abi/ai-app-abi";
import useMetadataLoader from "@/hooks/useMetadataLoader";
import { addressToShortAddress } from "@/lib/converters";
import { AIAppMetadata } from "@/types/ai-app-metadata";
import { useEffect, useState } from "react";
import { erc20Abi, formatEther, isAddressEqual, zeroAddress } from "viem";
import { useAccount, useInfiniteReadContracts, useReadContract } from "wagmi";
import { AIAppWithdrawDialog } from "./ai-app-withdraw-dialog";
import EntityList from "./entity-list";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

const LIMIT = 42;

export function AIAppList(props: { contracts: SiteConfigContracts }) {
  const { address } = useAccount();
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    `0x${string}` | undefined
  >();
  const [aiApps, setAIApps] = useState<string[] | undefined>();

  const { data } = useInfiniteReadContracts({
    cacheKey: `ai_apps_${props.contracts.chain.id.toString()}`,
    contracts(pageParam) {
      return [...new Array(LIMIT)].map(
        (_, i) =>
          ({
            address: props.contracts.aiApp,
            abi: aiAppAbi,
            functionName: "ownerOf",
            args: [BigInt(pageParam + i)],
            chainId: props.contracts.chain.id,
          } as const)
      );
    },
    query: {
      initialPageParam: 0,
      getNextPageParam: (_lastPage, _allPages, lastPageParam) => {
        return lastPageParam + 1;
      },
    },
  });

  useEffect(() => {
    setSmartAccountAddress(undefined);
    if (address) {
      if (props.contracts.accountAbstractionSuported) {
        // TODO: Implement
      } else {
        setSmartAccountAddress(address);
      }
    }
  }, [address, props.contracts]);

  useEffect(() => {
    setAIApps(undefined);
    if (address && data && smartAccountAddress) {
      const aiApps: string[] = [];
      const owners = (data as any).pages[0];
      for (let i = 0; i < owners.length; i++) {
        const element = owners[i];
        if (
          isAddressEqual(element.result || zeroAddress, smartAccountAddress)
        ) {
          aiApps.push(String(i));
        }
      }
      setAIApps(aiApps);
    }
  }, [address, data, smartAccountAddress]);

  return (
    <EntityList
      entities={aiApps}
      renderEntityCard={(aiApp, index) => (
        <AIAppCard key={index} aiApp={aiApp} contracts={props.contracts} />
      )}
      noEntitiesText={`No AI apps on ${props.contracts.chain.name} 😐`}
    />
  );
}

export function AIAppCard(props: {
  aiApp: string;
  contracts: SiteConfigContracts;
}) {
  return (
    <div className="w-full flex flex-col items-center border rounded px-6 py-8">
      <AIAppCardHeader aiApp={props.aiApp} contracts={props.contracts} />
      <Separator className="my-6" />
      <AIAppCardSubscribers aiApp={props.aiApp} contracts={props.contracts} />
    </div>
  );
}

function AIAppCardHeader(props: {
  aiApp: string;
  contracts: SiteConfigContracts;
}) {
  /**
   * Define params
   */
  const {
    data: aiAppParams,
    isFetched: isAiAppParamsFetched,
    refetch: refetchAiAppParams,
  } = useReadContract({
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

  function OpenPageButton() {
    return (
      <a
        href={`/ai-app/${props.contracts.chain.id}/${props.aiApp}`}
        target="_blank"
      >
        <Button>Open Page</Button>
      </a>
    );
  }

  // TODO: Show toast that feature is not implemted
  function EditButton() {
    return <Button variant="outline">Edit</Button>;
  }

  if (
    !isAiAppParamsFetched ||
    !isAiAppMetadataUriFetched ||
    !isAiAppMetadataLoaded ||
    !isAiAppTokenSymbol
  ) {
    return <Skeleton className="w-full h-8" />;
  }

  return (
    <div className="w-full flex flex-row gap-4">
      {/* Icon */}
      <div>
        <Avatar className="size-16">
          <AvatarImage src="" alt="Icon" />
          <AvatarFallback className="text-3xl bg-slate-500">
            {aiAppMetadata?.icon}
          </AvatarFallback>
        </Avatar>
      </div>
      {/* Content */}
      <div className="w-full">
        <p className="text-xl font-bold">{aiAppMetadata?.label}</p>
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">Chain:</p>
            <p className="text-sm break-all">{props.contracts.chain.name}</p>
          </div>
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">Cost:</p>
            <p className="text-sm break-all">
              {formatEther(aiAppParams?.cost || BigInt(0))} {aiAppTokenSymbol}
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">Token:</p>
            <p className="text-sm break-all">
              <a
                href={`${props.contracts.chain.blockExplorers?.default?.url}/address/${aiAppParams?.token}`}
                target="_blank"
                className="underline underline-offset-4"
              >
                {addressToShortAddress(aiAppParams?.token || zeroAddress)}
              </a>
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">
              Balance:
            </p>
            <p className="text-sm break-all">
              {formatEther(aiAppParams?.balance || BigInt(0))}{" "}
              {aiAppTokenSymbol}
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">
              Revenue:
            </p>
            <p className="text-sm break-all">
              {formatEther(aiAppParams?.revenue || BigInt(0))}{" "}
              {aiAppTokenSymbol}
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:gap-3">
            <p className="min-w-[80px] text-sm text-muted-foreground">
              Created:
            </p>
            <p className="text-sm break-all">
              {new Date(Number(aiAppParams?.created) * 1000).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-6 md:flex-row">
          <OpenPageButton />
        </div>
        <div className="flex flex-col gap-2 mt-4 md:flex-row">
          <EditButton />
          <AIAppWithdrawDialog
            aiApp={props.aiApp}
            contracts={props.contracts}
            onWithdraw={() => refetchAiAppParams()}
          />
        </div>
      </div>
    </div>
  );
}

// TODO: Implement
function AIAppCardSubscribers(props: {
  aiApp: string;
  contracts: SiteConfigContracts;
}) {
  return <>...</>;
}
