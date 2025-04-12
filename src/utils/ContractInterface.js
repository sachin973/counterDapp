import { ethers } from 'ethers';

// ABI for the SimpleCounter contract
const COUNTER_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newCount",
        "type": "uint256"
      }
    ],
    "name": "CounterDecremented",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newCount",
        "type": "uint256"
      }
    ],
    "name": "CounterIncremented",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      }
    ],
    "name": "CounterReset",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "decrement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCount",
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
    "name": "increment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "reset",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Replace with your deployed contract address
// For testing, you'll need to deploy this contract to a testnet or local network
const COUNTER_CONTRACT_ADDRESS = "0x7BF96D6cd93599C9EDB1Ccc16e2fFd4333958bBd";

export const getCounterContract = (providerOrSigner) => {
  if (!providerOrSigner) {
    throw new Error("Provider or signer is required");
  }
  
  return new ethers.Contract(
    COUNTER_CONTRACT_ADDRESS,
    COUNTER_ABI,
    providerOrSigner
  );
};

// Read functions
export const getCount = async (provider) => {
  try {
    const contract = getCounterContract(provider);
    const count = await contract.getCount();
    return parseInt(count.toString());
  } catch (error) {
    console.error("Error getting count:", error);
    throw error;
  }
};

// Write functions (require signer)
export const incrementCounter = async (signer) => {
  try {
    const contract = getCounterContract(signer);
    const tx = await contract.increment();
    return await tx.wait();
  } catch (error) {
    console.error("Error incrementing counter:", error);
    throw error;
  }
};

export const decrementCounter = async (signer) => {
  try {
    const contract = getCounterContract(signer);
    const tx = await contract.decrement();
    return await tx.wait();
  } catch (error) {
    console.error("Error decrementing counter:", error);
    throw error;
  }
};

export const resetCounter = async (signer) => {
  try {
    const contract = getCounterContract(signer);
    const tx = await contract.reset();
    return await tx.wait();
  } catch (error) {
    console.error("Error resetting counter:", error);
    throw error;
  }
};