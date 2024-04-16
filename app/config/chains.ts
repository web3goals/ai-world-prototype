import { Chain } from "viem/chains";

export const morphTestnet: Chain = {
  id: 2710,
  name: "Morph Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc-testnet.morphl2.io"] } },
  blockExplorers: {
    default: {
      name: "Morph Testnet Explorer",
      url: "https://explorer-testnet.morphl2.io",
    },
  },
  testnet: true,
};
