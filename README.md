
# EVM Buddy

Your Smart Contract Interaction Companion - Ứng dụng web mạnh mẽ để tương tác với smart contracts trên các blockchain tương thích EVM. Công cụ này cung cấp giao diện trực quan để kết nối với mạng blockchain, tải smart contracts và thực hiện cả các thao tác đọc và ghi.

![EVM Buddy](/lovable-uploads/a7912155-f4fc-486a-ac58-3afa5662a745.png)

## 🚀 Tính năng chính

### 🌐 Hỗ trợ đa mạng
- **Mạng có sẵn**: Kết nối nhanh với các mạng phổ biến (Ethereum, BSC, Polygon, Testnets)
- **RPC tùy chỉnh**: Kết nối với bất kỳ mạng EVM nào bằng URL RPC tùy chỉnh
- **Tự động phát hiện**: Tự động phát hiện mạng và xác minh chain ID
- **Tự động kết nối**: Tự động kết nối khi nhập URL RPC

### 💳 Tích hợp ví linh hoạt
- **Nhập Private Key**: Nhập private key an toàn với tính năng ẩn/hiện
- **Kết nối ví Web3**: Hỗ trợ MetaMask, OKX và các ví phổ biến khác
- **Cập nhật số dư**: Tự động cập nhật số dư và thông tin ví theo thời gian thực

### 📋 Quản lý Smart Contract
- **Tải ABI**: Nhiều cách tải ABI contract:
  - Nhập JSON thủ công
  - Tải file (.json)
  - Tích hợp explorer (demo)
- **Tự động tải**: Tự động tải contract khi có địa chỉ và ABI
- **Khám phá phương thức**: Tự động phân loại các phương thức READ và WRITE

### ⚡ Thực thi phương thức
- **Phương thức READ**: Gọi trực tiếp blockchain với kết quả thời gian thực
- **Phương thức WRITE**: Mô phỏng giao dịch với ước tính gas
- **Xác thực tham số**: Xác thực thông minh dựa trên kiểu dữ liệu Solidity
- **Ước tính Gas**: Ước tính chính xác gas limit và giá gas
- **Định dạng kết quả**: Định dạng đẹp cho các giá trị trả về phức tạp bao gồm structs và arrays

### 💾 Quản lý cấu hình
- **Lưu cấu hình**: Lưu các cấu hình mạng và contract thường dùng
- **Tải nhanh**: Tải cấu hình đã lưu chỉ với một cú nhấp chuột
- **Xuất/Nhập**: Dễ dàng chia sẻ cấu hình

### 📊 Theo dõi hoạt động
- **Activity Logs**: Ghi lại tất cả các hoạt động tương tác với blockchain
- **Thời gian chi tiết**: Mỗi log có timestamp chính xác (ngày/tháng/năm giờ:phút:giây)
- **Raw Data**: Hiển thị dữ liệu thô để debug
- **Có thể xóa**: Người dùng có thể xóa toàn bộ logs
- **Cuộn được**: Giao diện cuộn để xem nhiều logs

### 🎨 Trải nghiệm người dùng
- **Thiết kế responsive**: Hoạt động hoàn hảo trên desktop và mobile
- **Cập nhật thời gian thực**: Trạng thái kết nối và thông tin ví trực tiếp
- **Xử lý lỗi**: Thông báo lỗi và hướng dẫn khắc phục toàn diện
- **Giao diện chuyên nghiệp**: Giao diện hiện đại, sạch sẽ với hiệu ứng mượt mà
- **Thông báo**: Hiển thị ở góc trên bên phải

## 🛠️ Bắt đầu sử dụng

### Yêu cầu hệ thống
- Node.js 16+ hoặc Bun
- Trình duyệt hiện đại có MetaMask hoặc ví Web3 khác (tùy chọn)

### Cài đặt

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd evm-buddy
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   # hoặc
   bun install
   ```

3. **Khởi động development server**
   ```bash
   npm run dev
   # hoặc
   bun dev
   ```

4. **Mở trình duyệt**
   Điều hướng đến `http://localhost:5173`

## 📖 Hướng dẫn sử dụng

### 1. Kết nối với mạng Blockchain

**Tùy chọn A: Sử dụng mạng có sẵn**
1. Chọn mạng có sẵn từ dropdown (Ethereum, BSC, Polygon, v.v.)
2. Ứng dụng sẽ tự động kết nối

**Tùy chọn B: RPC tùy chỉnh (Tự động kết nối)**
1. Nhập URL RPC tùy chỉnh vào trường "RPC URL"
2. Ứng dụng sẽ tự động kết nối và phát hiện mạng

### 2. Kết nối ví của bạn

**Tùy chọn A: Private Key**
1. Nhập private key vào trường "Private Key"
2. Sử dụng biểu tượng mắt để hiện/ẩn key
3. Địa chỉ ví và số dư sẽ hiển thị tự động

**Tùy chọn B: Ví Web3**
1. Nhấp "Connect Wallet"
2. Chọn ví ưa thích (MetaMask, OKX, v.v.)
3. Phê duyệt kết nối trong ví của bạn

### 3. Tải Smart Contract

**Phương pháp Tự động tải (Khuyến nghị):**
1. Nhập địa chỉ contract
2. Dán ABI JSON hoặc tải từ file
3. Contract sẽ tự động tải

**Tùy chọn tải ABI:**
- **Thủ công**: Copy và paste ABI JSON
- **Tải file**: Nhấp "Load from file" và chọn file .json
- **Explorer**: Nhấp "Load from Explorer" (demo với ABI mẫu)

### 4. Thực thi phương thức Contract

**Phương thức READ (View/Pure):**
1. Chọn phương thức READ từ dropdown
2. Nhập các tham số cần thiết
3. Nhấp "Call Method"
4. Kết quả hiển thị ngay lập tức

**Phương thức WRITE (Thay đổi state):**
1. Chọn phương thức WRITE từ dropdown
2. Nhập các tham số cần thiết
3. Đặt giá trị ETH (nếu payable)
4. Điều chỉnh cài đặt gas hoặc nhấp "Estimate Gas"
5. Nhấp "Call Method"
6. Phê duyệt giao dịch trong ví (nếu dùng ví Web3)

### 5. Lưu và tải cấu hình

**Lưu cấu hình:**
1. Thiết lập mạng, contract và ví
2. Nhấp "Save as Preset" trong phần Preset Management
3. Nhập tên cho preset

**Tải cấu hình:**
1. Nhấp vào preset đã lưu để tải ngay lập tức
2. Tất cả cài đặt sẽ được khôi phục

### 6. Theo dõi hoạt động

**Activity Logs:**
- Xem tất cả logs hoạt động ở phần cuối giao diện
- Mỗi log có timestamp chi tiết
- Có thể cuộn để xem nhiều logs
- Nhấp "Clear" để xóa toàn bộ logs

## 🔧 Tính năng được hỗ trợ

### Loại Contract
- **ERC-20 Tokens**: Hỗ trợ đầy đủ các thao tác token chuẩn
- **ERC-721 NFTs**: Khả năng tương tác NFT hoàn chỉnh
- **Custom Contracts**: Bất kỳ smart contract tương thích EVM nào
- **Kiểu phức tạp**: Structs, arrays và cấu trúc dữ liệu lồng nhau

### Kiểu tham số
- **Kiểu cơ bản**: uint256, string, bool, address, bytes32
- **Kiểu phức tạp**: Arrays, structs, tuples
- **Xác thực**: Tự động xác thực tham số và kiểm tra kiểu

### Tính năng giao dịch
- **Ước tính Gas**: Tính toán gas chính xác
- **Gas tùy chỉnh**: Đặt gas limit và giá gas thủ công
- **Giá trị ETH**: Hỗ trợ các hàm payable
- **Mô phỏng giao dịch**: Kiểm tra an toàn trước khi thực thi

## 🌟 Tính năng nâng cao

### Gọi Blockchain thời gian thực
- Phương thức READ thực hiện gọi RPC thực tế đến blockchain
- Truy xuất dữ liệu trực tiếp với phân tích kết quả đúng
- Hỗ trợ các kiểu trả về phức tạp

### Định dạng kết quả thông minh
- Tự động định dạng dựa trên kiểu tham số
- Xử lý đặc biệt cho timestamps, số lượng token và địa chỉ
- Hiển thị có cấu trúc cho objects và arrays phức tạp

### Xử lý lỗi
- Thông báo lỗi toàn diện
- Lý do revert giao dịch
- Vấn đề kết nối mạng
- Lỗi xác thực tham số

## 🔒 Bảo mật

- **Xử lý Private Key**: Private keys được lưu cục bộ và không bao giờ được truyền
- **Kết nối an toàn**: Tất cả gọi RPC sử dụng kết nối HTTPS an toàn
- **Xác thực đầu vào**: Xác thực toàn diện tất cả đầu vào người dùng
- **Không Backend**: Ứng dụng hoàn toàn phía client để bảo mật tối đa

## 🛠️ Stack công nghệ

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: ethers.js v6
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📝 Ví dụ

### Ví dụ 1: Tương tác ERC-20 Token
1. Kết nối với Ethereum Mainnet
2. Tải USDC contract: `0xA0b86a33E6417Aa1e7Ae27c0D93C26c717E1D4dE`
3. Sử dụng ABI ERC-20 chuẩn
4. Gọi `balanceOf` với địa chỉ của bạn
5. Gọi `transfer` để gửi tokens

### Ví dụ 2: Contract tùy chỉnh
1. Kết nối với mạng của bạn
2. Nhập địa chỉ contract
3. Tải file ABI của contract
4. Thực thi các phương thức tùy chỉnh với tham số phù hợp

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Thực hiện thay đổi
4. Test kỹ lưỡng
5. Gửi pull request

## 📄 Giấy phép

Dự án này được cấp phép theo MIT License - xem file LICENSE để biết chi tiết.

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console để xem thông báo lỗi
2. Xác minh kết nối mạng
3. Đảm bảo ví được kết nối đúng cách
4. Xác thực định dạng địa chỉ contract và ABI
5. Xem Activity Logs để debug

Để được hỗ trợ thêm, vui lòng mở issue trong repository.

---

**EVM Buddy - Được tạo với ❤️ cho cộng đồng Web3**
