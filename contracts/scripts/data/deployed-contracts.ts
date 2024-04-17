export const CONTRACTS: {
  [key: string]: {
    aiApp: `0x${string}` | undefined;
    usdToken: `0x${string}` | undefined;
    entryPoint: `0x${string}` | undefined;
    accountFactory: `0x${string}` | undefined;
    paymaster: `0x${string}` | undefined;
  };
} = {
  morphTestnet: {
    aiApp: "0x96E6AF6E9e400d0Cd6a4045F122df22BCaAAca59",
    usdToken: "0x02008a8DBc938bd7930bf370617065B6B0c1221a",
    entryPoint: "0xdfE15Cc65697c04C083982B8a053E2FE4cf54669",
    accountFactory: "0x17DC361D05E1A608194F508fFC4102717666779f",
    paymaster: "0x9cAAb0Bf70BD0e71307BfaBeb1E8eC092c81e493",
  },
};
