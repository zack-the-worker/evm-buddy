
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Github, Globe, Coins, Code, Send, Palette } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ThemeToggle />
      
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Code className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Web3 Toolkit
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Công cụ tương tác toàn diện với blockchain - Quản lý RPC, Token ERC-20, Smart Contract và nhiều hơn nữa
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Globe className="w-4 h-4 mr-2" />
              Multi-chain Support
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Coins className="w-4 h-4 mr-2" />
              ERC-20 Tokens
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Code className="w-4 h-4 mr-2" />
              Smart Contracts
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Send className="w-4 h-4 mr-2" />
              Transaction History
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
              Bắt đầu sử dụng
            </Button>
            
            <Button variant="outline" size="lg" className="px-8 py-3" asChild>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2"
              >
                <Github className="w-5 h-5" />
                <span>GitHub</span>
              </a>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* RPC Connection */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Kết nối RPC</CardTitle>
              <CardDescription>
                Kết nối với các mạng blockchain khác nhau thông qua RPC endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Hỗ trợ đa mạng (BSC, Ethereum, Polygon)</li>
                <li>• Cài đặt RPC tùy chỉnh</li>
                <li>• Kiểm tra trạng thái kết nối</li>
                <li>• Quản lý địa chỉ ví</li>
              </ul>
            </CardContent>
          </Card>

          {/* Token Management */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Quản lý Token ERC-20</CardTitle>
              <CardDescription>
                Xem thông tin và thực hiện giao dịch với các token ERC-20
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Tải thông tin token tự động</li>
                <li>• Hiển thị số dư và metadata</li>
                <li>• Transfer token nhanh chóng</li>
                <li>• Lịch sử giao dịch chi tiết</li>
              </ul>
            </CardContent>
          </Card>

          {/* Smart Contract */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Smart Contract</CardTitle>
              <CardDescription>
                Tương tác với smart contract thông qua ABI interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Tải ABI từ file hoặc explorer</li>
                <li>• Gọi READ/WRITE functions</li>
                <li>• Cấu hình gas và parameters</li>
                <li>• Theo dõi transaction status</li>
              </ul>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Lịch sử Giao dịch</CardTitle>
              <CardDescription>
                Theo dõi và quản lý tất cả các giao dịch đã thực hiện
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Lịch sử chi tiết mọi giao dịch</li>
                <li>• Lọc theo trạng thái và loại</li>
                <li>• Liên kết tới block explorer</li>
                <li>• Export dữ liệu giao dịch</li>
              </ul>
            </CardContent>
          </Card>

          {/* Preset Management */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Quản lý Preset</CardTitle>
              <CardDescription>
                Lưu và quản lý các cấu hình mạng và contract thường dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Lưu cấu hình RPC</li>
                <li>• Quản lý contract yêu thích</li>
                <li>• Import/Export settings</li>
                <li>• Đồng bộ cross-device</li>
              </ul>
            </CardContent>
          </Card>

          {/* Help & Support */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Github className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Hỗ trợ & Tài liệu</CardTitle>
              <CardDescription>
                Hướng dẫn sử dụng và hỗ trợ kỹ thuật
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li>• Tài liệu hướng dẫn chi tiết</li>
                <li>• Video tutorials</li>
                <li>• FAQ và troubleshooting</li>
                <li>• Cộng đồng hỗ trợ</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p className="mb-4">
            Được phát triển với ❤️ bởi Web3 Community
          </p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
