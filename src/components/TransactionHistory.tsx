
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  ExternalLink, 
  Copy, 
  Filter, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock 
} from 'lucide-react';

interface ConnectionState {
  rpcUrl: string;
  chainId: number | null;
  isConnected: boolean;
  networkName: string;
}

interface Transaction {
  hash: string;
  type?: string;
  method?: string;
  token?: string;
  from?: string;
  to?: string;
  amount?: string;
  params?: any;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  connection: ConnectionState;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  connection
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sample transactions for demo
  const sampleTransactions: Transaction[] = [
    {
      hash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
      type: 'Smart Contract Call',
      method: 'transfer',
      timestamp: '2024-01-15T14:30:00Z',
      status: 'success'
    },
    {
      hash: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567',
      type: 'Token Transfer',
      token: 'USDT',
      from: '0x742d35Cc6435C14C5f2f6e32f3e1a93b71A2c11C',
      to: '0x8ba1f109551bd432803012645hf65abdf3ba8a',
      amount: '100.5',
      timestamp: '2024-01-15T13:15:00Z',
      status: 'success'
    },
    {
      hash: '0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
      type: 'Smart Contract Call',
      method: 'approve',
      timestamp: '2024-01-15T12:00:00Z',
      status: 'failed'
    },
    {
      hash: '0xd4e5f6789012345678901234567890abcdef1234567890abcdef123456789',
      type: 'Token Transfer',
      token: 'BUSD',
      from: '0x742d35Cc6435C14C5f2f6e32f3e1a93b71A2c11C',
      to: '0x8ba1f109551bd432803012645hf65abdf3ba8a',
      amount: '250.0',
      timestamp: '2024-01-15T11:45:00Z',
      status: 'pending'
    }
  ];

  const displayTransactions = transactions.length > 0 ? transactions : sampleTransactions;

  const getExplorerUrl = (txHash: string): string => {
    const explorers: { [key: number]: string } = {
      1: 'https://etherscan.io/tx/',
      56: 'https://bscscan.com/tx/',
      137: 'https://polygonscan.com/tx/',
      97: 'https://testnet.bscscan.com/tx/',
      5: 'https://goerli.etherscan.io/tx/'
    };
    
    const baseUrl = connection.chainId ? explorers[connection.chainId] : 'https://etherscan.io/tx/';
    return `${baseUrl}${txHash}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Đã sao chép",
      description: "Hash giao dịch đã được sao chép vào clipboard",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800 border-green-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status === 'success' ? 'Thành công' : 
         status === 'failed' ? 'Thất bại' : 
         status === 'pending' ? 'Đang xử lý' : status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const filteredTransactions = displayTransactions.filter(tx => {
    const matchesSearch = tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.method?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5 text-purple-600" />
              <span>Lịch sử Giao dịch</span>
            </CardTitle>
            
            <Badge variant="outline">
              {filteredTransactions.length} giao dịch
            </Badge>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo hash, type, method..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Tất cả
              </Button>
              <Button
                variant={statusFilter === 'success' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('success')}
              >
                Thành công
              </Button>
              <Button
                variant={statusFilter === 'failed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('failed')}
              >
                Thất bại
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Đang xử lý
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx, index) => (
            <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Transaction Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(tx.status)}
                      <h3 className="font-semibold text-lg">{tx.type || 'Smart Contract Call'}</h3>
                      {getStatusBadge(tx.status)}
                    </div>

                    {/* Transaction Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Hash:</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {formatAddress(tx.hash)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tx.hash)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-500">Thời gian:</span>
                        <div className="mt-1">{formatDate(tx.timestamp)}</div>
                      </div>

                      {tx.method && (
                        <div>
                          <span className="text-gray-500">Method:</span>
                          <div className="mt-1">
                            <Badge variant="outline" className="font-mono text-xs">
                              {tx.method}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {tx.token && (
                        <div>
                          <span className="text-gray-500">Token:</span>
                          <div className="mt-1">
                            <Badge variant="outline" className="font-semibold">
                              {tx.token}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {tx.from && (
                        <div>
                          <span className="text-gray-500">From:</span>
                          <div className="mt-1 font-mono text-xs">
                            {formatAddress(tx.from)}
                          </div>
                        </div>
                      )}

                      {tx.to && (
                        <div>
                          <span className="text-gray-500">To:</span>
                          <div className="mt-1 font-mono text-xs">
                            {formatAddress(tx.to)}
                          </div>
                        </div>
                      )}

                      {tx.amount && (
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <div className="mt-1 font-semibold">
                            {tx.amount} {tx.token}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(getExplorerUrl(tx.hash), '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Explorer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Send className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có giao dịch nào</h3>
              <p className="text-gray-500">Thực hiện giao dịch để xem lịch sử ở đây</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Network Info */}
      {connection.isConnected && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị giao dịch trên <span className="font-semibold">{connection.networkName}</span>
              </div>
              <Badge variant="outline">
                Chain ID: {connection.chainId}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TransactionHistory;
