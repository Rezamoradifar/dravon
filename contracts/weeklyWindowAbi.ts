// Generated from the supplied v7.4 Solidity sources with solc 0.8.36+commit.8a079791.Emscripten.clang.
// Read fragments used by this dapp, plus all events/errors.
export const weeklyWindowAbi = [
  {
    "inputs": [],
    "name": "AlreadyDistributed",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidStableToken",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlyFactory",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlyVerifiedWindow",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReentrancyGuardReentrantCall",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "SafeERC20FailedOperation",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WeekNotEnded",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "week",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "pointValue",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "sweptToRound",
        "type": "uint256"
      }
    ],
    "name": "WeekClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "week",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "WeekDrained",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "factoryAddr",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "week",
        "type": "uint256"
      }
    ],
    "name": "WeekOpened",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nodes",
        "type": "uint256"
      }
    ],
    "name": "distributeWeekly",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "getUserWeekInfo",
    "outputs": [
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
      },
      {
        "internalType": "uint256",
        "name": "owed",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getWeekBulkInfo",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "week",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "pool",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "points",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "earners",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "paidSoFar",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "ended",
        "type": "bool"
      },
      {
        "internalType": "bool",
        "name": "finished",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "pointValue",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hasEnded",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isFinished",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stabilizedWeekPointValue",
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
    "name": "weekId",
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
    "name": "weekPayIndex",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
