import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import './Navbar.css';

const Navbar = () => {
  const { 
    isConnected, 
    address, 
    chainName, 
    loading, 
    error, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  // Format address for display
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Handle connect/disconnect
  const handleWalletConnection = () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Counter dApp</h1>
      </div>
      <div className="navbar-wallet">
        {isConnected && (
          <div className="wallet-info">
            <div className="network-badge">
              {chainName}
            </div>
            <div className="address-badge">
              {formatAddress(address)}
            </div>
          </div>
        )}
        <button 
          className={`wallet-button ${isConnected ? 'connected' : ''}`}
          onClick={handleWalletConnection}
          disabled={loading}
        >
          {loading ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </nav>
  );
};

export default Navbar;