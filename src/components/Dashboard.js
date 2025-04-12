import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import {
  getCount,
  incrementCounter,
  decrementCounter,
  resetCounter
} from '../utils/ContractInterface';
import './Dashboard.css';

const Dashboard = () => {
  const { isConnected, provider, signer } = useWallet();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [txHistory, setTxHistory] = useState([]);

  // Fetch counter value when connected
  useEffect(() => {
    const fetchCount = async () => {
      if (isConnected && provider) {
        try {
          setLoading(true);
          const currentCount = await getCount(provider);
          setCount(currentCount);
          setError(null);
        } catch (err) {
          console.error('Error fetching count:', err);
          setError('Failed to load counter value');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCount();
    
    // Set up polling to refresh count
    const interval = setInterval(() => {
      if (isConnected && provider) {
        fetchCount();
      }
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
  }, [isConnected, provider]);

  // Handle increment
  const handleIncrement = async () => {
    if (!isConnected || !signer) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await incrementCounter(signer);
      setTxHash(tx.transactionHash);
      
      // Add to transaction history
      addToTxHistory('increment', tx.transactionHash);
      
      // Update count
      const newCount = await getCount(provider);
      setCount(newCount);
    } catch (err) {
      console.error('Error incrementing counter:', err);
      setError('Failed to increment counter');
    } finally {
      setLoading(false);
    }
  };

  // Handle decrement
  const handleDecrement = async () => {
    if (!isConnected || !signer) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await decrementCounter(signer);
      setTxHash(tx.transactionHash);
      
      // Add to transaction history
      addToTxHistory('decrement', tx.transactionHash);
      
      // Update count
      const newCount = await getCount(provider);
      setCount(newCount);
    } catch (err) {
      console.error('Error decrementing counter:', err);
      setError('Failed to decrement counter');
    } finally {
      setLoading(false);
    }
  };

  // Handle reset
  const handleReset = async () => {
    if (!isConnected || !signer) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await resetCounter(signer);
      setTxHash(tx.transactionHash);
      
      // Add to transaction history
      addToTxHistory('reset', tx.transactionHash);
      
      // Update count
      const newCount = await getCount(provider);
      setCount(newCount);
    } catch (err) {
      console.error('Error resetting counter:', err);
      setError('Failed to reset counter');
    } finally {
      setLoading(false);
    }
  };
  
  // Add transaction to history
  const addToTxHistory = (action, hash) => {
    const newTx = {
      id: Date.now(),
      action,
      hash,
      timestamp: new Date().toISOString()
    };
    
    setTxHistory(prevHistory => [newTx, ...prevHistory].slice(0, 10)); // Keep only 10 most recent
  };
  
  // Format transaction hash for display
  const formatTxHash = (hash) => {
    if (!hash) return '';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };
  
  // Generate explorer link based on network
  const getExplorerLink = (hash) => {
    // This is a simple example - you would need to determine the correct explorer based on chainId
    return `https://etherscan.io/tx/${hash}`;
  };

  return (
    <div className="dashboard">
      <div className="counter-card">
        <h2>Smart Contract Counter</h2>
        
        {!isConnected ? (
          <div className="connect-prompt">
            <p>Please connect your wallet to interact with the counter.</p>
          </div>
        ) : (
          <>
            <div className="counter-value">
              <h3>Current Count</h3>
              {loading ? (
                <div className="loading-spinner">Loading...</div>
              ) : (
                <div className="count">{count}</div>
              )}
            </div>
            
            <div className="counter-actions">
              <button 
                className="counter-button decrement" 
                onClick={handleDecrement}
                disabled={loading || count === 0}
              >
                Decrement
              </button>
              <button 
                className="counter-button increment" 
                onClick={handleIncrement}
                disabled={loading}
              >
                Increment
              </button>
              <button 
                className="counter-button reset" 
                onClick={handleReset}
                disabled={loading || count === 0}
              >
                Reset
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {txHash && (
              <div className="transaction-info">
                <p>Latest Transaction: 
                  <a 
                    href={getExplorerLink(txHash)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {formatTxHash(txHash)}
                  </a>
                </p>
              </div>
            )}
            
            {txHistory.length > 0 && (
              <div className="transaction-history">
                <h3>Transaction History</h3>
                <ul>
                  {txHistory.map(tx => (
                    <li key={tx.id}>
                      <span className="tx-action">{tx.action}</span>
                      <span className="tx-time">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                      <a 
                        href={getExplorerLink(tx.hash)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="tx-hash"
                      >
                        {formatTxHash(tx.hash)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;