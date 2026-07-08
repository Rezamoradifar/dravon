/**
 * Minimal ABI for the SmartContract "factory" contract (DataStorage + WindowFactory),
 * derived directly from the Solidity source (DataStorage.sol / WindowFactory.sol /
 * SmartContract.sol). Only the read functions this app needs are included.
 */
export const factoryAbi = [
  {
    inputs: [{ internalType: "uint24", name: "entrance", type: "uint24" }],
    name: "entranceCap",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "userAddr", type: "address" }],
    name: "userAddrExists",
    outputs: [{ internalType: "bool", name: "status", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "addrToId",
    outputs: [{ internalType: "uint48", name: "", type: "uint48" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint48", name: "userId", type: "uint48" }],
    name: "getUserData",
    outputs: [
      { internalType: "uint40", name: "leftWorth", type: "uint40" },
      { internalType: "uint40", name: "rightWorth", type: "uint40" },
      { internalType: "uint40", name: "leftUsers", type: "uint40" },
      { internalType: "uint40", name: "rightUsers", type: "uint40" },
      { internalType: "int40", name: "variance", type: "int40" },
      { internalType: "uint16", name: "depth", type: "uint16" },
      { internalType: "uint8", name: "childs", type: "uint8" },
      { internalType: "int8", name: "legSide", type: "int8" },
      { internalType: "uint24", name: "entrance", type: "uint24" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint48", name: "userId", type: "uint48" }],
    name: "getUserPeriodEarnable",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
