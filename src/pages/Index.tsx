
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Copy
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
                  Smart Contract Communicator
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="connection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="connection" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Kết nối RPC</span>
            </TabsTrigger>
            <TabsTrigger value="contract" className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Smart Contract</span>
            </TabsTrigger>
            <TabsTrigger value="token" className="flex items-center space-x-2">
              <Coins className="w-4 h-4" />
              <span className="hidden sm:inline">Token ERC-20</span>
            </TabsTrigger>
            <TabsTrigger value="presets" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Preset</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Lịch sử</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connection">
            <RPCConnection 
              connection={connection}
              onConnectionChange={handleConnectionChange}
              onWalletAddressChange={setWalletAddress}
            />
          </TabsContent>

          <TabsContent value="contract">
            <SmartContractInteraction
              connection={connection}
              contract={contract}
              onContractLoad={handleContractLoad}
              onTransactionSent={handleTransactionSent}
            />
          </TabsContent>

          <TabsContent value="token">
            <TokenManager
              connection={connection}
              walletAddress={walletAddress}
              onTokenInfoUpdate={handleTokenInfoUpdate}
              onTransactionSent={handleTransactionSent}
            />
          </TabsContent>

          <TabsContent value="presets">
            <PresetManager
              presets={presets}
              onPresetsChange={setPresets}
              connection={connection}
              contract={contract}
            />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory
              transactions={transactions}
              connection={connection}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
