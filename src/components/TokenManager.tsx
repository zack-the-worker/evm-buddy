
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Coins, Send, Eye, Loader2, ArrowUpDown } from 'lucide-react';

interface ConnectionState {
  rpcUrl: string;
  chainId: number | null;
  isConnected: boolean;
  networkName: string;
}

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
}

interface TokenManagerProps {
  connection: ConnectionState;
  walletAddress: string;
  onTokenInfoUpdate: (info: TokenInfo) => void;
  onTransactionSent: (tx: any) => void;
}

const TokenManager: React.FC<TokenManagerProps> = ({
  connection,
  walletAddress,
  onTokenInfoUpdate,
  onTransactionSent
}) => {
  const { toast } = useToast();
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Sample token data for demo
  const sampleTokens = [
    {
      address: '0x55d398326f99059fF775485246999027B3197955',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 18,
      totalSupply: '1000000000000000000000000000',
      balance: '1250500000000000000000'
    },
    {
      address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      name: 'BUSD Token',
      symbol: 'BUSD',
      decimals: 18,
      totalSupply: '500000000000000000000000000',
      balance: '750000000000000000000'
    }
  ];

  const loadTokenInfo = async () => {
    if (!tokenAddress) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ token",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingToken(true);
    try {
      // Simulate loading token info
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use sample data for demo
      const sampleToken = sampleTokens.find(t => 
        t.address.toLowerCase() === tokenAddress.toLowerCase()
      ) || sampleTokens[0];

      setTokenInfo(sampleToken);
      onTokenInfoUpdate(sampleToken);

      toast({
        title: "Token đã được tải",
        description: `${sampleToken.name} (${sampleToken.symbol})`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin token",
        variant: "destructive"
      });
    } finally {
      setIsLoadingToken(false);
    }
  };

  const executeTransfer = async () => {
    if (!transferTo || !transferAmount || !tokenInfo) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin transfer",
        variant: "destructive"
      });
      return;
    }

    setIsTransferring(true);
    try {
      // Simulate transfer
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const txHash = '0x' + Math.random().toString(16).substr(2, 64);
      const transaction = {
        hash: txHash,
        type: 'Token Transfer',
        token: tokenInfo.symbol,
        from: walletAddress,
        to: transferTo,
        amount: transferAmount,
        timestamp: new Date().toISOString(),
        status: 'success'
      };

      onTransactionSent(transaction);
      
      // Reset form
      setTransferTo('');
      setTransferAmount('');

      toast({
        title: "Transfer thành công",
        description: `Đã gửi ${transferAmount} ${tokenInfo.symbol}`,
      });
    } catch (error) {
      toast({
        title: "Transfer thất bại",
        description: "Có lỗi xảy ra khi thực hiện transfer",
        variant: "destructive"
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const formatTokenAmount = (amount: string, decimals: number): string => {
    const value = parseFloat(amount) / Math.pow(10, decimals);
    return value.toLocaleString('en-US', { maximumFractionDigits: 4 });
  };

  const selectSampleToken = (token: any) => {
    setTokenAddress(token.address);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Token Information */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-green-600" />
            <span>Thông tin Token ERC-20</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sample Tokens */}
          <div>
            <Label>Token mẫu (BSC)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {sampleTokens.map((token, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => selectSampleToken(token)}
                  className="text-xs"
                >
                  {token.symbol}
                </Button>
              ))}
            </div>
          </div>

          {/* Token Address */}
          <div>
            <Label htmlFor="token-address">Địa chỉ Token Contract</Label>
            <Input
              id="token-address"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono text-sm"
            />
          </div>

          {/* Load Token Button */}
          <Button 
            onClick={loadTokenInfo}
            disabled={!tokenAddress || !connection.isConnected || isLoadingToken}
            className="w-full"
          >
            {isLoadingToken ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tải...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Tải thông tin Token
              </>
            )}
          </Button>

          {/* Token Information Display */}
          {tokenInfo && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-lg text-green-800 mb-3">
                {tokenInfo.name} ({tokenInfo.symbol})
              </h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Decimals:</span>
                  <Badge variant="outline">{tokenInfo.decimals}</Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Supply:</span>
                  <span className="font-mono text-right">
                    {formatTokenAmount(tokenInfo.totalSupply, tokenInfo.decimals)}
                  </span>
                </div>
                
                {walletAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Balance:</span>
                    <span className="font-mono text-right font-semibold text-green-700">
                      {formatTokenAmount(tokenInfo.balance, tokenInfo.decimals)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wallet Address Required Notice */}
          {!walletAddress && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                💡 Nhập địa chỉ ví ở tab "Kết nối RPC" để xem số dư token
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Transfer */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <ArrowUpDown className="w-5 h-5 text-purple-600" />
            <span>Transfer Token</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tokenInfo ? (
            <>
              {/* Current Token Info */}
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{tokenInfo.symbol}</span>
                  <Badge variant="outline" className="text-purple-700">
                    {walletAddress ? formatTokenAmount(tokenInfo.balance, tokenInfo.decimals) : 'N/A'}
                  </Badge>
                </div>
                <p className="text-xs text-purple-600 mt-1">{tokenInfo.name}</p>
              </div>

              {/* Transfer Form */}
              <div>
                <Label htmlFor="transfer-to">Địa chỉ nhận</Label>
                <Input
                  id="transfer-to"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="0x..."
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="transfer-amount">Số lượng</Label>
                <Input
                  id="transfer-amount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.0"
                  type="number"
                  step="any"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số dư có sẵn: {walletAddress ? formatTokenAmount(tokenInfo.balance, tokenInfo.decimals) : 'N/A'} {tokenInfo.symbol}
                </p>
              </div>

              {/* Transfer Button */}
              <Button 
                onClick={executeTransfer}
                disabled={!transferTo || !transferAmount || !walletAddress || isTransferring}
                className="w-full"
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang transfer...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Transfer Token
                  </>
                )}
              </Button>

              {/* Requirements Notice */}
              {!walletAddress && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    ⚠️ Cần nhập địa chỉ ví để thực hiện transfer
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Coins className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Vui lòng tải thông tin token trước</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenManager;
