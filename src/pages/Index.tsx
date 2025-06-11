import React, { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Github } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import HelpModal from '@/components/HelpModal';
import MethodExecutionButton from '@/components/MethodExecutionButton';
import ThemeToggle from '@/components/ThemeToggle';

interface ContractInfo {
  address: string;
  abi: string;
}

interface ConnectionInfo {
  rpcUrl: string;
  isConnected: boolean;
  privateKey?: string;
}

const Index = () => {
  const [contractInfo, setContractInfo] = useState<ContractInfo>({ address: '', abi: '' });
  const [connection, setConnection] = useState<ConnectionInfo>({ rpcUrl: '', isConnected: false, privateKey: '' });
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [methodInputs, setMethodInputs] = useState<string[]>([]);
  const [ethValue, setEthValue] = useState('');
  const [result, setResult] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isEstimatingGas, setIsEstimatingGas] = useState<boolean>(false);
  const [isContinuousExecuting, setIsContinuousExecuting] = useState(false);
  const [continuousExecutionInterval, setContinuousExecutionInterval] = useState<NodeJS.Timeout | null>(null);

  const { data: contractAbi, isLoading: isContractLoading, isError: isContractError } = useQuery({
    queryKey: ['contractAbi', contractInfo.address],
    queryFn: async () => {
      if (!contractInfo.address) return null;
      try {
        const response = await fetch(`https://api.etherscan.io/api?module=contract&action=getabi&address=${contractInfo.address}&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}`);
        const data = await response.json();
        if (data.status === "1") {
          return JSON.parse(data.result);
        } else {
          throw new Error(data.result);
        }
      } catch (error: any) {
        console.error("Failed to fetch contract ABI:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: `Failed to fetch contract ABI: ${error.message}`,
        })
        return null;
      }
    },
    enabled: !!contractInfo.address,
    retry: false,
  });

  const connectToRpc = useCallback(async () => {
    if (!connection.rpcUrl) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Please enter an RPC URL.",
      })
      return;
    }

    try {
      const provider = new ethers.JsonRpcProvider(connection.rpcUrl);
      await provider.getBlockNumber();
      setConnection(prev => ({ ...prev, isConnected: true }));
      toast({
        title: "Connected!",
        description: "Successfully connected to the RPC URL.",
      })
    } catch (error: any) {
      console.error("Failed to connect to RPC:", error);
      setConnection(prev => ({ ...prev, isConnected: false }));
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Failed to connect to RPC: ${error.message}`,
      })
    }
  }, [connection.rpcUrl]);

  const handleContractAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContractInfo(prev => ({ ...prev, address: e.target.value }));
  };

  const handleContractAbiChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const abi = JSON.parse(e.target.value);
      setContractInfo(prev => ({ ...prev, abi: JSON.stringify(abi) }));
      toast({
        title: "Success",
        description: "Successfully parsed the ABI.",
      })
    } catch (error: any) {
      console.error("Failed to parse ABI:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Failed to parse ABI: ${error.message}`,
      })
    }
  };

  const handleRpcUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConnection(prev => ({ ...prev, rpcUrl: e.target.value, isConnected: false }));
  };

  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConnection(prev => ({ ...prev, privateKey: e.target.value }));
  };

  const handleMethodInputChange = (index: number, value: string) => {
    setMethodInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = value;
      return newInputs;
    });
  };

  const handleEthValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEthValue(e.target.value);
  };

  const parseMethodInput = (value: string, type: string) => {
    if (type.startsWith('uint') || type.startsWith('int')) {
      return ethers.BigInt(value);
    } else if (type === 'bool') {
      return value.toLowerCase() === 'true';
    } else {
      return value;
    }
  };

  const estimateGas = async () => {
    if (!selectedMethod) return;

    setIsEstimatingGas(true);
    try {
      const provider = new ethers.JsonRpcProvider(connection.rpcUrl);
      const wallet = connection.privateKey ? new ethers.Wallet(connection.privateKey, provider) : ethers.Wallet.createRandom();
      const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, wallet);

      const methodArgs = selectedMethod.inputs?.map((input, index) => {
        const value = methodInputs[index] || '';
        return parseMethodInput(value, input.type);
      }) || [];

      const gasEstimate = await contract[selectedMethod.name!].estimateGas(...methodArgs, {
        value: ethValue ? ethers.parseEther(ethValue) : 0
      });

      toast({
        title: "Gas Estimate",
        description: `Estimated gas: ${gasEstimate.toString()}`,
      })
    } catch (error: any) {
      console.error("Failed to estimate gas:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Failed to estimate gas: ${error.message}`,
      })
    } finally {
      setIsEstimatingGas(false);
    }
  };

  const callReadMethod = async () => {
    if (!selectedMethod) return;

    setIsExecuting(true);
    try {
      const provider = new ethers.JsonRpcProvider(connection.rpcUrl);
      const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, provider);

      const methodArgs = selectedMethod.inputs?.map((input, index) => {
        const value = methodInputs[index] || '';
        return parseMethodInput(value, input.type);
      }) || [];

      const result = await contract[selectedMethod.name!](...methodArgs);

      setResult(JSON.stringify(result));
      toast({
        title: "Success",
        description: "Method executed successfully.",
      })
    } catch (error: any) {
      console.error("Failed to execute method:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Failed to execute method: ${error.message}`,
      })
    } finally {
      setIsExecuting(false);
    }
  };

  const executeMethod = async () => {
    if (!selectedMethod) return;

    setIsExecuting(true);
    try {
      const provider = new ethers.JsonRpcProvider(connection.rpcUrl);
      const wallet = new ethers.Wallet(connection.privateKey!, provider);
      const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, wallet);

      const methodArgs = selectedMethod.inputs?.map((input, index) => {
        const value = methodInputs[index] || '';
        return parseMethodInput(value, input.type);
      }) || [];

      const tx = await contract[selectedMethod.name!](...methodArgs, {
        value: ethValue ? ethers.parseEther(ethValue) : 0
      });

      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${tx.hash}`,
      })

      await tx.wait();

      toast({
        title: "Transaction Confirmed",
        description: `Transaction confirmed!`,
      })
    } catch (error: any) {
      console.error("Failed to execute method:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `Failed to execute method: ${error.message}`,
      })
    } finally {
      setIsExecuting(false);
    }
  };

  const startContinuousExecution = async () => {
    if (!selectedMethod || !connection.privateKey) return;
    
    setIsContinuousExecuting(true);
    
    const continuousCheck = async () => {
      try {
        // First try to estimate gas to see if the method can be executed
        const provider = new ethers.JsonRpcProvider(connection.rpcUrl);
        const wallet = new ethers.Wallet(connection.privateKey!, provider);
        const contract = new ethers.Contract(contractInfo.address, contractInfo.abi, wallet);

        // Prepare method arguments
        const methodArgs = selectedMethod.inputs?.map((input, index) => {
          const value = methodInputs[index] || '';
          return parseMethodInput(value, input.type);
        }) || [];

        // Try to estimate gas
        const gasEstimate = await contract[selectedMethod.name!].estimateGas(...methodArgs, {
          value: ethValue ? ethers.parseEther(ethValue) : 0
        });

        if (gasEstimate) {
          // If gas estimation succeeds, execute the transaction
          await executeMethod();
          
          // Stop continuous execution after successful execution
          setIsContinuousExecuting(false);
          if (continuousExecutionInterval) {
            clearInterval(continuousExecutionInterval);
            setContinuousExecutionInterval(null);
          }
          
          toast({
            title: "Success",
            description: "Transaction executed successfully during continuous monitoring",
          });
        }
      } catch (error) {
        // Continue checking if gas estimation fails
        console.log('Waiting for favorable conditions...');
      }
    };

    // Start the continuous checking
    const interval = setInterval(continuousCheck, 2000); // Check every 2 seconds
    setContinuousExecutionInterval(interval);
  };

  const stopContinuousExecution = () => {
    setIsContinuousExecuting(false);
    if (continuousExecutionInterval) {
      clearInterval(continuousExecutionInterval);
      setContinuousExecutionInterval(null);
    }
  };

  const handleMethodSelect = (methodName: string) => {
    const method = contractAbi?.find((item: any) => item.name === methodName);
    setSelectedMethod(method);
    setMethodInputs(Array(method?.inputs?.length).fill(''));
    setResult('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div></div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white">EVM Buddy</h1>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <HelpModal />
            </div>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Your Smart Contract Interaction Companion
          </p>
          <p className="text-md text-gray-500 dark:text-gray-400">
            Interact with smart contracts on EVM-compatible blockchains
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contract Information */}
          <Card className="bg-white dark:bg-gray-700 shadow-md rounded-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Contract Information</h2>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4">
                <Label htmlFor="contractAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract Address</Label>
                <Input
                  type="text"
                  id="contractAddress"
                  className="mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-white bg-white dark:bg-gray-800"
                  placeholder="0x..."
                  value={contractInfo.address}
                  onChange={handleContractAddressChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="contractAbi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract ABI</Label>
                <Textarea
                  id="contractAbi"
                  className="mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-white bg-white dark:bg-gray-800"
                  placeholder="[{\"inputs\":...}]"
                  value={contractInfo.abi}
                  onChange={handleContractAbiChange}
                />
              </div>
            </CardContent>
          </Card>

          {/* Connection Details */}
          <Card className="bg-white dark:bg-gray-700 shadow-md rounded-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Connection Details</h2>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4">
                <Label htmlFor="rpcUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">RPC URL</Label>
                <Input
                  type="text"
                  id="rpcUrl"
                  className="mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-white bg-white dark:bg-gray-800"
                  placeholder="https://eth-mainnet.alchemyapi.io/v2/..."
                  value={connection.rpcUrl}
                  onChange={handleRpcUrlChange}
                />
              </div>
              <div className="mb-4">
                <Label htmlFor="privateKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Private Key (Optional)</Label>
                <Input
                  type="password"
                  id="privateKey"
                  className="mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-white bg-white dark:bg-gray-800"
                  placeholder="0x..."
                  onChange={handlePrivateKeyChange}
                />
              </div>
              <Button onClick={connectToRpc} disabled={connection.isConnected} className="w-full">
                {connection.isConnected ? 'Connected' : 'Connect'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Method Interaction */}
        <Card className="mt-6 bg-white dark:bg-gray-700 shadow-md rounded-md">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Method Interaction</h2>
          </CardHeader>
          <CardContent className="p-4">
            <div className="mb-4">
              <Label htmlFor="methodSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Method</Label>
              <Select onValueChange={handleMethodSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a method" />
                </SelectTrigger>
                <SelectContent>
                  {contractAbi?.map((method: any, index: number) => (
                    <SelectItem key={index} value={method.name}>{method.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMethod?.inputs?.map((input: any, index: number) => (
              <div className="mb-4" key={index}>
                <Label htmlFor={`input-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{input.name} ({input.type})</Label>
                <Input
                  type="text"
                  id={`input-${index}`}
                  className="mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-white bg-white dark:bg-gray-800"
                  placeholder={`Enter ${input.name}`}
                  value={methodInputs[index] || ''}
                  onChange={(e) => handleMethodInputChange(index, e.target.value)}
                />
              </div>
            ))}

            {selectedMethod?.stateMutability !== 'view' && selectedMethod?.stateMutability !== 'pure' && (
              <div className="mb-4">
                <Label htmlFor="ethValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">ETH Value (Optional)</Label>
                <Input
                  type="number"
                  id="ethValue"
                  className="mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-white bg-white dark:bg-gray-800"
                  placeholder="0.0"
                  value={ethValue}
                  onChange={handleEthValueChange}
                />
              </div>
            )}

            {selectedMethod?.stateMutability === 'view' || selectedMethod?.stateMutability === 'pure' ? (
              <Button 
                onClick={callReadMethod}
                disabled={!selectedMethod || !connection.isConnected || isExecuting}
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
            ) : (
              <MethodExecutionButton
                onExecute={executeMethod}
                onEstimateGas={estimateGas}
                onContinuousExecute={isContinuousExecuting ? stopContinuousExecution : startContinuousExecution}
                isExecuting={isExecuting}
                isEstimatingGas={isEstimatingGas}
                isContinuousExecuting={isContinuousExecuting}
                disabled={!selectedMethod || !connection.isConnected}
                isWriteMethod={true}
                hasPrivateKey={!!connection.privateKey}
              />
            )}

            {result && (
              <div className="mt-6">
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Result</Label>
                <Textarea
                  className="mt-1 p-2 w-full border rounded-md text-gray-800 dark:text-white bg-white dark:bg-gray-800"
                  value={result}
                  readOnly
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Footer with GitHub link */}
      <footer className="py-4 px-8 border-t mt-8 bg-white/80 dark:bg-gray-800/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a 
            href="https://github.com/zack-the-worker/evm-buddy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Github className="w-5 h-5" />
            <span className="text-sm">GitHub Repository</span>
          </a>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            EVM Buddy - Your Smart Contract Interaction Companion
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
