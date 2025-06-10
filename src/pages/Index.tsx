import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import WalletConnection from "@/components/WalletConnection";
import RPCConnection from "@/components/RPCConnection";
import SmartContractInteraction from "@/components/SmartContractInteraction";
import TransactionHistory from "@/components/TransactionHistory";
import TokenManager from "@/components/TokenManager";
import PresetManager from "@/components/PresetManager";
import { 
  Code, 
  Play, 
  Calculator, 
  History, 
  Settings, 
  FileText,
  Wallet,
  Zap,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { ethers } from 'ethers';

interface WalletInfo {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
}

interface MethodInput {
  name: string;
  type: string;
  value: string;
}

const Index = () => {
  const [rpcUrl, setRpcUrl] = useState<string>(localStorage.getItem('rpcUrl') || '');
  const [isRPCConnected, setIsRPCConnected] = useState<boolean>(false);
  const [contractAddress, setContractAddress] = useState<string>(localStorage.getItem('contractAddress') || '');
  const [abi, setAbi] = useState<string>(localStorage.getItem('abi') || '');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: null,
    chainId: null,
    isConnected: false,
  });
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [methodInputs, setMethodInputs] = useState<string[]>([]);
  const [methodResult, setMethodResult] = useState<string>('');
  const [gasEstimate, setGasEstimate] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [logs, setLogs] = useState<string>('');

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    const logEntry = `[${timestamp}] ${message}\n`;
    setLogs(prev => prev + logEntry);
  }, []);

  useEffect(() => {
    localStorage.setItem('rpcUrl', rpcUrl);
  }, [rpcUrl]);

  useEffect(() => {
    localStorage.setItem('contractAddress', contractAddress);
  }, [contractAddress]);

  useEffect(() => {
    localStorage.setItem('abi', abi);
  }, [abi]);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        addLog('Connecting to wallet...');
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        
        setWalletInfo({
          address: accounts[0],
          chainId: parseInt(chainId, 16),
          isConnected: true
        });
        
        addLog(`Wallet connected: ${accounts[0]}`);
        addLog(`Chain ID: ${parseInt(chainId, 16)}`);
        
        toast.success('Wallet connected successfully!');
      } catch (error) {
        console.error('Error connecting wallet:', error);
        addLog(`Error connecting wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        toast.error('Failed to connect wallet');
      }
    } else {
      addLog('MetaMask is not installed');
      toast.error('MetaMask is not installed');
    }
  }, [addLog]);

  const connectRPC = useCallback(async () => {
    if (!rpcUrl.trim()) {
      addLog('RPC URL is required');
      toast.error('RPC URL is required');
      return;
    }

    try {
      addLog(`Connecting to RPC: ${rpcUrl}`);
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      await provider.getNetwork();
      setProvider(provider);
      setIsRPCConnected(true);
      addLog('RPC connection successful');
      toast.success('RPC connected successfully!');
    } catch (error) {
      console.error('Error connecting to RPC:', error);
      addLog(`RPC connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to connect to RPC');
    }
  }, [rpcUrl, addLog]);

  const loadContractABI = useCallback(async () => {
    if (!contractAddress || !abi.trim()) {
      addLog('Contract address and ABI are required');
      toast.error('Contract address and ABI are required');
      return;
    }

    try {
      addLog(`Loading contract: ${contractAddress}`);
      const parsedABI = JSON.parse(abi);
      
      let contractInstance;
      if (provider) {
        contractInstance = new ethers.Contract(contractAddress, parsedABI, provider);
      } else if (typeof window.ethereum !== 'undefined') {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        contractInstance = new ethers.Contract(contractAddress, parsedABI, browserProvider);
      } else {
        throw new Error('No provider available');
      }

      setContract(contractInstance);
      addLog('Contract loaded successfully');
      toast.success('Contract loaded successfully!');
    } catch (error) {
      console.error('Error loading contract:', error);
      addLog(`Contract loading error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error(error instanceof Error ? error.message : 'Failed to load contract');
    }
  }, [contractAddress, abi, provider, addLog]);

  const estimateGasForMethod = async (methodName: string, args: any[]) => {
    if (!contract || !walletInfo.isConnected) {
      throw new Error('Contract not loaded or wallet not connected');
    }

    try {
      addLog(`Estimating gas for ${methodName}: ${JSON.stringify(args)}`);
      console.log(`Estimating gas for ${methodName}:`, args);
      
      const iface = new ethers.Interface(contract.interface.format());
      const callData = iface.encodeFunctionData(methodName, args);
      
      console.log(`Method selector: ${callData.slice(0, 10)}`);
      console.log(`Full call data: ${callData}`);
      
      const txParams: any = {
        to: contract.target,
        data: callData,
        from: walletInfo.address || undefined
      };

      if (args.some(arg => typeof arg === 'object' && arg !== null && 'value' in arg)) {
        const valueArg = args.find(arg => typeof arg === 'object' && arg !== null && 'value' in arg);
        if (valueArg && valueArg.value) {
          txParams.value = ethers.parseEther(valueArg.value.toString()).toString();
        }
      }

      const gasEstimate = await window.ethereum.request({
        method: 'eth_estimateGas',
        params: [txParams]
      });

      const gasLimit = parseInt(gasEstimate, 16);
      addLog(`Gas estimation successful: ${gasLimit}`);
      console.log('Gas estimate:', gasLimit);
      return gasLimit;
    } catch (error) {
      console.error('Error estimating gas:', error);
      addLog(`Gas estimation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Gas estimation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const executeWriteMethod = async (methodName: string, args: any[]) => {
    if (!contract || !walletInfo.isConnected) {
      throw new Error('Contract not loaded or wallet not connected');
    }

    try {
      addLog(`Executing write method: ${methodName} with args: ${JSON.stringify(args)}`);
      console.log(`Executing write method: ${methodName}`, args);
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const gasLimit = await estimateGasForMethod(methodName, args);
      
      const tx = await contractWithSigner[methodName](...args, {
        gasLimit: Math.floor(gasLimit * 1.2)
      });

      addLog(`Transaction sent: ${tx.hash}`);
      console.log('Transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      addLog(`Transaction confirmed in block: ${receipt.blockNumber}`);
      console.log('Transaction confirmed:', receipt);
      
      return receipt;
    } catch (error) {
      console.error('Error executing write method:', error);
      addLog(`Write method execution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleEstimateGas = async () => {
    if (!selectedMethod || !contract) {
      addLog('No method selected or contract not loaded');
      toast.error('Please select a method and load contract first');
      return;
    }

    try {
      const methodABI = contract.interface.getFunction(selectedMethod);
      const args = methodABI.inputs.map((input: any, index: number) => {
        const value = methodInputs[index] || '';
        
        if (input.type.includes('uint') || input.type.includes('int')) {
          return value ? BigInt(value) : BigInt(0);
        }
        if (input.type === 'bool') {
          return value.toLowerCase() === 'true';
        }
        if (input.type.includes('[]')) {
          return value ? JSON.parse(value) : [];
        }
        return value;
      });

      const gasEstimate = await estimateGasForMethod(selectedMethod, args);
      setGasEstimate(gasEstimate);
      addLog(`Gas estimated for ${selectedMethod}: ${gasEstimate}`);
      toast.success(`Gas estimated: ${gasEstimate.toLocaleString()}`);
    } catch (error) {
      console.error('Gas estimation error:', error);
      addLog(`Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error(`Gas estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExecuteMethod = async () => {
    if (!selectedMethod || !contract) {
      addLog('No method selected or contract not loaded');
      toast.error('Please select a method and load contract first');
      return;
    }

    try {
      const methodABI = contract.interface.getFunction(selectedMethod);
      const args = methodABI.inputs.map((input: any, index: number) => {
        const value = methodInputs[index] || '';
        
        if (input.type.includes('uint') || input.type.includes('int')) {
          return value ? BigInt(value) : BigInt(0);
        }
        if (input.type === 'bool') {
          return value.toLowerCase() === 'true';
        }
        if (input.type.includes('[]')) {
          return value ? JSON.parse(value) : [];
        }
        return value;
      });

      if (methodABI.stateMutability === 'view' || methodABI.stateMutability === 'pure') {
        addLog(`Calling read method: ${selectedMethod}`);
        const result = await contract[selectedMethod](...args);
        setMethodResult(result.toString());
        addLog(`Read method result: ${result.toString()}`);
        toast.success('Method executed successfully!');
      } else {
        addLog(`Executing write method: ${selectedMethod}`);
        const receipt = await executeWriteMethod(selectedMethod, args);
        setMethodResult(`Transaction confirmed in block ${receipt.blockNumber}`);
        addLog(`Write method completed successfully`);
        toast.success('Transaction confirmed!');
      }
    } catch (error) {
      console.error('Method execution error:', error);
      addLog(`Method execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error(`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addLog(`Copied ${label} to clipboard`);
      toast.success(`${label} copied to clipboard!`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      addLog(`Failed to copy ${label} to clipboard`);
      toast.error('Failed to copy to clipboard');
    }
  };

  const filterMethods = useCallback(() => {
    if (!contract) return [];
    return contract.interface.fragments
      .filter((fragment: any) => fragment.type === 'function' && fragment.name !== 'supportsInterface')
      .map((fragment: any) => fragment.name)
      .sort();
  }, [contract]);

  const methods = filterMethods();

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    const methodABI = contract?.interface.getFunction(method);
    setMethodInputs(Array(methodABI?.inputs.length).fill(''));
    setMethodResult('');
    setGasEstimate(null);
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...methodInputs];
    newInputs[index] = value;
    setMethodInputs(newInputs);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 p-4">
      {/* Toast container moved to top-right */}
      <div className="fixed top-4 right-4 z-50">
        {/* Toasts will appear here */}
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            EVM Buddy
          </h1>
          <p className="text-muted-foreground text-lg">
            Your Smart Contract Interaction Companion
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* RPC Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  RPC Connection
                </CardTitle>
                <CardDescription>
                  Connect to your blockchain RPC endpoint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rpc-url">RPC URL</Label>
                  <Input
                    id="rpc-url"
                    placeholder="https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
                    value={rpcUrl}
                    onChange={(e) => setRpcUrl(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={connectRPC} 
                  disabled={!rpcUrl.trim()}
                  className="w-full"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Connect RPC
                </Button>
                {isRPCConnected && (
                  <Alert>
                    <AlertDescription>
                      ✅ RPC connected successfully
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Smart Contract Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Smart Contract
                </CardTitle>
                <CardDescription>
                  Load and interact with your smart contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contract-address">Contract Address</Label>
                  <Input
                    id="contract-address"
                    placeholder="0x..."
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="abi">Contract ABI</Label>
                  <Textarea
                    id="abi"
                    placeholder="Paste your contract ABI here..."
                    value={abi}
                    onChange={(e) => setAbi(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                </div>

                <Button 
                  onClick={loadContractABI} 
                  disabled={!contractAddress || !abi.trim()}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Load Contract
                </Button>

                {contract && (
                  <Alert>
                    <AlertDescription>
                      ✅ Contract loaded successfully
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Method Interaction */}
            {contract && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Method Interaction
                  </CardTitle>
                  <CardDescription>
                    Execute contract methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="method-select">Select Method</Label>
                    <select
                      id="method-select"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      onChange={(e) => handleMethodSelect(e.target.value)}
                      value={selectedMethod || ''}
                    >
                      <option value="" disabled>Select a method</option>
                      {methods.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>

                  {selectedMethod && contract && (
                    <div className="space-y-4">
                      {contract.interface.getFunction(selectedMethod).inputs.map((input: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <Label htmlFor={`input-${index}`}>{input.name} ({input.type})</Label>
                          <Input
                            type="text"
                            id={`input-${index}`}
                            placeholder={`Enter ${input.type} value`}
                            value={methodInputs[index] || ''}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                          />
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="secondary"
                          onClick={handleEstimateGas}
                          className="w-1/2"
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Estimate Gas
                        </Button>
                        <Button 
                          type="button" 
                          onClick={handleExecuteMethod}
                          className="w-1/2"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Execute Method
                        </Button>
                      </div>

                      {gasEstimate !== null && (
                        <Alert>
                          <AlertDescription>
                            Estimated Gas: {gasEstimate.toLocaleString()}
                          </AlertDescription>
                        </Alert>
                      )}

                      {methodResult && (
                        <div className="space-y-2">
                          <Label>Method Result</Label>
                          <Textarea
                            value={methodResult}
                            readOnly
                            className="min-h-[100px] font-mono text-sm resize-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Wallet Connection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Connection
                </CardTitle>
                <CardDescription>
                  Connect your MetaMask wallet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={connectWallet}
                  className="w-full"
                  variant={walletInfo.isConnected ? "outline" : "default"}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {walletInfo.isConnected ? 'Wallet Connected' : 'Connect Wallet'}
                </Button>
                
                {walletInfo.isConnected && (
                  <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Address:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-background px-2 py-1 rounded">
                          {walletInfo.address?.slice(0, 6)}...{walletInfo.address?.slice(-4)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(walletInfo.address || '', 'Address')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Chain ID:</span>
                      <Badge variant="secondary">{walletInfo.chainId}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Activity Logs
                </CardTitle>
                <CardDescription>
                  Real-time interaction logs with smart contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Logs</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLogs('')}
                    >
                      Clear Logs
                    </Button>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <Textarea
                      value={logs}
                      readOnly
                      className="min-h-[380px] font-mono text-xs resize-none border-0 focus-visible:ring-0"
                      placeholder="Activity logs will appear here..."
                    />
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
