
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Network, Wallet, FileText, Play, Activity, Save } from "lucide-react";

const HelpModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Hướng dẫn sử dụng
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            🚀 EVM Buddy - Hướng dẫn sử dụng
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              Công cụ tương tác với Smart Contract trên các blockchain EVM
            </p>
          </div>

          <div className="grid gap-6">
            {/* Network Connection */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Network className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">1. Kết nối mạng Blockchain</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Mạng có sẵn:</strong> Chọn từ dropdown (Ethereum, BSC, Polygon, v.v.)</p>
                <p><strong>RPC tùy chỉnh:</strong> Nhập URL RPC của mạng bạn muốn kết nối</p>
                <p className="text-muted-foreground">💡 Ứng dụng sẽ tự động phát hiện và kết nối đến mạng</p>
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">2. Kết nối ví</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Private Key:</strong> Nhập private key vào ô tương ứng (có thể ẩn/hiện)</p>
                <p><strong>Web3 Wallet:</strong> Nhấn "Connect Wallet" để kết nối MetaMask, OKX, v.v.</p>
                <p className="text-muted-foreground">💡 Số dư và địa chỉ ví sẽ hiển thị tự động</p>
              </div>
            </div>

            {/* Smart Contract */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">3. Tải Smart Contract</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Địa chỉ contract:</strong> Nhập địa chỉ contract muốn tương tác</p>
                <p><strong>ABI:</strong> Dán JSON ABI hoặc tải từ file .json</p>
                <p><strong>Tự động tải:</strong> Contract sẽ tự động load khi có đủ địa chỉ và ABI</p>
                <p className="text-muted-foreground">💡 Có thể load ABI từ Explorer (demo)</p>
              </div>
            </div>

            {/* Method Execution */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Play className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold">4. Thực thi các phương thức</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>READ Methods:</strong> Gọi trực tiếp, không tốn gas, kết quả ngay lập tức</p>
                <p><strong>WRITE Methods:</strong> Cần gas fee, có thể ước tính gas trước khi thực thi</p>
                <p><strong>Parameters:</strong> Nhập đúng kiểu dữ liệu theo yêu cầu của method</p>
                <p className="text-muted-foreground">💡 Kết quả hiển thị với format đẹp, bao gồm struct và array</p>
              </div>
            </div>

            {/* Activity Logs */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold">5. Theo dõi Activity Logs</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Ghi log tự động:</strong> Tất cả tương tác được ghi log với timestamp chi tiết</p>
                <p><strong>Raw data:</strong> Hiển thị toàn bộ chi tiết transaction và method call</p>
                <p><strong>Quản lý:</strong> Có thể cuộn xem lịch sử và xóa log khi cần</p>
                <p className="text-muted-foreground">💡 Logs giúp debug và theo dõi các hoạt động đã thực hiện</p>
              </div>
            </div>

            {/* Presets */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Save className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-semibold">6. Lưu và tải Presets</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Lưu cấu hình:</strong> Lưu toàn bộ thiết lập (mạng, contract, ví) thành preset</p>
                <p><strong>Tải nhanh:</strong> Nhấn vào preset đã lưu để tải lại cấu hình</p>
                <p className="text-muted-foreground">💡 Tiện lợi cho việc chuyển đổi giữa các dự án khác nhau</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">🔒 Bảo mật</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Private key chỉ lưu cục bộ, không gửi đi đâu</li>
              <li>• Tất cả kết nối RPC đều sử dụng HTTPS</li>
              <li>• Ứng dụng hoàn toàn client-side, không có backend</li>
              <li>• Validation toàn diện cho mọi input từ người dùng</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">💡 Mẹo sử dụng</h4>
            <ul className="text-sm space-y-1">
              <li>• Luôn kiểm tra Activity Logs khi gặp lỗi</li>
              <li>• Sử dụng "Estimate Gas" trước khi thực thi WRITE methods</li>
              <li>• Lưu preset cho các contract thường sử dụng</li>
              <li>• Kiểm tra kết nối mạng và ví trước khi bắt đầu</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpModal;
