import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

// Create context
export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  // State variables
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [chainId, setChainId] = useState('');
  const [chainName, setChainName] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize from localStorage on component mount
  useEffect(() => {
    const storedWalletData = localStorage.getItem('walletData');
    
    if (storedWalletData) {
      const { isConnected: storedIsConnected } = JSON.parse(storedWalletData);
      
      // If wallet was previously connected, try to reconnect
      if (storedIsConnected) {
        connectWallet();
      }
    }
  }, []);

  // Check if MetaMask is installed
  const checkIfMetaMaskIsInstalled = useCallback(() => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
    }
    
    if (!window.ethereum.isMetaMask) {
      throw new Error('MetaMask is not installed. Other wallet detected.');
    }
    
    return true;
  }, []);

  // Handle chain change
  const handleChainChanged = useCallback(async (networkId) => {
    const chainIdHex = networkId;
    const chainIdNum = parseInt(chainIdHex, 16);
    setChainId(chainIdNum);
    
    // Get chain name
    let name = 'Unknown Network';
    switch(chainIdNum) {
      case 1:
        name = 'Ethereum Mainnet';
        break;
      case 5:
        name = 'Goerli Testnet';
        break;
      case 11155111:
        name = 'Sepolia Testnet';
        break;
      case 80002:
        name = 'Polygon Amoy';
        break;
      case 80001:
        name = 'Mumbai Testnet';
        break;
      case 56:
        name = 'Binance Smart Chain';
        break;
      case 97:
        name = 'BSC Testnet';
        break;
      default:
        name = `Chain ID: ${chainIdNum}`;
    }
    setChainName(name);
    
    // Reconnect on chain change
    await connectWallet();
  }, []);

  // Handle account change
  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      // User has disconnected their account
      disconnectWallet();
    } else {
      // Account changed, update state
      setAddress(accounts[0]);
      updateLocalStorage(true, accounts[0]);
    }
  }, []);

  // Update localStorage
  const updateLocalStorage = useCallback((connected, userAddress) => {
    const walletData = {
      isConnected: connected,
      address: userAddress
    };
    localStorage.setItem('walletData', JSON.stringify(walletData));
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if MetaMask is installed
      checkIfMetaMaskIsInstalled();
      
      // Create provider
      const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(ethersProvider);
      
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];
      setAddress(account);
      
      // Get network
      const network = await ethersProvider.getNetwork();
      setChainId(network.chainId);
      
      // Get chain name
      let name = 'Unknown Network';
      switch(network.chainId) {
        case 1:
          name = 'Ethereum Mainnet';
          break;
        case 5:
          name = 'Goerli Testnet';
          break;
        case 11155111:
          name = 'Sepolia Testnet';
          break;
        case 137:
          name = 'Polygon Mainnet';
          break;
        case 80001:
          name = 'Mumbai Testnet';
          break;
        case 56:
          name = 'Binance Smart Chain';
          break;
        case 97:
          name = 'BSC Testnet';
          break;
        default:
          name = `Chain ID: ${network.chainId}`;
      }
      setChainName(name);
      
      // Get signer
      const signerInstance = ethersProvider.getSigner();
      setSigner(signerInstance);
      
      // Set connected
      setIsConnected(true);
      
      // Save to localStorage
      updateLocalStorage(true, account);
      
      // Set up event listeners
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return true;
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [checkIfMetaMaskIsInstalled, handleChainChanged, handleAccountsChanged, updateLocalStorage]);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setAddress('');
    setProvider(null);
    setSigner(null);
    
    // Remove from localStorage
    updateLocalStorage(false, '');
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  }, [handleChainChanged, handleAccountsChanged, updateLocalStorage]);

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [handleChainChanged, handleAccountsChanged]);

  // Context value
  const contextValue = {
    isConnected,
    address,
    chainId,
    chainName,
    provider,
    signer,
    loading,
    error,
    connectWallet,
    disconnectWallet
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook for using wallet context
export const useWallet = () => {
  const context = React.useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};