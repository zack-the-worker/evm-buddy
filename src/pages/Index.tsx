import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Upload,
  Wifi,
  WifiOff,
  Loader2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit
} from 'lucide-react';

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

const PRESET_NETWORKS = [
  {
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/demo',
    chainId: 1
  },
  {
    name: 'BSC Mainnet',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    chainId: 56
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
  },
  {
    name: 'Ethereum Goerli',
    rpcUrl: 'https://goerli.infura.io/v3/demo',
    chainId: 5
  }
];

const sampleABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const Index = () => {
  const { toast } = useToast();
  
  // RPC Connection State
  const [connection, setConnection] = useState<ConnectionState>({
    rpcUrl: '',
    chainId: null,
    isConnected: false,
    networkName: ''
  });
  const [rpcUrl, setRpcUrl] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Smart Contract State
  const [contract, setContract] = useState<ContractState>({
    address: '',
    abi: [],
    isLoaded: false
  });
  const [contractAddress, setContractAddress] = useState('');
  const [abiInput, setAbiInput] = useState('');
  const [isLoadingAbi, setIsLoadingAbi] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [methodParams, setMethodParams] = useState<{ [key: string]: string }>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [methodResult, setMethodResult] = useState<any>(null);
  const [gasLimit, setGasLimit] = useState('100000');
  const [gasPrice, setGasPrice] = useState('');
  const [ethValue, setEthValue] = useState('0');

  // New state for selected method and its parameters
  const [selectedMethodName, setSelectedMethodName] = useState<string>('');
  const [selectedMethodInputs, setSelectedMethodInputs] = useState<any[]>([]);
  const [methodParameters, setMethodParameters] = useState<{ [key: string]: string }>({});

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

      setConnection(newConnection);
      toast({
        title: "Kết nối thành công",
        description: `Đã kết nối với ${networkName} (Chain ID: ${chainId})`,
      });

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
    setConnection({
      rpcUrl: '',
      chainId: null,
      isConnected: false,
      networkName: ''
    });
    setRpcUrl('');
    toast({
      title: "Đã ngắt kết nối",
      description: "Đã ngắt kết nối khỏi blockchain"
    });
  };

  const selectPresetNetwork = (network: any) => {
    setRpcUrl(network.rpcUrl);
  };

  const handleWalletAddressSubmit = () => {
    if (walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
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

  const loadABIFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const abi = JSON.parse(e.target?.result as string);
          setAbiInput(JSON.stringify(abi, null, 2));
        } catch (error) {
          toast({
            title: "Lỗi",
            description: "File ABI không hợp lệ",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const loadABIFromExplorer = async () => {
    if (!contractAddress) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ contract",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingAbi(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAbiInput(JSON.stringify(sampleABI, null, 2));
      
      toast({
        title: "Thành công",
        description: "Đã tải ABI từ explorer (demo)",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải ABI từ explorer",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAbi(false);
    }
  };

  const loadContract = () => {
    if (!contractAddress || !abiInput) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ contract và ABI",
        variant: "destructive"
      });
      return;
    }

    try {
      const abi = JSON.parse(abiInput);
      const newContract = {
        address: contractAddress,
        abi,
        isLoaded: true
      };
      setContract(newContract);
      toast({
        title: "Smart Contract đã được tải",
        description: `Địa chỉ: ${contractAddress}`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "ABI không hợp lệ",
        variant: "destructive"
      });
    }
  };

  const handleMethodSelect = (methodName: string) => {
    setSelectedMethodName(methodName);
    
    // Find the selected method
    const allMethods = [...readMethods, ...writeMethods];
    const method = allMethods.find(m => m.name === methodName);
    
    if (method) {
      setSelectedMethod(method);
      setSelectedMethodInputs(method.inputs || []);
      
      // Reset parameters
      const newParams: { [key: string]: string } = {};
      (method.inputs || []).forEach((input: any, index: number) => {
        newParams[`param_${index}`] = '';
      });
      setMethodParameters(newParams);
    }
  };

  const updateParameter = (paramIndex: number, value: string) => {
    setMethodParameters(prev => ({
      ...prev,
      [`param_${paramIndex}`]: value
    }));
  };

  const executeSelectedMethod = async () => {
    if (!selectedMethod || !connection.isConnected) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn method và kết nối RPC",
        variant: "destructive"
      });
      return;
    }

    const isReadMethod = selectedMethod.stateMutability === 'view' || selectedMethod.stateMutability === 'pure';
    
    if (!isReadMethod && !walletAddress) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ ví cho WRITE method",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    try {
      // Prepare method parameters
      const params = selectedMethodInputs.map((input: any, index: number) => {
        const paramValue = methodParameters[`param_${index}`] || '';
        
        if (input.type === 'uint256' || input.type.startsWith('uint')) {
          return paramValue;
        } else if (input.type === 'address') {
          return paramValue;
        } else if (input.type === 'bool') {
          return paramValue.toLowerCase() === 'true';
        }
        return paramValue;
      });

      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, isReadMethod ? 1000 : 2000));
      
      let result;
      if (isReadMethod) {
        // Simulate read results
        if (selectedMethod.name === 'name' || selectedMethod.name === 'symbol') {
          result = selectedMethod.name === 'name' ? 'Demo Token' : 'DEMO';
        } else if (selectedMethod.name === 'totalSupply' || selectedMethod.name === 'balanceOf') {
          result = '1000000000000000000000'; // 1000 tokens with 18 decimals
        } else {
          result = 'Success';
        }
      } else {
        // Simulate transaction hash for write methods
        result = '0x' + Math.random().toString(16).substr(2, 64);
      }

      setMethodResult({
        method: selectedMethod.name,
        result: result,
        type: isReadMethod ? 'read' : 'write',
        gasUsed: isReadMethod ? undefined : gasLimit,
        gasPrice: isReadMethod ? undefined : (gasPrice || '20')
      });

      toast({
        title: isReadMethod ? "Đọc dữ liệu thành công" : "Giao dịch thành công",
        description: `${selectedMethod.name}: ${result}`,
      });

    } catch (error) {
      toast({
        title: isReadMethod ? "Lỗi khi đọc dữ liệu" : "Giao dịch thất bại",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const readMethods = contract.abi.filter(method => 
    method.type === 'function' && 
    (method.stateMutability === 'view' || method.stateMutability === 'pure')
  );

  const writeMethods = contract.abi.filter(method => 
    method.type === 'function' && 
    (method.stateMutability === 'nonpayable' || method.stateMutability === 'payable')
  );

  const allMethods = [...readMethods, ...writeMethods];

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - RPC Connection */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>Kết nối RPC</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Networks */}
                <div>
                  <Label htmlFor="preset-network">Mạng có sẵn</Label>
                  <Select onValueChange={(value) => {
                    const network = PRESET_NETWORKS.find(n => n.name === value);
                    if (network) selectPresetNetwork(network);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mạng có sẵn" />
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

                {/* Custom RPC URL */}
                <div>
                  <Label htmlFor="rpc-url">RPC URL</Label>
                  <Input
                    id="rpc-url"
                    value={rpcUrl}
                    onChange={(e) => setRpcUrl(e.target.value)}
                    placeholder="https://bsc-dataseed1.binance.org/"
                    className="font-mono text-sm"
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
                        Chain ID: {connection.chainId}
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
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang kết nối...
                      </>
                    ) : (
                      <>
                        <Wifi className="w-4 h-4 mr-2" />
                        Kết nối
                      </>
                    )}
                  </Button>
                  
                  {connection.isConnected && (
                    <Button variant="outline" onClick={disconnect}>
                      <WifiOff className="w-4 h-4 mr-2" />
                      Ngắt kết nối
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Wallet Address */}
                <div>
                  <Label htmlFor="wallet-address">Địa chỉ ví (tùy chọn)</Label>
                  <Input
                    id="wallet-address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x742d35Cc6435C14C5f2f6e32f3e1a93b71A2c11C"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Dùng để hiển thị số dư token và thông tin ví
                  </p>
                </div>

                <Button 
                  onClick={handleWalletAddressSubmit}
                  disabled={!walletAddress.trim()}
                  className="w-full"
                  variant="outline"
                >
                  Cập nhật địa chỉ ví
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Smart Contract */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-5 h-5 text-purple-600" />
                  <span>Smart Contract</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contract Address */}
                <div>
                  <Label htmlFor="contract-address">Địa chỉ Smart Contract</Label>
                  <Input
                    id="contract-address"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x..."
                    className="font-mono text-sm"
                  />
                </div>

                {/* ABI Input */}
                <div>
                  <Label htmlFor="abi-input">ABI (Application Binary Interface)</Label>
                  <Textarea
                    id="abi-input"
                    value={abiInput}
                    onChange={(e) => setAbiInput(e.target.value)}
                    placeholder="Dán ABI JSON hoặc tải từ file..."
                    className="h-32 font-mono text-xs"
                  />
                </div>

                {/* Load ABI Options */}
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json"
                      onChange={loadABIFromFile}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Tải từ file
                    </Button>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadABIFromExplorer}
                    disabled={isLoadingAbi}
                  >
                    {isLoadingAbi ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4 mr-2" />
                    )}
                    Tải từ Explorer
                  </Button>
                </div>

                {/* Load Contract */}
                <Button 
                  onClick={loadContract}
                  disabled={!contractAddress || !abiInput || !connection.isConnected}
                  className="w-full"
                >
                  Tải Smart Contract
                </Button>

                {/* Contract Status */}
                {contract.isLoaded && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Contract đã tải
                      </Badge>
                    </div>
                    <p className="text-xs text-green-700 mt-1 font-mono">{contract.address}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {readMethods.length} READ methods, {writeMethods.length} WRITE methods
                    </p>
                  </div>
                )}

                {/* Method Execution */}
                {contract.isLoaded && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <Send className="w-4 h-4 text-purple-600" />
                        <span>Thực hiện Method</span>
                      </h4>
                      
                      {/* Method Selection */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="method-select">Chọn Method</Label>
                          <Select value={selectedMethodName} onValueChange={handleMethodSelect}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn method để thực hiện" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border shadow-lg z-50">
                              {readMethods.length > 0 && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-b">
                                    READ METHODS
                                  </div>
                                  {readMethods.map((method, index) => (
                                    <SelectItem key={`read-${index}`} value={method.name}>
                                      <div className="flex items-center space-x-2">
                                        <Eye className="w-3 h-3 text-blue-600" />
                                        <span>{method.name}</span>
                                        <Badge variant="outline" className="text-xs">READ</Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                              
                              {writeMethods.length > 0 && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-b">
                                    WRITE METHODS
                                  </div>
                                  {writeMethods.map((method, index) => (
                                    <SelectItem key={`write-${index}`} value={method.name}>
                                      <div className="flex items-center space-x-2">
                                        <Edit className="w-3 h-3 text-orange-600" />
                                        <span>{method.name}</span>
                                        <Badge variant="outline" className="text-xs">WRITE</Badge>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Method Parameters */}
                        {selectedMethod && selectedMethodInputs.length > 0 && (
                          <div>
                            <Label>Tham số của Method</Label>
                            <div className="space-y-3 mt-2">
                              {selectedMethodInputs.map((input: any, index: number) => (
                                <div key={index} className="space-y-1">
                                  <Label htmlFor={`param-${index}`} className="text-sm">
                                    {input.name || `Tham số ${index + 1}`} 
                                    <span className="text-gray-500 ml-1">({input.type})</span>
                                  </Label>
                                  <Input
                                    id={`param-${index}`}
                                    value={methodParameters[`param_${index}`] || ''}
                                    onChange={(e) => updateParameter(index, e.target.value)}
                                    placeholder={`Nhập giá trị ${input.type}`}
                                    className="font-mono text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Gas Settings for WRITE methods */}
                        {selectedMethod && (selectedMethod.stateMutability === 'nonpayable' || selectedMethod.stateMutability === 'payable') && (
                          <div className="space-y-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <Label className="text-sm font-medium">Cài đặt Gas (WRITE Method)</Label>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label htmlFor="gas-limit" className="text-xs">Gas Limit</Label>
                                <Input
                                  id="gas-limit"
                                  value={gasLimit}
                                  onChange={(e) => setGasLimit(e.target.value)}
                                  placeholder="100000"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="gas-price" className="text-xs">Gas Price (Gwei)</Label>
                                <Input
                                  id="gas-price"
                                  value={gasPrice}
                                  onChange={(e) => setGasPrice(e.target.value)}
                                  placeholder="20"
                                  className="text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Execute Button */}
                        <Button 
                          onClick={executeSelectedMethod}
                          disabled={!selectedMethod || isExecuting || !connection.isConnected}
                          className="w-full"
                        >
                          {isExecuting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Đang thực hiện...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Gọi Method
                            </>
                          )}
                        </Button>

                        {/* Method Results */}
                        {methodResult && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-sm">Kết quả: {methodResult.method}</h5>
                              <Badge variant="outline" className={methodResult.type === 'read' ? 'border-blue-300 text-blue-700' : 'border-green-300 text-green-700'}>
                                {methodResult.type.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm font-mono break-all bg-white p-2 rounded border">
                              {methodResult.result}
                            </p>
                            {methodResult.type === 'write' && (
                              <div className="mt-2 text-xs text-gray-600">
                                Gas Used: {methodResult.gasUsed} | Gas Price: {methodResult.gasPrice} Gwei
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
