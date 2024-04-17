import { Chain } from "viem/chains";
import { morphTestnet } from "./chains";

export type SiteConfig = typeof siteConfig;

export type SiteConfigContracts = {
  chain: Chain;
  aiApp: `0x${string}`;
  usdt: `0x${string}`;
  entryPoint: `0x${string}`;
  paymaster: `0x${string}`;
  accountFactory: `0x${string}`;
  accountAbstractionSuported: boolean;
};

export const siteConfig = {
  emoji: "👽",
  name: "AI World",
  description: "A platform to launch and monetize AI apps without code",
  links: {
    github: "https://github.com/web3goals/ai-world-prototype",
  },
  contracts: {
    morphTestnet: {
      chain: morphTestnet,
      aiApp: "0x96E6AF6E9e400d0Cd6a4045F122df22BCaAAca59" as `0x${string}`,
      usdt: "0x02008a8DBc938bd7930bf370617065B6B0c1221a" as `0x${string}`,
      entryPoint: "0xdfE15Cc65697c04C083982B8a053E2FE4cf54669" as `0x${string}`,
      paymaster: "0x9cAAb0Bf70BD0e71307BfaBeb1E8eC092c81e493" as `0x${string}`,
      accountFactory:
        "0x17DC361D05E1A608194F508fFC4102717666779f" as `0x${string}`,
      accountAbstractionSuported: true,
    } as SiteConfigContracts,
  },
};
