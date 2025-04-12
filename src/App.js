import React from 'react';
import { WalletProvider } from './contexts/WalletContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <WalletProvider>
      <div className="app">
        <Navbar />
        <main className="content">
          <Dashboard />
        </main>
        <footer className="footer">
          <p>Polygon Blockchain dApp Demo © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </WalletProvider>
  );
}

export default App;