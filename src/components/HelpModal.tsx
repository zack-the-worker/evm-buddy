
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Wallet, 
  Code, 
  Send, 
  Settings, 
  ScrollText,
  CheckCircle,
  AlertTriangle,
  Info,
  HelpCircle
} from 'lucide-react';

const HelpModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4" />
          <span>Hướng dẫn sử dụng</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span>EVM Buddy - Hướng dẫn sử dụng</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Giới thiệu */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span>Về EVM Buddy</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                EVM Buddy là ứng dụng web mạnh mẽ giúp bạn tương tác với smart contracts trên các blockchain tương thích EVM. 
                Ứng dụng cung cấp giao diện trực quan để kết nối mạng, quản lý ví và thực thi các phương thức contract.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">✨ Tính năng chính</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Hỗ trợ đa mạng blockchain</li>
                    <li>• Tích hợp ví linh hoạt</li>
                    <li>• Thực thi smart contract</li>
                    <li>• Theo dõi hoạt động</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-1">🔒 Bảo mật</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Private key lưu cục bộ</li>
                    <li>• Kết nối HTTPS an toàn</li>
                    <li>• Không có backend</li>
                    <li>• Xác thực đầu vào</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Hướng dẫn từng bước */}
            <div>
              <h3 className="text-lg font-semibold mb-4">📚 Hướng dẫn từng bước</h3>
              
              {/* Bước 1: Kết nối mạng */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Bước 1: Kết nối mạng Blockchain</span>
                  <Badge variant="outline" className="text-xs">Tự động</Badge>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Cách 1:</strong> Chọn mạng có sẵn từ dropdown (Ethereum, BSC, Polygon...)</p>
                  <p><strong>Cách 2:</strong> Nhập URL RPC tùy chỉnh - ứng dụng sẽ tự động kết nối và phát hiện mạng</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 text-xs">Kết nối thành công khi thấy badge màu xanh với tên mạng</span>
                  </div>
                </div>
              </div>

              {/* Bước 2: Kết nối ví */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-purple-600" />
                  <span>Bước 2: Kết nối ví</span>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Private Key:</strong> Nhập private key (có thể ẩn/hiện), số dư sẽ tự động cập nhật</p>
                  <p><strong>Web3 Wallet:</strong> Nhấp "Connect Wallet" để kết nối MetaMask, OKX, etc.</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700 text-xs">Private key chỉ lưu cục bộ, không gửi đi đâu</span>
                  </div>
                </div>
              </div>

              {/* Bước 3: Tải Contract */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Code className="w-4 h-4 text-green-600" />
                  <span>Bước 3: Tải Smart Contract</span>
                  <Badge variant="outline" className="text-xs">Tự động</Badge>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Tự động:</strong> Nhập địa chỉ contract và ABI - contract sẽ tự động tải</p>
                  <p><strong>Tải ABI:</strong> Paste JSON, tải file .json, hoặc "Load from Explorer" (demo)</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 text-xs">Contract đã tải khi thấy số lượng READ/write methods</span>
                  </div>
                </div>
              </div>

              {/* Bước 4: Thực thi */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Send className="w-4 h-4 text-orange-600" />
                  <span>Bước 4: Thực thi phương thức</span>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-3">
                  <div>
                    <p className="font-medium text-blue-700">READ Methods (View/Pure):</p>
                    <p>• Chọn method từ dropdown → Nhập tham số → "Call Method" → Kết quả ngay lập tức</p>
                  </div>
                  <div>
                    <p className="font-medium text-orange-700">WRITE Methods (Nonpayable/Payable):</p>
                    <p>• Chọn method → Nhập tham số → Đặt ETH value/Gas → "Estimate Gas" hoặc "Call Method"</p>
                  </div>
                </div>
              </div>

              {/* Bước 5: Theo dõi */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <ScrollText className="w-4 h-4 text-teal-600" />
                  <span>Bước 5: Theo dõi hoạt động</span>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Activity Logs:</strong> Tất cả hoạt động được ghi lại với timestamp chi tiết</p>
                  <p><strong>Raw Data:</strong> Xem dữ liệu thô để debug</p>
                  <p><strong>Clear Logs:</strong> Xóa toàn bộ logs khi cần</p>
                </div>
              </div>

              {/* Bước 6: Lưu cấu hình */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span>Bước 6: Quản lý Presets</span>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Lưu:</strong> "Save as Preset" để lưu cấu hình hiện tại (RPC, contract, wallet...)</p>
                  <p><strong>Tải:</strong> Nhấp preset đã lưu để khôi phục cấu hình ngay lập tức</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tips và Troubleshooting */}
            <div>
              <h3 className="text-lg font-semibold mb-4">💡 Tips & Troubleshooting</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">✅ Best Practices</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Luôn kiểm tra địa chỉ contract trước khi tương tác</li>
                    <li>• Dùng "Estimate Gas" trước khi gửi transaction</li>
                    <li>• Kiểm tra Activity Logs để debug</li>
                    <li>• Lưu preset cho các contract thường dùng</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Troubleshooting</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Lỗi kết nối: Kiểm tra URL RPC</li>
                    <li>• Lỗi ABI: Đảm bảo JSON format đúng</li>
                    <li>• Lỗi gas: Tăng gas limit hoặc gas price</li>
                    <li>• Lỗi params: Kiểm tra type và format tham số</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Supported Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">🔧 Tính năng được hỗ trợ</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Contract Types</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• ERC-20 Tokens</li>
                    <li>• ERC-721 NFTs</li>
                    <li>• Custom Contracts</li>
                    <li>• Complex Types</li>
                  </ul>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Parameter Types</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• uint256, string, bool</li>
                    <li>• address, bytes32</li>
                    <li>• Arrays, structs</li>
                    <li>• Auto validation</li>
                  </ul>
                </div>
                
                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-2">Networks</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Ethereum Mainnet</li>
                    <li>• BSC, Polygon</li>
                    <li>• Testnets</li>
                    <li>• Custom RPC</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;
