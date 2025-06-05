
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Code, 
  Settings, 
  Globe, 
  Coins, 
  Send,
  Save,
  Upload,
  Download,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Copy,
  Eye,
  Loader2
} from 'lucide-react';
import RPCConnection from '@/components/RPCConnection';
import SmartContractInteraction from '@/components/SmartContractInteraction';
import TokenManager from '@/components/TokenManager';
import PresetManager from '@/components/PresetManager';
import TransactionHistory from '@/components/TransactionHistory';

interface ConnectionState {
  rpcUrl: string;
  chainId: number | null;
  isConnected: boolean;
  networkName: string;
}

interface ContractState {
  address: string;
  abi: any[];
  isLoaded: boolean;
}

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
}

const Index = () => {
  const { toast } = useToast();
  const [connection, setConnection] = useState<ConnectionState>({
    rpcUrl: '',
    chainId: null,
    isConnected: false,
    networkName: ''
  });
  
  const [contract, setContract] = useState<ContractState>({
    address: '',
    abi: [],
    isLoaded: false
  });

  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [presets, setPresets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const handleConnectionChange = (newConnection: ConnectionState) => {
    setConnection(newConnection);
    if (newConnection.isConnected) {
      toast({
        title: "Kết nối thành công",
        description: `Đã kết nối với ${newConnection.networkName} (Chain ID: ${newConnection.chainId})`,
      });
    }
  };

  const handleContractLoad = (contractData: ContractState) => {
    setContract(contractData);
    if (contractData.isLoaded) {
      toast({
        title: "Smart Contract đã được tải",
        description: `Địa chỉ: ${contractData.address}`,
      });
    }
  };

  const handleTokenInfoUpdate = (info: TokenInfo) => {
    setTokenInfo(info);
  };

  const handleTransactionSent = (tx: any) => {
    setTransactions(prev => [tx, ...prev]);
    toast({
      title: "Giao dịch đã được gửi",
      description: `Hash: ${tx.hash}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Smart Contract Communicator v1.5.5
                </h1>
                <p className="text-sm text-gray-500">Tương tác với Smart Contract trên EVM</p>
              </div>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              {connection.isConnected ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {connection.networkName}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-500">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Chưa kết nối
                </Badge>
              )}
              
              {walletAddress && (
                <Badge variant="outline" className="font-mono text-xs">
                  <Wallet className="w-3 h-3 mr-1" />
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - RPC & Presets */}
          <div className="space-y-6">
            {/* RPC Connection */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>RPC Connection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RPCConnection 
                  connection={connection}
                  onConnectionChange={handleConnectionChange}
                  onWalletAddressChange={setWalletAddress}
                />
              </CardContent>
            </Card>

            {/* Preset Management */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span>Presets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PresetManager
                  presets={presets}
                  onPresetsChange={setPresets}
                  connection={connection}
                  contract={contract}
                />
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Smart Contract */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Code className="w-5 h-5 text-indigo-600" />
                  <span>Smart Contract</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SmartContractInteraction
                  connection={connection}
                  contract={contract}
                  onContractLoad={handleContractLoad}
                  onTransactionSent={handleTransactionSent}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Token & History */}
          <div className="space-y-6">
            {/* Token Management */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Coins className="w-5 h-5 text-green-600" />
                  <span>ERC-20 Token</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TokenManager
                  connection={connection}
                  walletAddress={walletAddress}
                  onTokenInfoUpdate={handleTokenInfoUpdate}
                  onTransactionSent={handleTransactionSent}
                />
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Send className="w-5 h-5 text-orange-600" />
                  <span>Transaction History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionHistory
                  transactions={transactions}
                  connection={connection}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
