import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ethers } from "ethers";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Copy, CheckCircle2, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSearchParams } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area"
import HelpModal from "@/components/HelpModal";

const Index = () => {
  const [rpcUrl, setRpcUrl] = useState(
    localStorage.getItem("rpcUrl") || "https://rpc.ankr.com/eth"
  );
  const [privateKey, setPrivateKey] = useState<string | null>(
    localStorage.getItem("privateKey") || null
  );
  const [contractAddress, setContractAddress] = useState<string>("");
  const [contractAbi, setContractAbi] = useState<string>("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<{
    read: string[];
    write: string[];
  }>({ read: [], write: [] });
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [methodParams, setMethodParams] = useState<any[]>([]);
  const [methodResult, setMethodResult] = useState<any>(null);
  const [isWriteMethod, setIsWriteMethod] = useState<boolean>(false);
  const [ethValue, setEthValue] = useState<string>("0");
  const [gasLimit, setGasLimit] = useState<number>(300000);
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState<boolean>(false);
  const [isGasLimitAuto, setIsGasLimitAuto] = useState<boolean>(true);
  const [gasPrice, setGasPrice] = useState<number>(10);
  const [isGasPriceAuto, setIsGasPriceAuto] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<
    {
      timestamp: string;
      message: string;
      type: "info" | "error" | "success";
      rawData?: any;
    }[]
  >([]);

  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const log = (
    message: string,
    type: "info" | "error" | "success",
    rawData?: any
  ) => {
    const newLog = {
      timestamp: new Date().toLocaleString(),
      message,
      type,
      rawData,
    };
    setLogs((prevLogs) => [...prevLogs, newLog]);
  };

  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!rpcUrl) {
        throw new Error("RPC URL is required");
      }
      if (!privateKey) {
        throw new Error("Private Key is required");
      }

      localStorage.setItem("rpcUrl", rpcUrl);
      localStorage.setItem("privateKey", privateKey);

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);

      const address = await wallet.getAddress();
      const balance = ethers.formatEther(await provider.getBalance(address));

      setWalletAddress(address);
      setWalletBalance(balance);
      setIsWalletConnected(true);
      log("Wallet connected successfully", "success");
      toast({
        title: "Success",
        description: "Wallet connected successfully",
      });
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      log(`Failed to connect wallet: ${error.message}`, "error");
      toast({
        title: "Error",
        description: `Failed to connect wallet: ${error.message}`,
        variant: "destructive",
      });
      setWalletAddress(null);
      setWalletBalance(null);
      setIsWalletConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [privateKey, rpcUrl, toast]);

  const loadContract = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!rpcUrl) {
        throw new Error("RPC URL is required");
      }
      if (!contractAddress) {
        throw new Error("Contract Address is required");
      }
      if (!contractAbi) {
        throw new Error("Contract ABI is required");
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const signer = privateKey
        ? new ethers.Wallet(privateKey, provider)
        : provider;

      const contract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      setContract(contract);

      const readMethods: string[] = [];
      const writeMethods: string[] = [];

      contract.interface.fragments.forEach((fragment: any) => {
        if (fragment.type === "function") {
          if (fragment.stateMutability === "view" || fragment.stateMutability === "pure") {
            readMethods.push(fragment.name);
          } else {
            writeMethods.push(fragment.name);
          }
        }
      });

      setAvailableMethods({ read: readMethods, write: writeMethods });
      log("Contract loaded successfully", "success");
      toast({
        title: "Success",
        description: "Contract loaded successfully",
      });
    } catch (error: any) {
      console.error("Failed to load contract:", error);
      log(`Failed to load contract: ${error.message}`, "error");
      toast({
        title: "Error",
        description: `Failed to load contract: ${error.message}`,
        variant: "destructive",
      });
      setAvailableMethods({ read: [], write: [] });
      setContract(null);
    } finally {
      setIsLoading(false);
    }
  }, [contractAddress, contractAbi, privateKey, rpcUrl, toast]);

  useEffect(() => {
    const rpc = searchParams.get("rpc");
    const pk = searchParams.get("pk");
    const address = searchParams.get("address");
    const abi = searchParams.get("abi");

    if (rpc) {
      setRpcUrl(rpc);
    }
    if (pk) {
      setPrivateKey(pk);
    }
    if (address) {
      setContractAddress(address);
    }
    if (abi) {
      setContractAbi(abi);
    }
  }, [searchParams]);

  useEffect(() => {
    if (privateKey && rpcUrl) {
      connectWallet();
    }
  }, [connectWallet, privateKey, rpcUrl]);

  useEffect(() => {
    if (contractAddress && contractAbi) {
      loadContract();
    }
  }, [contractAddress, contractAbi, loadContract]);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    const fragment = contract?.interface.getFunction(method);
    const params = fragment?.inputs.map((input) => ({
      name: input.name,
      type: input.type,
      value: "",
    }));
    setMethodParams(params || []);
    setIsWriteMethod(availableMethods.write.includes(method));
    setMethodResult(null);
  };

  const handleParamChange = (index: number, value: any) => {
    setMethodParams((prevParams) => {
      const newParams = [...prevParams];
      newParams[index].value = value;
      return newParams;
    });
  };

  const callMethod = async () => {
    setIsLoading(true);
    try {
      if (!contract) {
        throw new Error("Contract not loaded");
      }
      if (!selectedMethod) {
        throw new Error("Method not selected");
      }

      const params = methodParams.map((param) => {
        if (param.type.startsWith("uint") || param.type.startsWith("int")) {
          return parseInt(param.value);
        } else if (param.type === "bool") {
          return param.value.toLowerCase() === "true";
        } else {
          return param.value;
        }
      });

      if (isWriteMethod) {
        const ethValueWei = ethers.parseEther(ethValue);
        const gasEstimate = isGasLimitAuto
          ? await contract[selectedMethod].estimateGas(...params, {
            value: ethValueWei,
          })
          : gasLimit;

        const gasPriceToUse = isGasPriceAuto
          ? undefined
          : ethers.parseUnits(gasPrice.toString(), "gwei");

        const tx = await contract[selectedMethod](...params, {
          value: ethValueWei,
          gasLimit: gasEstimate,
          gasPrice: gasPriceToUse,
        });

        log(`Transaction sent: ${tx.hash}`, "info", tx);
        toast({
          title: "Info",
          description: `Transaction sent: ${tx.hash}`,
        });

        await tx.wait();
        const receipt = await tx.wait();

        log(`Transaction confirmed: ${tx.hash}`, "success", receipt);
        toast({
          title: "Success",
          description: `Transaction confirmed: ${tx.hash}`,
        });

        setMethodResult(receipt);
      } else {
        const result = await contract[selectedMethod](...params);
        log(`Method called: ${selectedMethod}`, "success", result);
        toast({
          title: "Success",
          description: `Method ${selectedMethod} called successfully`,
        });
        setMethodResult(result);
      }
    } catch (error: any) {
      console.error("Method call failed:", error);
      log(`Method call failed: ${error.message}`, "error", error);
      toast({
        title: "Error",
        description: `Method call failed: ${error.message}`,
        variant: "destructive",
      });
      setMethodResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EVM Buddy
            </h1>
            <HelpModal />
          </div>
          <p className="text-lg text-muted-foreground">
            Your Smart Contract Interaction Companion
          </p>
        </div>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Network & Wallet Configuration</CardTitle>
            <CardDescription>
              Configure your network and connect your wallet.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rpc-url">RPC URL</Label>
                <Input
                  type="text"
                  id="rpc-url"
                  value={rpcUrl}
                  onChange={(e) => setRpcUrl(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="private-key">Private Key</Label>
                <div className="relative">
                  <Input
                    type={isPrivateKeyVisible ? "text" : "password"}
                    id="private-key"
                    value={privateKey || ""}
                    onChange={(e) => setPrivateKey(e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setIsPrivateKeyVisible(!isPrivateKeyVisible)}
                  >
                    {isPrivateKeyVisible ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-14.5-14.5zM9.013 3.077a4.5 4.5 0 016.225 6.225l-4.95 4.95a.75.75 0 01-1.06-1.06l4.95-4.95a4.5 4.5 0 01-6.225-6.224zM3.75 10a4.5 4.5 0 016.225-6.225l1.743 1.744a.75.75 0 01-1.06 1.06l-1.744-1.743A4.5 4.5 0 013.75 10zm12.475 6.923a4.5 4.5 0 00-6.225-6.225l4.95-4.95a.75.75 0 011.06 1.06l-4.95 4.95a4.5 4.5 0 006.225 6.224zM16.25 10a4.5 4.5 0 00-6.225 6.225l-1.743-1.744a.75.75 0 011.06-1.06l1.744 1.743A4.5 4.5 0 0016.25 10z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.225 1.225 0 011.082-1.124c.293-.08.59-.16.892-.24a1.225 1.225 0 011.082 1.124C4.021 13.257 4.98 14.195 6.126 15.095a12.429 12.429 0 006.724 0c1.146-.9 2.104-1.838 3.094-2.761a1.225 1.225 0 011.082-1.124c.293-.08.59-.16.892-.24a1.225 1.225 0 011.082 1.124C19.979 13.257 19.02 14.195 17.874 15.095a12.429 12.429 0 00-6.724 0c-1.146-.9-2.104-1.838-3.094-2.761z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={connectWallet} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
              {walletAddress && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="secondary">
                        {walletAddress.substring(0, 6) +
                          "..." +
                          walletAddress.substring(38)}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{walletAddress}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {walletBalance && (
                <Badge variant="outline">
                  Balance: {Number(walletBalance).toFixed(4)} ETH
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Contract Configuration</CardTitle>
            <CardDescription>
              Load your smart contract by providing the address and ABI.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contract-address">Contract Address</Label>
                <Input
                  type="text"
                  id="contract-address"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contract-abi">Contract ABI</Label>
                <Textarea
                  className="min-h-[100px]"
                  id="contract-abi"
                  value={contractAbi}
                  onChange={(e) => setContractAbi(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={loadContract} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Contract...
                </>
              ) : (
                "Load Smart Contract"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Method Execution</CardTitle>
            <CardDescription>
              Select a method and enter parameters to execute it.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="method-select">Select Method</Label>
                <Select onValueChange={handleMethodSelect}>
                  <SelectTrigger id="method-select">
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMethods.read.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method} (Read)
                      </SelectItem>
                    ))}
                    {availableMethods.write.map((method) => (
                      <SelectItem key={method} value={method}>
                        {method} (Write)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedMethod && (
                <div>
                  <Label>Parameters</Label>
                  {methodParams.map((param, index) => (
                    <div key={index} className="mb-2">
                      <Label htmlFor={`param-${index}`}>
                        {param.name} ({param.type})
                      </Label>
                      <Input
                        type="text"
                        id={`param-${index}`}
                        placeholder={`Enter ${param.type}`}
                        value={param.value}
                        onChange={(e) => handleParamChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isWriteMethod && selectedMethod && (
              <>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eth-value">ETH Value (if payable)</Label>
                    <Input
                      type="number"
                      id="eth-value"
                      value={ethValue}
                      onChange={(e) => setEthValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>
                      Gas Limit{" "}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button variant={"link"} size={"icon"}>
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              If you set gas limit to auto, the gas limit will be
                              estimated automatically.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="gas-limit-auto"
                        checked={isGasLimitAuto}
                        onCheckedChange={setIsGasLimitAuto}
                      />
                      <Label htmlFor="gas-limit-auto" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                        Auto
                      </Label>
                    </div>
                    {!isGasLimitAuto && (
                      <Input
                        type="number"
                        id="gas-limit"
                        value={gasLimit}
                        onChange={(e) => setGasLimit(Number(e.target.value))}
                      />
                    )}
                  </div>
                  <div>
                    <Label>
                      Gas Price{" "}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Button variant={"link"} size={"icon"}>
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              If you set gas price to auto, the gas price will be
                              estimated automatically.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="gas-price-auto"
                        checked={isGasPriceAuto}
                        onCheckedChange={setIsGasPriceAuto}
                      />
                      <Label htmlFor="gas-price-auto" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
                        Auto
                      </Label>
                    </div>
                    {!isGasPriceAuto && (
                      <>
                        <Slider
                          defaultValue={[gasPrice]}
                          max={100}
                          step={0.1}
                          onValueChange={(value) => setGasPrice(value[0])}
                        />
                        <Input
                          type="number"
                          id="gas-price"
                          value={gasPrice}
                          onChange={(e) => setGasPrice(Number(e.target.value))}
                          disabled
                        />
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {selectedMethod && (
              <Button onClick={callMethod} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calling Method...
                  </>
                ) : (
                  "Call Method"
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {methodResult && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Method Result</CardTitle>
              <CardDescription>
                Result of the method call.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(methodResult, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Activity Logs</CardTitle>
            <Button variant="destructive" size="sm" onClick={clearLogs}>
              Clear Logs
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full">
              <Table>
                <TableCaption>
                  A list of all activities performed.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Timestamp</TableHead>
                    <TableHead>Activity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{log.timestamp}</TableCell>
                      <TableCell>
                        {log.type === "error" && (
                          <Badge variant="destructive">{log.message}</Badge>
                        )}
                        {log.type === "info" && (
                          <Badge variant="secondary">{log.message}</Badge>
                        )}
                        {log.type === "success" && (
                          <Badge>{log.message}</Badge>
                        )}
                        {log.rawData && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button variant="link" size="icon">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-4 w-4"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.5 5.25a.75.75 0 00-1.5 0v2.25H8.25a.75.75 0 000 1.5h2.25v2.25a.75.75 0 001.5 0v-2.25h2.25a.75.75 0 000-1.5h-2.25V7.5a.75.75 0 00-1.5 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <pre className="whitespace-pre-wrap break-words">
                                  {JSON.stringify(log.rawData, null, 2)}
                                </pre>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
