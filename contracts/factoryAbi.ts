// Generated from the supplied v7.4 Solidity sources with solc 0.8.36+commit.8a079791.Emscripten.clang.
// Read fragments used by this dapp, plus all events/errors.
export const factoryAbi = [
  {
    "inputs": [],
    "name": "AddressAlreadyRegistered",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AlreadyInitiated",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "AlreadyVoted",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DirectDoesNotExist",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DirectsFull",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FailedDeployment",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "FlashRequired",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidTopupTarget",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "MaxReached",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NewAddressRegistered",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "NotInAssuranceList",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlyLatestWindow",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlyVerifiedWindow",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "PredecessorHasUnsettledEarnings",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReferralDoesNotExist",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "SameAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnderCommitmentTime",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UserNotRegistered",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldWindow",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newWindow",
        "type": "address"
      }
    ],
    "name": "LatestWindowChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint48",
        "name": "userId",
        "type": "uint48"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "weight",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "standing",
        "type": "uint256"
      }
    ],
    "name": "ShutdownVoted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "oldStage",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "newStage",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "coverage",
        "type": "uint256"
      }
    ],
    "name": "StageChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "window",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "week",
        "type": "uint256"
      }
    ],
    "name": "WeeklyWindowCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "window",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      }
    ],
    "name": "WindowCreated",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "WEEK_MATCH_UNIT",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "WEEK_ROUNDS",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "userId",
        "type": "uint48"
      }
    ],
    "name": "_userTopupsSinceFlash",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "counter",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddr",
        "type": "address"
      }
    ],
    "name": "addrToId",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "userId",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentStageParams",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "weeklyPct",
        "type": "uint8"
      },
      {
        "internalType": "uint16",
        "name": "pointCeiling",
        "type": "uint16"
      },
      {
        "internalType": "uint8",
        "name": "renewalScoreMask",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint24",
        "name": "entrance",
        "type": "uint24"
      }
    ],
    "name": "entranceCap",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLatestWindow",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "userId",
        "type": "uint48"
      }
    ],
    "name": "getUserData",
    "outputs": [
      {
        "internalType": "uint40",
        "name": "leftWorth",
        "type": "uint40"
      },
      {
        "internalType": "uint40",
        "name": "rightWorth",
        "type": "uint40"
      },
      {
        "internalType": "uint40",
        "name": "leftUsers",
        "type": "uint40"
      },
      {
        "internalType": "uint40",
        "name": "rightUsers",
        "type": "uint40"
      },
      {
        "internalType": "int40",
        "name": "variance",
        "type": "int40"
      },
      {
        "internalType": "uint16",
        "name": "depth",
        "type": "uint16"
      },
      {
        "internalType": "uint8",
        "name": "childs",
        "type": "uint8"
      },
      {
        "internalType": "int8",
        "name": "legSide",
        "type": "int8"
      },
      {
        "internalType": "uint24",
        "name": "entrance",
        "type": "uint24"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "userId",
        "type": "uint48"
      }
    ],
    "name": "getUserPeriodEarnable",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "addr",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "len",
        "type": "uint256"
      }
    ],
    "name": "getUserTree",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "addrList",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "userId",
        "type": "uint48"
      },
      {
        "internalType": "uint256",
        "name": "week",
        "type": "uint256"
      }
    ],
    "name": "getWeekProgress",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "left",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "right",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "matched",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "raw",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "credited",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "week",
        "type": "uint256"
      }
    ],
    "name": "getWeekReceiversLength",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "goodStreak",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastCoverage",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "latestWindow",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "refPoints",
    "outputs": [
      {
        "internalType": "uint40",
        "name": "",
        "type": "uint40"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "roundCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      }
    ],
    "name": "roundToWindow",
    "outputs": [
      {
        "internalType": "address",
        "name": "window",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stage",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "coverage",
        "type": "uint256"
      }
    ],
    "name": "stageFor",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "s",
        "type": "uint8"
      }
    ],
    "name": "stageHold",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "s",
        "type": "uint8"
      }
    ],
    "name": "stageParams",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "weeklyPct",
        "type": "uint8"
      },
      {
        "internalType": "uint16",
        "name": "pointCeiling",
        "type": "uint16"
      },
      {
        "internalType": "uint8",
        "name": "renewalScoreMask",
        "type": "uint8"
      }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "userAddr",
        "type": "address"
      }
    ],
    "name": "userAddrExists",
    "outputs": [
      {
        "internalType": "bool",
        "name": "status",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "userId",
        "type": "uint48"
      }
    ],
    "name": "userDebt",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      }
    ],
    "name": "weekOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "week",
        "type": "uint256"
      }
    ],
    "name": "weekToWindow",
    "outputs": [
      {
        "internalType": "address",
        "name": "window",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "week",
        "type": "uint256"
      }
    ],
    "name": "weekTotalPoints",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "points",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "weeklyWindow",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
