import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Github, Wallet, Zap, Code, Database, ArrowUpRight } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import WalletConnection from '@/components/WalletConnection';
import RPCConnection from '@/components/RPCConnection';
import SmartContractInteraction from '@/components/SmartContractInteraction';
import TransactionHistory from '@/components/TransactionHistory';
import TokenManager from '@/components/TokenManager';
import PresetManager from '@/components/PresetManager';
import HelpModal from '@/components/HelpModal';

interface WalletInfo {
  address: string;
  balance: string;
  isConnected: boolean;
  connectionType: 'private-key' | 'web3-wallet' | null;
}

const Index = () => {
  const [connection, setConnection] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [rpcUrl, setRpcUrl] = useState('');
  const [contract, setContract] = useState(null);
  const [presets, setPresets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const handleWalletChange = (wallet: WalletInfo) => {
    setWalletAddress(wallet.address);
  };

  const handleConnectionChange = (newConnection: any) => {
    setConnection(newConnection);
  };

  const handleWalletAddressChange = (address: string) => {
    setWalletAddress(address);
  };

  const handlePresetsChange = (newPresets: any[]) => {
    setPresets(newPresets);
  };

  const handleContractLoad = (newContract: any) => {
    setContract(newContract);
  };

  const handleTransactionSent = (transaction: any) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const handleTokenInfoUpdate = (tokenInfo: any) => {
    console.log('Token info updated:', tokenInfo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Web3 Toolkit
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Professional blockchain interaction platform
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </Button>
            <HelpModal />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-lg">Wallet Integration</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect multiple wallet providers with seamless Web3Modal integration
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Code className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-lg">Smart Contracts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Interact with any smart contract using dynamic ABI loading and method execution
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-lg">Transaction History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track and manage all your blockchain transactions with detailed history
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <WalletConnection 
              onWalletChange={handleWalletChange}
              rpcUrl={rpcUrl}
            />
            <RPCConnection 
              connection={connection}
              onConnectionChange={handleConnectionChange}
              onWalletAddressChange={handleWalletAddressChange}
            />
            <PresetManager 
              presets={presets}
              onPresetsChange={handlePresetsChange}
              connection={connection}
              contract={contract}
            />
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-1 space-y-6">
            <SmartContractInteraction 
              connection={connection}
              contract={contract}
              onContractLoad={handleContractLoad}
              onTransactionSent={handleTransactionSent}
            />
            <TokenManager 
              connection={connection}
              walletAddress={walletAddress}
              onTokenInfoUpdate={handleTokenInfoUpdate}
              onTransactionSent={handleTransactionSent}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <TransactionHistory 
              transactions={transactions}
              connection={connection}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                v1.0.0
              </Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Built with React, TypeScript & Ethers.js
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="https://docs.ethers.org/" target="_blank" rel="noopener noreferrer">
                  Documentation
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  Support
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
