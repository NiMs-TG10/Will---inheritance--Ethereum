// Contract configuration
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const RPC_URL = import.meta.env.VITE_HTTP_RPC_URL;

// Contract ABI
export const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "fromUser",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "claimInheritance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getInactivityThresholdPeriod",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "nominee",
        type: "address",
      },
    ],
    name: "getIncomingInheritanceDetails",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "depositorName",
            type: "string",
          },
          {
            internalType: "address",
            name: "depositorAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "sharePercent",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "absoluteShareAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "inactivityThresholdPeriod",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "timeUntilUnlock",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isLocked",
            type: "bool",
          },
        ],
        internalType: "struct StateVariables.IncomingInheritance[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getLastCheckInTime",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getName",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getNomineesDetails",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "relation",
            type: "string",
          },
          {
            internalType: "address",
            name: "nomineeAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "sharePercent",
            type: "uint256",
          },
        ],
        internalType: "struct StateVariables.Nominee[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getTotalDepositAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "iAmAlive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isActive",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isNewUser",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "newName",
        type: "string",
      },
    ],
    name: "resetName",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "timeInSeconds",
        type: "uint256",
      },
    ],
    name: "setInactivityPeriod",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "relation",
            type: "string",
          },
          {
            internalType: "address",
            name: "nomineeAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "sharePercent",
            type: "uint256",
          },
        ],
        internalType: "struct StateVariables.Nominee[]",
        name: "newNominees",
        type: "tuple[]",
      },
    ],
    name: "updateNominees",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
