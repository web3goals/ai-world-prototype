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
      aiApp: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      usdt: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      entryPoint: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      paymaster: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      accountFactory:
        "0x0000000000000000000000000000000000000000" as `0x${string}`,
      accountAbstractionSuported: true,
    } as SiteConfigContracts,
  },
};
