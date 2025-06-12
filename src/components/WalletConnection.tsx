import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Eye, EyeOff, Key, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';

interface WalletInfo {
  address: string;
  balance: string;
  isConnected: boolean;
  connectionType: 'private-key' | 'web3-wallet' | null;
}

interface WalletConnectionProps {
  onWalletChange: (wallet: WalletInfo) => void;
  rpcUrl: string;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onWalletChange, rpcUrl }) => {
  const { toast } = useToast();
  const [privateKey, setPrivateKey] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: '',
    balance: '',
    isConnected: false,
    connectionType: null
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Web3 wallet connection state
  const [isWeb3Available, setIsWeb3Available] = useState(false);

  useEffect(() => {
    // Check if web3 is available
    setIsWeb3Available(typeof window !== 'undefined' && typeof window.ethereum !== 'undefined');
  }, []);

  const getBalance = async (address: string): Promise<string> => {
    if (!rpcUrl || !address) return '0';
    
    try {
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: Date.now()
        })
      });

      const data = await response.json();
      if (data.result) {
        const balanceWei = BigInt(data.result);
        const balanceEth = Number(balanceWei) / 1e18;
        return balanceEth.toFixed(6);
      }
      return '0';
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  };

  const connectWithPrivateKey = async () => {
    if (!privateKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a private key",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Validate private key format
      let formattedKey = privateKey.trim();
      if (!formattedKey.startsWith('0x')) {
        formattedKey = '0x' + formattedKey;
      }

      // Create wallet from private key
      const wallet = new ethers.Wallet(formattedKey);
      const address = wallet.address;

      setIsLoadingBalance(true);
      const balance = await getBalance(address);

      const newWalletInfo: WalletInfo = {
        address,
        balance,
        isConnected: true,
        connectionType: 'private-key'
      };

      setWalletInfo(newWalletInfo);
      onWalletChange(newWalletInfo);

      toast({
        title: "Wallet Connected",
        description: `Connected with address: ${address}`,
      });

    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Invalid private key format",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
      setIsLoadingBalance(false);
    }
  };

  const connectWeb3Wallet = async () => {
    if (!isWeb3Available) {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      
      setIsLoadingBalance(true);
      const balance = await getBalance(address);

      const newWalletInfo: WalletInfo = {
        address,
        balance,
        isConnected: true,
        connectionType: 'web3-wallet'
      };

      setWalletInfo(newWalletInfo);
      onWalletChange(newWalletInfo);

      toast({
        title: "Wallet Connected",
        description: `Connected with address: ${address}`,
      });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          // Update wallet info when account changes
          const newAddress = accounts[0];
          getBalance(newAddress).then(newBalance => {
            const updatedWalletInfo: WalletInfo = {
              address: newAddress,
              balance: newBalance,
              isConnected: true,
              connectionType: 'web3-wallet'
            };
            setWalletInfo(updatedWalletInfo);
            onWalletChange(updatedWalletInfo);
          });
        }
      });

    } catch (error) {
      console.error('Web3 connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Web3 wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
      setIsLoadingBalance(false);
    }
  };

  const disconnectWallet = () => {
    setWalletInfo({
      address: '',
      balance: '',
      isConnected: false,
      connectionType: null
    });
    setPrivateKey('');
    onWalletChange({
      address: '',
      balance: '',
      isConnected: false,
      connectionType: null
    });
    
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected",
    });
  };

  const refreshBalance = async () => {
    if (!walletInfo.address) return;
    
    setIsLoadingBalance(true);
    const balance = await getBalance(walletInfo.address);
    const updatedWalletInfo = { ...walletInfo, balance };
    setWalletInfo(updatedWalletInfo);
    onWalletChange(updatedWalletInfo);
    setIsLoadingBalance(false);
  };

  return (
    <Card className="shadow-lg border bg-card text-card-foreground backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-primary" />
          <span>Wallet Connection</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!walletInfo.isConnected ? (
          <Tabs defaultValue="private-key" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="private-key" className="flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>Private Key</span>
              </TabsTrigger>
              <TabsTrigger value="web3-wallet" className="flex items-center space-x-2">
                <Wallet className="w-4 h-4" />
                <span>Web3 Wallet</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="private-key" className="space-y-4">
              <div>
                <Label htmlFor="private-key">Private Key</Label>
                <div className="relative">
                  <Input
                    id="private-key"
                    type={showPrivateKey ? "text" : "password"}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your private key (0x...)"
                    className="font-mono text-sm pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                  >
                    {showPrivateKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your private key is used locally to sign transactions
                </p>
              </div>
              
              <Button 
                onClick={connectWithPrivateKey}
                disabled={!privateKey.trim() || isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Connect with Private Key
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="web3-wallet" className="space-y-4">
              <div className="text-center py-4">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Connect your Web3 wallet to interact with smart contracts
                </p>
                
                <Button 
                  onClick={connectWeb3Wallet}
                  disabled={!isWeb3Available || isConnecting}
                  className="w-full"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
                
                {!isWeb3Available && (
                  <p className="text-xs text-destructive mt-2">
                    No Web3 wallet detected. Please install MetaMask or another Web3 wallet.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="p-4 bg-secondary/50 border border-border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-600 dark:text-green-400">Wallet Connected</span>
              </div>
              <Badge variant="outline" className="text-green-700 dark:text-green-400 border-green-300 dark:border-green-600">
                {walletInfo.connectionType === 'private-key' ? 'Private Key' : 'Web3 Wallet'}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-green-600 dark:text-green-400">Address:</Label>
                <p className="font-mono text-sm text-green-800 dark:text-green-300 break-all">
                  {walletInfo.address}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs text-green-600 dark:text-green-400">Balance:</Label>
                  <p className="font-mono text-sm text-green-800 dark:text-green-300">
                    {isLoadingBalance ? (
                      <span className="flex items-center">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      `${walletInfo.balance} ETH`
                    )}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={refreshBalance}
                    disabled={isLoadingBalance}
                  >
                    {isLoadingBalance ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={disconnectWallet}
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnection;
