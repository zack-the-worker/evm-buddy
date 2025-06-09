
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
import { ethers } from 'ethers';
import PresetManagement from '@/components/PresetManagement';
import MethodExecutionButton from '@/components/MethodExecutionButton';
import WalletConnection from '@/components/WalletConnection';
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

interface WalletInfo {
  address: string;
  balance: string;
  isConnected: boolean;
  connectionType: 'private-key' | 'web3-wallet' | null;
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
  },
  {
    "inputs": [
      {"internalType": "address", "name": "owner", "type": "address"},
      {"internalType": "address", "name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
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
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Wallet State
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: '',
    balance: '',
    isConnected: false,
    connectionType: null
  });

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
  
  // New state for selected method and its parameters
  const [selectedMethodName, setSelectedMethodName] = useState<string>('');
  const [selectedMethodInputs, setSelectedMethodInputs] = useState<any[]>([]);
  const [methodParameters, setMethodParameters] = useState<{ [key: string]: string }>({});

  // New state for ETH value and gas estimation
  const [ethValue, setEthValue] = useState('0');
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);

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

  // Auto-connect to RPC when URL changes
  useEffect(() => {
    const autoConnect = async () => {
      if (!rpcUrl.trim()) {
        setConnection({
          rpcUrl: '',
          chainId: null,
          isConnected: false,
          networkName: ''
        });
        return;
      }

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

        if (!response.ok) throw new Error('Cannot connect to RPC');

        const data = await response.json();
        const chainId = parseInt(data.result, 16);
        const networkName = getNetworkName(chainId);

        setConnection({
          rpcUrl,
          chainId,
          isConnected: true,
          networkName
        });

      } catch (error) {
        setConnection({
          rpcUrl: '',
          chainId: null,
          isConnected: false,
          networkName: ''
        });
      }
    };

    const debounceTimer = setTimeout(autoConnect, 500);
    return () => clearTimeout(debounceTimer);
  }, [rpcUrl]);

  // Auto-load contract when address and ABI change
  useEffect(() => {
    const autoLoadContract = () => {
      if (!contractAddress.trim() || !abiInput.trim()) {
        setContract({
          address: '',
          abi: [],
          isLoaded: false
        });
        return;
      }

      try {
        const abi = JSON.parse(abiInput);
        setContract({
          address: contractAddress,
          abi,
          isLoaded: true
        });
      } catch (error) {
        setContract({
          address: '',
          abi: [],
          isLoaded: false
        });
      }
    };

    const debounceTimer = setTimeout(autoLoadContract, 500);
    return () => clearTimeout(debounceTimer);
  }, [contractAddress, abiInput]);

  const connectToRPC = async () => {
    if (!rpcUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter RPC URL",
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

      if (!response.ok) throw new Error('Cannot connect to RPC');

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
        title: "Connected",
        description: `Connected to ${networkName} (Chain ID: ${chainId})`,
      });

    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Cannot connect to RPC URL",
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
      title: "Disconnected",
      description: "Disconnected from blockchain"
    });
  };

  const selectPresetNetwork = (network: any) => {
    setRpcUrl(network.rpcUrl);
  };

  const handleWalletAddressSubmit = () => {
    if (walletAddress && /^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      toast({
        title: "Wallet address updated",
        description: walletAddress
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid wallet address",
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
            title: "Error",
            description: "Invalid ABI file",
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
        title: "Error",
        description: "Please enter contract address",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingAbi(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAbiInput(JSON.stringify(sampleABI, null, 2));
      
      toast({
        title: "Success",
        description: "ABI loaded from explorer (demo)",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Cannot load ABI from explorer",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAbi(false);
    }
  };

  const loadContract = () => {
    if (!contractAddress || !abiInput) {
      toast({
        title: "Error",
        description: "Please enter contract address and ABI",
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
        title: "Smart Contract loaded",
        description: `Address: ${contractAddress}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid ABI",
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

  // Helper function to format values based on type
  const formatValueByType = (value: any, type: string, name: string = ''): string => {
    if (value === null || value === undefined) return 'null';
    
    switch (type) {
      case 'uint256':
      case 'uint':
        // Special formatting for common token fields
        if (['price', 'mintFee'].includes(name) && typeof value === 'bigint') {
          const ethValue = Number(value) / 1e18;
          return `${ethValue} ETH (${value.toString()} wei)`;
        }
        return typeof value === 'bigint' ? value.toString() : value.toString();
      
      case 'uint80':
      case 'uint32':
      case 'uint24':
      case 'uint96':
        return typeof value === 'bigint' ? value.toString() : value.toString();
      
      case 'string':
        return value.toString();
      
      case 'bool':
        return value ? 'true' : 'false';
      
      case 'address':
        return value.toString();
      
      case 'bytes32':
        return value.toString();
      
      default:
        if (typeof value === 'bigint') {
          return value.toString();
        }
        return value.toString();
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: any): string => {
    const ts = typeof timestamp === 'bigint' ? Number(timestamp) : Number(timestamp);
    if (ts === 0) return '0 (Not set)';
    return `${new Date(ts * 1000).toLocaleString('vi-VN')} (${ts})`;
  };

  // Parse and format method result based on ABI output definition
  const parseMethodResult = (method: any, rawResult: any): string => {
    if (!method.outputs || method.outputs.length === 0) {
      return 'No return value';
    }

    const output = method.outputs[0];
    
    try {
      if (output.type === 'tuple') {
        // Handle complex struct/tuple results
        const components = output.components || [];
        let formatted = '';
        
        // rawResult should be an array for tuple types
        if (Array.isArray(rawResult)) {
          components.forEach((component: any, index: number) => {
            const value = rawResult[index];
            let formattedValue;
            
            if (component.type === 'tuple[]') {
              // Handle array of structs (like stages)
              formattedValue = '\n';
              if (Array.isArray(value)) {
                value.forEach((item: any, itemIndex: number) => {
                  formattedValue += `  [${itemIndex}]:\n`;
                  component.components.forEach((subComponent: any, subIndex: number) => {
                    const subValue = Array.isArray(item) ? item[subIndex] : item?.[subComponent.name];
                    let subFormattedValue = formatValueByType(subValue, subComponent.type, subComponent.name);
                    
                    // Special formatting for timestamps
                    if (['startTimeUnixSeconds', 'endTimeUnixSeconds'].includes(subComponent.name)) {
                      subFormattedValue = formatTimestamp(subValue);
                    }
                    
                    formattedValue += `    ${subComponent.name}: ${subFormattedValue}\n`;
                  });
                });
              }
            } else {
              formattedValue = formatValueByType(value, component.type, component.name);
              
              // Special formatting for timestamps
              if (['startTimeUnixSeconds', 'endTimeUnixSeconds'].includes(component.name)) {
                formattedValue = formatTimestamp(value);
              }
            }
            
            formatted += `${component.name}: ${formattedValue}\n`;
          });
        }
        
        return formatted.trim();
      } else {
        // Handle simple types
        return formatValueByType(rawResult, output.type, method.name);
      }
    } catch (error) {
      console.error('Error parsing method result:', error);
      return `Raw result: ${rawResult}`;
    }
  };

  // Real blockchain call function for READ methods
  const executeRealBlockchainCall = async (method: any, params: any[]): Promise<any> => {
    if (!connection.isConnected) {
      throw new Error('Not connected to RPC');
    }

    try {
      // Create contract interface to properly encode the function call
      const iface = new ethers.Interface([method]);
      
      // Encode the function call with parameters
      const callData = iface.encodeFunctionData(method.name, params);

      console.log(`Real RPC call to ${method.name}:`);
      console.log(`Contract: ${contract.address}`);
      console.log(`Method signature: ${method.name}(${method.inputs?.map((input: any) => input.type).join(',') || ''})`);
      console.log(`Function selector: ${callData.slice(0, 10)}`);
      console.log(`Full call data: ${callData}`);
      console.log(`Parameters:`, params);

      // Make actual RPC call
      const response = await fetch(connection.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_call',
          params: [
            {
              to: contract.address,
              data: callData
            },
            'latest'
          ],
          id: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`RPC call failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
      }

      // Decode the result using ethers
      const result = data.result;
      
      if (!result || result === '0x') {
        return null;
      }

      // Use ethers to decode the result
      const decodedResult = iface.decodeFunctionResult(method.name, result);
      
      // Return the decoded result (can be array for tuple types)
      return decodedResult.length === 1 ? decodedResult[0] : decodedResult;

    } catch (error) {
      console.error('Error in executeRealBlockchainCall:', error);
      throw error;
    }
  };

  const simulateBlockchainCall = async (method: any, params: any[]): Promise<any> => {
    console.log(`Calling ${method.name} with params:`, params);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Simulate real blockchain responses based on method type
    switch (method.name) {
      case 'name':
        return 'MyToken';
      
      case 'symbol':
        return 'MTK';
      
      case 'totalSupply':
        return '1000000000000000000000000'; // 1M tokens with 18 decimals
      
      case 'balanceOf':
        const address = params[0];
        if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error('Invalid address format');
        }
        // Simulate different balances for different addresses
        const lastDigit = parseInt(address.slice(-1), 16);
        return (BigInt(lastDigit) * BigInt('1000000000000000000')).toString(); // lastDigit ETH
      
      case 'allowance':
        const owner = params[0];
        const spender = params[1];
        if (!owner?.match(/^0x[a-fA-F0-9]{40}$/) || !spender?.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error('Invalid address format');
        }
        return '500000000000000000000'; // 500 tokens allowed
      
      case 'transfer':
        const to = params[0];
        const amount = params[1];
        if (!to?.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error('Invalid recipient address');
        }
        if (!amount || BigInt(amount) <= 0) {
          throw new Error('Invalid transfer amount');
        }
        // Return transaction hash for write operations
        return '0x' + Math.random().toString(16).substr(2, 64);
      
      default:
        // For unknown methods, return realistic mock data based on method type
        const isWriteMethod = method.stateMutability === 'nonpayable' || method.stateMutability === 'payable';
        
        if (isWriteMethod) {
          // Return transaction hash for write operations
          return '0x' + Math.random().toString(16).substr(2, 64);
        } else {
          // For read methods, return data based on expected output type
          const outputType = method.outputs?.[0]?.type;
          
          switch (outputType) {
            case 'uint256':
            case 'uint':
              return Math.floor(Math.random() * 1000000).toString();
            
            case 'string':
              return `Sample string result for ${method.name}`;
            
            case 'bool':
              return Math.random() > 0.5;
            
            case 'address':
              return '0x' + Math.random().toString(16).substr(2, 40);
            
            case 'bytes32':
              return '0x' + Math.random().toString(16).substr(2, 64);
            
            default:
              return Math.floor(Math.random() * 1000).toString();
          }
        }
    }
  };

  const formatMethodResult = (method: any, result: any): string => {
    const isWriteMethod = method.stateMutability === 'nonpayable' || method.stateMutability === 'payable';
    
    if (isWriteMethod) {
      return `Transaction Hash: ${result}`;
    }
    
    // Use new parsing function for read methods
    return parseMethodResult(method, result);
  };

  const executeSelectedMethod = async () => {
    if (!selectedMethod || !connection.isConnected) {
      toast({
        title: "Error",
        description: "Please select a method and connect to RPC",
        variant: "destructive"
      });
      return;
    }

    const isReadMethod = selectedMethod.stateMutability === 'view' || selectedMethod.stateMutability === 'pure';
    
    if (!isReadMethod && !walletInfo.isConnected) {
      toast({
        title: "Error",
        description: "Please enter wallet address for WRITE method",
        variant: "destructive"
      });
      return;
    }

    setIsExecuting(true);
    try {
      // Prepare method parameters
      const params = selectedMethodInputs.map((input: any, index: number) => {
        const paramValue = methodParameters[`param_${index}`] || '';
        
        // Validate required parameters
        if (!paramValue && input.type !== 'bool') {
          throw new Error(`Parameter ${input.name || `#${index + 1}`} is required`);
        }
        
        if (input.type === 'uint256' || input.type.startsWith('uint')) {
          if (!/^\d+$/.test(paramValue)) {
            throw new Error(`Parameter ${input.name || `#${index + 1}`} must be an integer`);
          }
          return paramValue;
        } else if (input.type === 'address') {
          if (!paramValue.match(/^0x[a-fA-F0-9]{40}$/)) {
            throw new Error(`Parameter ${input.name || `#${index + 1}`} is not a valid address`);
          }
          return paramValue;
        } else if (input.type === 'bool') {
          return paramValue.toLowerCase() === 'true';
        }
        return paramValue;
      });

      console.log(`Executing ${selectedMethod.name} with parameters:`, params);

      let result;
      if (isReadMethod) {
        // Use real RPC call for READ methods
        result = await executeRealBlockchainCall(selectedMethod, params);
      } else {
        // Use simulation for WRITE methods (until private key is implemented)
        result = await simulateBlockchainCall(selectedMethod, params);
      }
      
      const formattedResult = formatMethodResult(selectedMethod, result);

      setMethodResult({
        method: selectedMethod.name,
        result: formattedResult,
        rawResult: result,
        type: isReadMethod ? 'read' : 'write',
        gasUsed: isReadMethod ? undefined : gasLimit,
        gasPrice: isReadMethod ? undefined : (gasPrice || '20'),
        timestamp: new Date().toISOString(),
        isRealCall: isReadMethod // Flag to indicate if this was a real RPC call
      });

      toast({
        title: isReadMethod ? "Read successful" : "Transaction successful (Simulated)",
        description: `${selectedMethod.name}: Success`,
      });

    } catch (error) {
      console.error('Method execution error:', error);
      
      setMethodResult({
        method: selectedMethod.name,
        result: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        rawResult: null,
        type: isReadMethod ? 'read' : 'write',
        error: true,
        timestamp: new Date().toISOString()
      });

      toast({
        title: isReadMethod ? "Error reading data" : "Transaction failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Enhanced blockchain call function with gas estimation
  const estimateGasForMethod = async (method: any, params: any[]): Promise<{ gasLimit: string; gasPrice: string }> => {
    if (!connection.isConnected) {
      throw new Error('Not connected to RPC');
    }

    try {
      const iface = new ethers.Interface([method]);
      const callData = iface.encodeFunctionData(method.name, params);

      console.log(`Estimating gas for ${method.name}:`, params);

      // Estimate gas limit
      const gasLimitResponse = await fetch(connection.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_estimateGas',
          params: [
            {
              to: contract.address,
              data: callData,
              value: ethValue !== '0' ? `0x${BigInt(ethers.parseEther(ethValue)).toString(16)}` : undefined,
              from: walletInfo.address || undefined
            }
          ],
          id: Date.now()
        })
      });

      if (!gasLimitResponse.ok) {
        throw new Error(`Gas estimation failed: ${gasLimitResponse.statusText}`);
      }

      const gasLimitData = await gasLimitResponse.json();
      
      if (gasLimitData.error) {
        throw new Error(`Gas estimation error: ${gasLimitData.error.message}`);
      }

      // Get current gas price
      const gasPriceResponse = await fetch(connection.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: Date.now() + 1
        })
      });

      const gasPriceData = await gasPriceResponse.json();
      const estimatedGasLimit = parseInt(gasLimitData.result, 16);
      const currentGasPrice = gasPriceData.result ? parseInt(gasPriceData.result, 16) : 20000000000; // 20 Gwei fallback
      
      // Add 20% buffer to gas limit
      const gasLimitWithBuffer = Math.floor(estimatedGasLimit * 1.2);
      const gasPriceInGwei = Math.floor(currentGasPrice / 1000000000);

      return {
        gasLimit: gasLimitWithBuffer.toString(),
        gasPrice: gasPriceInGwei.toString()
      };

    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  };

  const handleEstimateGas = async () => {
    if (!selectedMethod || !connection.isConnected) {
      toast({
        title: "Error",
        description: "Please select a method and connect to RPC",
        variant: "destructive"
      });
      return;
    }

    setIsEstimatingGas(true);
    try {
      // Prepare method parameters
      const params = selectedMethodInputs.map((input: any, index: number) => {
        const paramValue = methodParameters[`param_${index}`] || '';
        
        if (!paramValue && input.type !== 'bool') {
          throw new Error(`Parameter ${input.name || `#${index + 1}`} is required`);
        }
        
        if (input.type === 'uint256' || input.type.startsWith('uint')) {
          if (!/^\d+$/.test(paramValue)) {
            throw new Error(`Parameter ${input.name || `#${index + 1}`} must be an integer`);
          }
          return paramValue;
        } else if (input.type === 'address') {
          if (!paramValue.match(/^0x[a-fA-F0-9]{40}$/)) {
            throw new Error(`Parameter ${input.name || `#${index + 1}`} is not a valid address`);
          }
          return paramValue;
        } else if (input.type === 'bool') {
          return paramValue.toLowerCase() === 'true';
        }
        return paramValue;
      });

      const gasEstimate = await estimateGasForMethod(selectedMethod, params);
      
      setGasLimit(gasEstimate.gasLimit);
      setGasPrice(gasEstimate.gasPrice);

      toast({
        title: "Gas estimated",
        description: `Gas Limit: ${gasEstimate.gasLimit}, Gas Price: ${gasEstimate.gasPrice} Gwei`,
      });

    } catch (error) {
      console.error('Gas estimation error:', error);
      toast({
        title: "Error estimating gas",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsEstimatingGas(false);
    }
  };

  // Preset handling functions
  const handleLoadPreset = (preset: any) => {
    setRpcUrl(preset.rpcUrl);
    setContractAddress(preset.contractAddress);
    setAbiInput(preset.abi);
    setGasLimit(preset.gasLimit);
    setGasPrice(preset.gasPrice);
  };

  const getCurrentPresetData = () => ({
    rpcUrl,
    contractAddress,
    abi: abiInput,
    walletAddress: walletInfo.address,
    gasLimit,
    gasPrice
  });

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
                <p className="text-sm text-gray-500">Interact with Smart Contracts on EVM</p>
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
                  Not Connected
                </Badge>
              )}
              
              {walletInfo.isConnected && (
                <Badge variant="outline" className="font-mono text-xs">
                  <Wallet className="w-3 h-3 mr-1" />
                  {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Preset Management */}
        <PresetManagement 
          onLoadPreset={handleLoadPreset}
          currentData={getCurrentPresetData()}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - RPC Connection & Wallet */}
          <div className="space-y-6">
            {/* RPC Connection */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>RPC Connection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Networks */}
                <div>
                  <Label htmlFor="preset-network">Preset Networks</Label>
                  <Select onValueChange={(value) => {
                    const network = PRESET_NETWORKS.find(n => n.name === value);
                    if (network) setRpcUrl(network.rpcUrl);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preset network" />
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

                {/* Custom RPC URL - Auto-connect */}
                <div>
                  <Label htmlFor="rpc-url">RPC URL (Auto-connect)</Label>
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
                        <span className="text-sm font-medium text-green-800">Connected</span>
                      </div>
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Chain ID: {connection.chainId}
                      </Badge>
                    </div>
                    <p className="text-sm text-green-700 mt-1">{connection.networkName}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wallet Connection */}
            <WalletConnection 
              onWalletChange={setWalletInfo}
              rpcUrl={rpcUrl}
            />
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
                {/* Contract Address - Auto-load */}
                <div>
                  <Label htmlFor="contract-address">Contract Address (Auto-load)</Label>
                  <Input
                    id="contract-address"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x..."
                    className="font-mono text-sm"
                  />
                </div>

                {/* ABI Input - Auto-load */}
                <div>
                  <Label htmlFor="abi-input">ABI (Auto-load)</Label>
                  <Textarea
                    id="abi-input"
                    value={abiInput}
                    onChange={(e) => setAbiInput(e.target.value)}
                    placeholder="Paste ABI JSON or load from file..."
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
                      Load from file
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
                    Load from Explorer
                  </Button>
                </div>

                {/* Contract Status */}
                {contract.isLoaded && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-green-700 border-green-300">
                        Contract loaded
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
                        <span>Execute Method</span>
                      </h4>
                      
                      {/* Method Selection */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="method-select">Select Method</Label>
                          <Select value={selectedMethodName} onValueChange={handleMethodSelect}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select method to execute" />
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
                            <Label>Method Parameters</Label>
                            <div className="space-y-3 mt-2">
                              {selectedMethodInputs.map((input: any, index: number) => (
                                <div key={index} className="space-y-1">
                                  <Label htmlFor={`param-${index}`} className="text-sm">
                                    {input.name || `Parameter ${index + 1}`} 
                                    <span className="text-gray-500 ml-1">({input.type})</span>
                                  </Label>
                                  <Input
                                    id={`param-${index}`}
                                    value={methodParameters[`param_${index}`] || ''}
                                    onChange={(e) => updateParameter(index, e.target.value)}
                                    placeholder={`Enter value ${input.type}`}
                                    className="font-mono text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ETH Value for WRITE methods */}
                        {selectedMethod && (selectedMethod.stateMutability === 'nonpayable' || selectedMethod.stateMutability === 'payable') && (
                          <div className="space-y-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <Label className="text-sm font-medium">Transaction Settings (WRITE Method)</Label>
                            
                            {/* ETH Value */}
                            <div>
                              <Label htmlFor="eth-value" className="text-xs">ETH Value (ETH sent with transaction)</Label>
                              <Input
                                id="eth-value"
                                value={ethValue}
                                onChange={(e) => setEthValue(e.target.value)}
                                placeholder="0"
                                className="text-sm"
                                type="number"
                                step="0.001"
                                min="0"
                              />
                            </div>

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

                        {/* Execute Button with Dropdown */}
                        {selectedMethod && (selectedMethod.stateMutability === 'nonpayable' || selectedMethod.stateMutability === 'payable') ? (
                          <MethodExecutionButton
                            onExecute={executeSelectedMethod}
                            onEstimateGas={handleEstimateGas}
                            isExecuting={isExecuting}
                            isEstimatingGas={isEstimatingGas}
                            disabled={!selectedMethod || !connection.isConnected}
                          />
                        ) : (
                          <Button 
                            onClick={executeSelectedMethod}
                            disabled={!selectedMethod || isExecuting || !connection.isConnected}
                            className="w-full"
                          >
                            {isExecuting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Executing...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Call Method
                              </>
                            )}
                          </Button>
                        )}

                        {/* Enhanced Method Results */}
                        {methodResult && (
                          <div className={`p-4 border rounded-lg ${methodResult.error ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-sm flex items-center space-x-2">
                                <span>Result: {methodResult.method}</span>
                                {methodResult.error && <AlertCircle className="w-4 h-4 text-red-600" />}
                              </h5>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className={methodResult.type === 'read' ? 'border-blue-300 text-blue-700' : 'border-green-300 text-green-700'}>
                                  {methodResult.type.toUpperCase()}
                                </Badge>
                                {methodResult.error && (
                                  <Badge variant="outline" className="border-red-300 text-red-700">
                                    ERROR
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs text-gray-600">Result:</Label>
                                <pre className={`text-sm font-mono break-all bg-white p-3 rounded border whitespace-pre-wrap ${methodResult.error ? 'text-red-700 border-red-200' : ''}`}>
                                  {methodResult.result}
                                </pre>
                              </div>
                              
                              {methodResult.rawResult && !methodResult.error && (
                                <div>
                                  <Label className="text-xs text-gray-600">Raw Result:</Label>
                                  <pre className="text-xs font-mono text-gray-500 bg-gray-50 p-2 rounded border break-all whitespace-pre-wrap">
                                    {JSON.stringify(methodResult.rawResult, (key, value) => 
                                      typeof value === 'bigint' ? value.toString() : value, 2
                                    )}
                                  </pre>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
                                <span>Time: {new Date(methodResult.timestamp).toLocaleString('vi-VN')}</span>
                                {methodResult.type === 'write' && !methodResult.error && (
                                  <span>Gas: {methodResult.gasUsed} | {methodResult.gasPrice} Gwei</span>
                                )}
                              </div>
                            </div>
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
