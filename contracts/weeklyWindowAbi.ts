/**
 * ABI for WeeklyWindow.sol - the per-week $500-to-$500 matching bonus pool. One of
 * these is cloned per week (14 rounds / 7 days); it collects a flat 15% of every join
 * plus a stage-dependent 0-15% of every top-up, and pays out once its week has ended.
 * Anything it doesn't pay out sweeps to the round window automatically.
 */
export const weeklyWindowAbi = [
  { inputs: [], name: "OnlyFactory", type: "error" },
  { inputs: [], name: "OnlyVerifiedWindow", type: "error" },
  { inputs: [], name: "WeekNotEnded", type: "error" },
  { inputs: [], name: "AlreadyDistributed", type: "error" },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  {
    inputs: [],
    name: "weekId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isFinished",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "stabilizedWeekPointValue",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "weekPayIndex",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hasEnded",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "nodes", type: "uint256" }],
    name: "distributeWeekly",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "userAddr", type: "address" },
    ],
    name: "getUserWeekInfo",
    outputs: [
      { internalType: "uint256", name: "matched", type: "uint256" },
      { internalType: "uint256", name: "raw", type: "uint256" },
      { internalType: "uint256", name: "credited", type: "uint256" },
      { internalType: "uint256", name: "owed", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWeekBulkInfo",
    outputs: [
      { internalType: "uint256", name: "week", type: "uint256" },
      { internalType: "uint256", name: "pool", type: "uint256" },
      { internalType: "uint256", name: "points", type: "uint256" },
      { internalType: "uint256", name: "earners", type: "uint256" },
      { internalType: "uint256", name: "paidSoFar", type: "uint256" },
      { internalType: "bool", name: "ended", type: "bool" },
      { internalType: "bool", name: "finished", type: "bool" },
      { internalType: "uint256", name: "pointValue", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "week", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "pointValue", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "sweptToRound", type: "uint256" },
    ],
    name: "WeekClosed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "week", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "WeekDrained",
    type: "event",
  },
] as const;
