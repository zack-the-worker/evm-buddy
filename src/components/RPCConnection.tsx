
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Globe, Wifi, WifiOff, Loader2 } from 'lucide-react';

interface ConnectionState {
  rpcUrl: string;
  chainId: number | null;
  isConnected: boolean;
  networkName: string;
}

interface RPCConnectionProps {
  connection: ConnectionState;
  onConnectionChange: (connection: ConnectionState) => void;
  onWalletAddressChange: (address: string) => void;
}

const PRESET_NETWORKS = [
  {
    name: 'BSC Mainnet',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    chainId: 56
  },
  {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/demo',
    chainId: 1
  },
  {
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com/',
    chainId: 137
  },
  {
    name: 'BSC Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    chainId: 97
  }
];

const RPCConnection: React.FC<RPCConnectionProps> = ({
  connection,
  onConnectionChange,
  onWalletAddressChange
}) => {
  const { toast } = useToast();
  const [rpcUrl, setRpcUrl] = useState(connection.rpcUrl);
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const getNetworkName = (chainId: number): string => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum Mainnet',
      56: 'BSC Mainnet',
      137: 'Polygon Mainnet',
      97: 'BSC Testnet',
      5: 'Ethereum Goerli',
      11155111: 'Ethereum Sepolia'
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  };

  const connectToRPC = async () => {
    if (!rpcUrl.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập RPC URL",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_chainId',
          params: [],
          id: 1
        })
      });

      if (!response.ok) throw new Error('Không thể kết nối RPC');

      const data = await response.json();
      const chainId = parseInt(data.result, 16);
      const networkName = getNetworkName(chainId);

      const newConnection = {
        rpcUrl,
        chainId,
        isConnected: true,
        networkName
      };

      onConnectionChange(newConnection);

    } catch (error) {
      toast({
        title: "Kết nối thất bại",
        description: "Không thể kết nối đến RPC URL",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    const newConnection = {
      rpcUrl: '',
      chainId: null,
      isConnected: false,
      networkName: ''
    };
    setRpcUrl('');
    onConnectionChange(newConnection);
  };

  const selectPresetNetwork = (network: any) => {
    setRpcUrl(network.rpcUrl);
  };

  const handleWalletAddressSubmit = () => {
    if (walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      onWalletAddressChange(walletAddress);
      toast({
        title: "Địa chỉ ví đã được cập nhật",
        description: walletAddress
      });
    } else {
      toast({
        title: "Lỗi",
        description: "Địa chỉ ví không hợp lệ",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Networks */}
      <div>
        <Label htmlFor="preset-network" className="text-sm font-medium">Mạng có sẵn</Label>
        <Select onValueChange={(value) => {
          const network = PRESET_NETWORKS.find(n => n.name === value);
          if (network) selectPresetNetwork(network);
        }}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Chọn mạng" />
          </SelectTrigger>
          <SelectContent>
            {PRESET_NETWORKS.map((network) => (
              <SelectItem key={network.chainId} value={network.name}>
                {network.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* RPC URL */}
      <div>
        <Label htmlFor="rpc-url" className="text-sm font-medium">RPC URL</Label>
        <Input
          id="rpc-url"
          value={rpcUrl}
          onChange={(e) => setRpcUrl(e.target.value)}
          placeholder="https://bsc-dataseed1.binance.org/"
          className="font-mono text-sm mt-1"
        />
      </div>

      {/* Connection Status */}
      {connection.isConnected && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Đã kết nối</span>
            </div>
            <Badge variant="outline" className="text-green-700 border-green-300">
              Chain: {connection.chainId}
            </Badge>
          </div>
          <p className="text-sm text-green-700 mt-1">{connection.networkName}</p>
        </div>
      )}

      {/* Connect Button */}
      <div className="flex space-x-2">
        <Button 
          onClick={connectToRPC} 
          disabled={isConnecting || !rpcUrl.trim()}
          className="flex-1"
          size="sm"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Kết nối...
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 mr-2" />
              Kết nối
            </>
          )}
        </Button>
        
        {connection.isConnected && (
          <Button variant="outline" onClick={disconnect} size="sm">
            <WifiOff className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Wallet Address */}
      <div className="border-t pt-4">
        <Label htmlFor="wallet-address" className="text-sm font-medium">Địa chỉ ví (tùy chọn)</Label>
        <div className="flex space-x-2 mt-1">
          <Input
            id="wallet-address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            className="font-mono text-sm"
          />
          <Button 
            onClick={handleWalletAddressSubmit}
            disabled={!walletAddress.trim()}
            size="sm"
            variant="outline"
          >
            Set
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RPCConnection;
