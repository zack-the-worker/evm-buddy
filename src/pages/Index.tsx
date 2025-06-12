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
  Edit,
  Trash2,
  ScrollText,
  Github
} from 'lucide-react';
import HelpModal from '@/components/HelpModal';

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

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'RPC' | 'CONTRACT' | 'WALLET' | 'ERROR';
  action: string;
  details: string;
  rawData?: any;
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

  // New state for logs
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Helper function to add log entry
  const addLog = (type: LogEntry['type'], action: string, details: string, rawData?: any) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      type,
      action,
      details,
      rawData
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Helper function to clear logs
  const clearLogs = () => {
    setLogs([]);
    addLog('WALLET', 'CLEAR_LOGS', 'All logs cleared by user');
  };

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
        addLog('RPC', 'AUTO_CONNECT_ATTEMPT', `Attempting to connect to ${rpcUrl}`);

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

        addLog('RPC', 'AUTO_CONNECT_SUCCESS', `Connected to ${networkName} (Chain ID: ${chainId})`, {
          rpcUrl,
          chainId,
          networkName,
          response: data
        });

      } catch (error) {
        setConnection({
          rpcUrl: '',
          chainId: null,
          isConnected: false,
          networkName: ''
        });
        addLog('ERROR', 'AUTO_CONNECT_FAILED', `Failed to connect to RPC: ${error}`, { rpcUrl, error });
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
        addLog('CONTRACT', 'AUTO_LOAD_SUCCESS', `Contract loaded at ${contractAddress}`, {
          address: contractAddress,
          abi,
          methodCount: abi.filter((item: any) => item.type === 'function').length
        });
      } catch (error) {
        setContract({
          address: '',
          abi: [],
          isLoaded: false
        });
        addLog('ERROR', 'AUTO_LOAD_FAILED', `Failed to load contract: ${error}`, { contractAddress, abiInput, error });
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
    addLog('RPC', 'MANUAL_CONNECT_ATTEMPT', `Manual connection attempt to ${rpcUrl}`);
    
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
      addLog('RPC', 'MANUAL_CONNECT_SUCCESS', `Successfully connected to ${networkName}`, {
        ...newConnection,
        response: data
      });
      
      toast({
        title: "Connected",
        description: `Connected to ${networkName} (Chain ID: ${chainId})`,
      });

    } catch (error) {
      addLog('ERROR', 'MANUAL_CONNECT_FAILED', `Manual connection failed: ${error}`, { rpcUrl, error });
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
    addLog('RPC', 'DISCONNECT', `Disconnected from ${connection.networkName || 'unknown network'}`);
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
    addLog('RPC', 'PRESET_SELECTED', `Selected preset network: ${network.name}`, network);
    setRpcUrl(network.rpcUrl);
  };

  const handleWalletAddressSubmit = () => {
    if (walletInfo.address && /^0x[a-fA-F0-9]{40}$/.test(walletInfo.address)) {
      addLog('WALLET', 'ADDRESS_UPDATED', `Wallet address updated to ${walletInfo.address}`);
      toast({
        title: "Wallet address updated",
        description: walletInfo.address
      });
    } else {
      addLog('ERROR', 'INVALID_ADDRESS', `Invalid wallet address: ${walletInfo.address}`);
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
      addLog('CONTRACT', 'ABI_FILE_UPLOAD', `Loading ABI from file: ${file.name}`);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const abi = JSON.parse(e.target?.result as string);
          setAbiInput(JSON.stringify(abi, null, 2));
          addLog('CONTRACT', 'ABI_FILE_SUCCESS', `ABI loaded from file successfully`, { filename: file.name, abi });
        } catch (error) {
          addLog('ERROR', 'ABI_FILE_FAILED', `Failed to parse ABI file: ${error}`, { filename: file.name, error });
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
    addLog('CONTRACT', 'ABI_EXPLORER_ATTEMPT', `Attempting to load ABI from explorer for ${contractAddress}`);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAbiInput(JSON.stringify(sampleABI, null, 2));
      
      addLog('CONTRACT', 'ABI_EXPLORER_SUCCESS', 'ABI loaded from explorer (demo)', { contractAddress, abi: sampleABI });
      toast({
        title: "Success",
        description: "ABI loaded from explorer (demo)",
      });
    } catch (error) {
      addLog('ERROR', 'ABI_EXPLORER_FAILED', `Failed to load ABI from explorer: ${error}`, { contractAddress, error });
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
      addLog('CONTRACT', 'MANUAL_LOAD_SUCCESS', `Contract manually loaded at ${contractAddress}`, newContract);
      toast({
        title: "Smart Contract loaded",
        description: `Address: ${contractAddress}`,
      });
    } catch (error) {
      addLog('ERROR', 'MANUAL_LOAD_FAILED', `Failed to manually load contract: ${error}`, { contractAddress, abiInput, error });
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
      
      addLog('CONTRACT', 'METHOD_SELECTED', `Selected method: ${methodName}`, {
        method,
        inputs: method.inputs || [],
        stateMutability: method.stateMutability
      });
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

      addLog('CONTRACT', 'READ_CALL_START', `Executing READ method: ${method.name}`, {
        method: method.name,
        params,
        callData,
        contract: contract.address
      });

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
        addLog('CONTRACT', 'READ_CALL_SUCCESS', `READ method ${method.name} returned null`, {
          method: method.name,
          params,
          result: null
        });
        return null;
      }

      // Use ethers to decode the result
      const decodedResult = iface.decodeFunctionResult(method.name, result);
      
      // Return the decoded result (can be array for tuple types)
      const finalResult = decodedResult.length === 1 ? decodedResult[0] : decodedResult;
      
      addLog('CONTRACT', 'READ_CALL_SUCCESS', `READ method ${method.name} executed successfully`, {
        method: method.name,
        params,
        rawResult: result,
        decodedResult: finalResult
      });

      return finalResult;

    } catch (error) {
      addLog('ERROR', 'READ_CALL_FAILED', `READ method ${method.name} failed: ${error}`, {
        method: method.name,
        params,
        error
      });
      throw error;
    }
  };

  const simulateBlockchainCall = async (method: any, params: any[]): Promise<any> => {
    addLog('CONTRACT', 'SIMULATE_CALL_START', `Simulating method: ${method.name}`, {
      method: method.name,
      params
    });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Simulate real blockchain responses based on method type
    let result;
    switch (method.name) {
      case 'name':
        result = 'MyToken';
        break;
      
      case 'symbol':
        result = 'MTK';
        break;
      
      case 'totalSupply':
        result = '1000000000000000000000000'; // 1M tokens with 18 decimals
        break;
      
      case 'balanceOf':
        const address = params[0];
        if (!address || !address.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error('Invalid address format');
        }
        // Simulate different balances for different addresses
        const lastDigit = parseInt(address.slice(-1), 16);
        result = (BigInt(lastDigit) * BigInt('1000000000000000000')).toString(); // lastDigit ETH
        break;
      
      case 'allowance':
        const owner = params[0];
        const spender = params[1];
        if (!owner?.match(/^0x[a-fA-F0-9]{40}$/) || !spender?.match(/^0x[a-fA-F0-9]{40}$/)) {
          throw new Error('Invalid address format');
        }
        result = '500000000000000000000'; // 500 tokens allowed
        break;
      
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
        result = '0x' + Math.random().toString(16).substr(2, 64);
        break;
      
      default:
        // For unknown methods, return realistic mock data based on method type
        const isWriteMethod = method.stateMutability === 'nonpayable' || method.stateMutability === 'payable';
        
        if (isWriteMethod) {
          // Return transaction hash for write operations
          result = '0x' + Math.random().toString(16).substr(2, 64);
        } else {
          // For read methods, return data based on expected output type
          const outputType = method.outputs?.[0]?.type;
          
          switch (outputType) {
            case 'uint256':
            case 'uint':
              result = Math.floor(Math.random() * 1000000).toString();
              break;
            
            case 'string':
              result = `Sample string result for ${method.name}`;
              break;
            
            case 'bool':
              result = Math.random() > 0.5;
              break;
            
            case 'address':
              result = '0x' + Math.random().toString(16).substr(2, 40);
              break;
            
            case 'bytes32':
              result = '0x' + Math.random().toString(16).substr(2, 64);
              break;
            
            default:
              result = Math.floor(Math.random() * 1000).toString();
              break;
          }
        }
        break;
    }
    
    addLog('CONTRACT', 'SIMULATE_CALL_SUCCESS', `Simulation completed for ${method.name}`, {
      method: method.name,
      params,
      result
    });
    
    return result;
  };

  const formatMethodResult = (method: any, result: any): string => {
    const isWriteMethod = method.stateMutability === 'nonpayable' || method.stateMutability === 'payable';
    
    if (isWriteMethod) {
      return `Transaction Hash: ${result}`;
    }
    
    // Use new parsing function for read methods
    return parseMethodResult(method, result);
  };

  // Enhanced blockchain call function for WRITE methods with real transaction execution
  const executeWriteMethodOnBlockchain = async (method: any, params: any[]): Promise<any> => {
    if (!connection.isConnected) {
      throw new Error('Not connected to RPC');
    }

    if (!walletInfo.isConnected || !walletInfo.address) {
      throw new Error('Wallet not connected');
    }

    try {
      const iface = new ethers.Interface([method]);
      const callData = iface.encodeFunctionData(method.name, params);

      addLog('CONTRACT', 'WRITE_CALL_START', `Executing WRITE method: ${method.name}`, {
        method: method.name,
        params,
        callData,
        contract: contract.address,
        wallet: walletInfo.address,
        ethValue,
        gasLimit,
        gasPrice
      });

      // Prepare transaction object with proper formatting for MetaMask
      const txRequest: any = {
        to: contract.address,
        data: callData,
        from: walletInfo.address
      };

      // Add ETH value if specified
      if (ethValue !== '0') {
        const valueInWei = ethers.parseEther(ethValue);
        txRequest.value = `0x${valueInWei.toString(16)}`;
      }

      // Add gas limit if specified
      if (gasLimit && gasLimit !== '0') {
        txRequest.gas = `0x${parseInt(gasLimit).toString(16)}`;
      }

      // Add gas price if specified (convert from Gwei to wei)
      if (gasPrice && gasPrice !== '0') {
        const gasPriceWei = ethers.parseUnits(gasPrice, 'gwei');
        txRequest.gasPrice = `0x${gasPriceWei.toString(16)}`;
      }

      if (walletInfo.connectionType === 'web3-wallet') {
        // Use Web3 wallet (MetaMask, etc.)
        if (!window.ethereum) {
          throw new Error('Web3 wallet not available');
        }

        // Send transaction via MetaMask
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [txRequest]
        });

        addLog('CONTRACT', 'WRITE_CALL_SUCCESS', `WRITE method ${method.name} transaction sent`, {
          method: method.name,
          params,
          txHash,
          txRequest
        });

        return txHash;

      } else if (walletInfo.connectionType === 'private-key') {
        // Use private key to sign and send transaction
        throw new Error('Private key transaction signing not implemented in this demo. Please use Web3 wallet for write operations.');
      }

      throw new Error('No valid wallet connection method available');

    } catch (error) {
      addLog('ERROR', 'WRITE_CALL_FAILED', `WRITE method ${method.name} failed: ${error}`, {
        method: method.name,
        params,
        error
      });
      throw error;
    }
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
        description: "Please connect wallet for WRITE method",
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

      // Create the proper method signature for encoding
      const methodSignature = {
        name: selectedMethod.name,
        type: 'function',
        inputs: selectedMethod.inputs || [],
        outputs: selectedMethod.outputs || [],
        stateMutability: selectedMethod.stateMutability
      };

      let result;
      if (isReadMethod) {
        // Use real RPC call for READ methods
        result = await executeRealBlockchainCall(methodSignature, params);
      } else {
        // Execute actual write transaction on blockchain
        result = await executeWriteMethodOnBlockchain(methodSignature, params);
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
        isRealCall: true // Both read and write are now real calls
      });

      addLog('CONTRACT', isReadMethod ? 'METHOD_EXECUTION_SUCCESS' : 'TRANSACTION_SUCCESS', 
        `${selectedMethod.name} ${isReadMethod ? 'read' : 'write'} completed successfully`, {
        method: selectedMethod.name,
        params,
        result: formattedResult,
        rawResult: result,
        type: isReadMethod ? 'read' : 'write'
      });

      toast({
        title: isReadMethod ? "Read successful" : "Transaction sent",
        description: `${selectedMethod.name}: ${isReadMethod ? 'Success' : 'Transaction submitted to blockchain'}`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setMethodResult({
        method: selectedMethod.name,
        result: `Error: ${errorMessage}`,
        rawResult: null,
        type: isReadMethod ? 'read' : 'write',
        error: true,
        timestamp: new Date().toISOString()
      });

      addLog('ERROR', 'METHOD_EXECUTION_FAILED', `${selectedMethod.name} execution failed: ${errorMessage}`, {
        method: selectedMethod.name,
        error: errorMessage
      });

      toast({
        title: isReadMethod ? "Error reading data" : "Transaction failed",
        description: errorMessage,
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

      addLog('CONTRACT', 'GAS_ESTIMATION_START', `Estimating gas for ${method.name}`, {
        method: method.name,
        params,
        callData
      });

      // Prepare transaction for gas estimation with proper typing
      const txParams: any = {
        to: contract.address,
        data: callData,
        from: walletInfo.address || undefined
      };

      // Add value if ETH is being sent
      if (ethValue !== '0') {
        txParams.value = `0x${BigInt(ethers.parseEther(ethValue)).toString(16)}`;
      }

      // Estimate gas limit
      const gasLimitResponse = await fetch(connection.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_estimateGas',
          params: [txParams],
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

      const result = {
        gasLimit: gasLimitWithBuffer.toString(),
        gasPrice: gasPriceInGwei.toString()
      };

      addLog('CONTRACT', 'GAS_ESTIMATION_SUCCESS', `Gas estimated for ${method.name}`, {
        method: method.name,
        params,
        estimatedGasLimit,
        gasLimitWithBuffer,
        currentGasPrice,
        gasPriceInGwei,
        result
      });

      return result;

    } catch (error) {
      addLog('ERROR', 'GAS_ESTIMATION_FAILED', `Gas estimation failed for ${method.name}: ${error}`, {
        method: method.name,
        params,
        error
      });
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

    if (!walletInfo.isConnected || !walletInfo.address) {
      toast({
        title: "Error",
        description: "Please connect wallet for gas estimation",
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

      // Create the proper method signature for gas estimation
      const methodSignature = {
        name: selectedMethod.name,
        type: 'function',
        inputs: selectedMethod.inputs || [],
        outputs: selectedMethod.outputs || [],
        stateMutability: selectedMethod.stateMutability
      };

      const gasEstimate = await estimateGasForMethod(methodSignature, params);
      
      setGasLimit(gasEstimate.gasLimit);
      setGasPrice(gasEstimate.gasPrice);

      toast({
        title: "Gas estimated",
        description: `Gas Limit: ${gasEstimate.gasLimit}, Gas Price: ${gasEstimate.gasPrice} Gwei`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error estimating gas",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsEstimatingGas(false);
    }
  };

  // Preset handling functions
  const handleLoadPreset = (preset: any) => {
    addLog('WALLET', 'PRESET_LOADED', `Loaded preset configuration`, preset);
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
                  EVM Buddy
                </h1>
                <p className="text-sm text-gray-500">Your Smart Contract Interaction Companion</p>
              </div>
            </div>
            
            {/* Connection Status and Help Button */}
            <div className="flex items-center space-x-4">
              <HelpModal />
              
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
                    if (network) selectPresetNetwork(network);
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

            {/* Activity Logs */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ScrollText className="w-5 h-5 text-green-600" />
                    <span>Activity Logs</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearLogs}
                    disabled={logs.length === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={logs.map(log => 
                    `[${log.timestamp}] ${log.type}: ${log.action}\n${log.details}\n${log.rawData ? `Raw: ${JSON.stringify(log.rawData, null, 2)}\n` : ''}\n---\n`
                  ).join('')}
                  readOnly
                  placeholder="Activity logs will appear here..."
                  className="h-64 font-mono text-xs resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {logs.length} entries • Auto-scrolls to show latest activity
                </p>
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
                            isWriteMethod={true}
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
                                Execute
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

      {/* Footer with GitHub link */}
      <footer className="py-4 px-8 border-t mt-8 bg-white/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a 
            href="https://github.com/zack-the-worker/evm-buddy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Github className="w-5 h-5" />
            <span className="text-sm">GitHub Repository</span>
          </a>
          <div className="text-sm text-gray-500">
            EVM Buddy - Your Smart Contract Interaction Companion
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
