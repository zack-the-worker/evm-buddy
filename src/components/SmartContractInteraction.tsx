
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Code, Upload, Send, Eye, Edit, Loader2, ExternalLink } from 'lucide-react';

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

interface SmartContractInteractionProps {
  connection: ConnectionState;
  contract: ContractState;
  onContractLoad: (contract: ContractState) => void;
  onTransactionSent: (tx: any) => void;
}

const SmartContractInteraction: React.FC<SmartContractInteractionProps> = ({
  connection,
  contract,
  onContractLoad,
  onTransactionSent
}) => {
  const { toast } = useToast();
  const [contractAddress, setContractAddress] = useState(contract.address);
  const [abiInput, setAbiInput] = useState('');
  const [isLoadingAbi, setIsLoadingAbi] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [methodParams, setMethodParams] = useState<{ [key: string]: string }>({});
  const [gasLimit, setGasLimit] = useState('21000');
  const [gasPrice, setGasPrice] = useState('');
  const [ethValue, setEthValue] = useState('0');
  const [isExecuting, setIsExecuting] = useState(false);

  // Sample ABI for demo
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
      // For demo, use sample ABI
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
      onContractLoad(newContract);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "ABI không hợp lệ",
        variant: "destructive"
      });
    }
  };

  const executeMethod = async () => {
    if (!selectedMethod) return;

    setIsExecuting(true);
    try {
      // Simulate transaction execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const txHash = '0x' + Math.random().toString(16).substr(2, 64);
      const transaction = {
        hash: txHash,
        method: selectedMethod.name,
        params: methodParams,
        timestamp: new Date().toISOString(),
        status: 'success'
      };

      onTransactionSent(transaction);
      
      toast({
        title: "Giao dịch thành công",
        description: `Hash: ${txHash}`,
      });
    } catch (error) {
      toast({
        title: "Giao dịch thất bại",
        description: "Có lỗi xảy ra khi thực hiện giao dịch",
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Contract Setup */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Code className="w-5 h-5 text-blue-600" />
            <span>Thiết lập Contract</span>
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
        </CardContent>
      </Card>

      {/* Method Execution */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-purple-600" />
            <span>Thực hiện Method</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contract.isLoaded ? (
            <Tabs defaultValue="read" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="read" className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>READ ({readMethods.length})</span>
                </TabsTrigger>
                <TabsTrigger value="write" className="flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>WRITE ({writeMethods.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="read" className="space-y-3">
                {readMethods.map((method, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{method.name}</h4>
                        <p className="text-xs text-gray-500">
                          Returns: {method.outputs?.[0]?.type || 'void'}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Gọi
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="write" className="space-y-3">
                {writeMethods.map((method, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{method.name}</h4>
                        <p className="text-xs text-gray-500">
                          {method.inputs?.length || 0} parameters
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedMethod(method)}
                        disabled={isExecuting}
                      >
                        {isExecuting && selectedMethod?.name === method.name ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Thực hiện'
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Vui lòng tải Smart Contract trước</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartContractInteraction;
