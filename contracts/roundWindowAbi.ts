// Generated from the supplied v7.4 Solidity sources with solc 0.8.36+commit.8a079791.Emscripten.clang.
// Read fragments used by this dapp, plus all events/errors.
export const roundWindowAbi = [
  {
    "inputs": [],
    "name": "AlreadyInitialized",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EmergencyShutdown",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidRecipient",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidStartBox",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidVenue",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "required",
        "type": "uint256"
      }
    ],
    "name": "MinimumNodesRequired",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "OnlyLatestWindow",
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
    "name": "TimeException",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UnsentValue",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "UserNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "WindowClosed",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "userAddr",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "payout",
        "type": "uint256"
      }
    ],
    "name": "AccountTerminated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "userAddr",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "direct",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint24",
        "name": "box",
        "type": "uint24"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "enterUSD",
        "type": "uint256"
      }
    ],
    "name": "Entered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "from",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "to",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "complete",
        "type": "bool"
      }
    ],
    "name": "RoundBatchPaid",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
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
        "name": "assuranceHeld",
        "type": "uint256"
      }
    ],
    "name": "RoundPriced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "carried",
        "type": "bool"
      }
    ],
    "name": "ShutdownVoteCast",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "provider",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "stableAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "nativeAmount",
        "type": "uint256"
      }
    ],
    "name": "SystemShutdown",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "userAddr",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint24",
        "name": "box",
        "type": "uint24"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "enterUSD",
        "type": "uint256"
      }
    ],
    "name": "ToppedUp",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "WalletChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "round",
        "type": "uint256"
      }
    ],
    "name": "WindowClosedEvent",
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
        "name": "round",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "roundStage",
        "type": "uint8"
      }
    ],
    "name": "WindowInitialized",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "LatestWindow",
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
        "internalType": "uint24",
        "name": "startBox",
        "type": "uint24"
      },
      {
        "internalType": "address",
        "name": "direct",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "referral",
        "type": "address"
      }
    ],
    "name": "begin",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint24",
        "name": "targetBox",
        "type": "uint24"
      }
    ],
    "name": "chargeAccount",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "nodes",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "weekNodes",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "devPool",
        "type": "bool"
      }
    ],
    "name": "distributeMatchingBonuses",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "direct",
        "type": "address"
      }
    ],
    "name": "getBestReferralForDirect",
    "outputs": [
      {
        "internalType": "address",
        "name": "referral",
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
        "name": "roundsAgo",
        "type": "uint256"
      }
    ],
    "name": "getMainBulkInfo",
    "outputs": [
      {
        "internalType": "address",
        "name": "roundWindow",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "userCount_",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "pointValue_",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "roundPoints_",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "roundEnteredUSD_",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "allEnteredUSD_",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "NextBinaryPay",
        "type": "string"
      },
      {
        "internalType": "uint8",
        "name": "stage_",
        "type": "uint8"
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
    "name": "getUserBulkInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "roundPoints",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "unmatchedVolume",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "worth",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "users",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "dirEarned",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "binaryEarned",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "earnable",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "insuranceStatus",
        "type": "string"
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
      },
      {
        "internalType": "uint256",
        "name": "fromRoundsAgo",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "RoundsAgo",
        "type": "uint256"
      }
    ],
    "name": "getUserRoundInfo",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "points",
        "type": "uint256[]"
      },
      {
        "internalType": "string[]",
        "name": "dirEarn",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "binaryEarn",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "dirFlash",
        "type": "string[]"
      },
      {
        "internalType": "string[]",
        "name": "binaryFlash",
        "type": "string[]"
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
      },
      {
        "internalType": "uint8",
        "name": "stage_",
        "type": "uint8"
      }
    ],
    "name": "init",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isClosed",
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
    "inputs": [
      {
        "internalType": "address",
        "name": "newAddr",
        "type": "address"
      }
    ],
    "name": "resetWalletAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "roundId",
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
    "name": "stabilizedPointValue",
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
    "name": "stableToken",
    "outputs": [
      {
        "internalType": "contract IERC20",
        "name": "",
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
    "inputs": [],
    "name": "terminateAccount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "voteShutdown",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "wrappedToken",
    "outputs": [
      {
        "internalType": "contract IWERC20",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
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
  }
] as const;
