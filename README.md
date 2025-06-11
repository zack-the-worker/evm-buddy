
# EVM Buddy

Your Smart Contract Interaction Companion - A powerful web application for interacting with smart contracts on EVM-compatible blockchains. This tool provides an intuitive interface to connect to blockchain networks, load smart contracts, and execute both read and write operations.

![EVM Buddy](/lovable-uploads/a7912155-f4fc-486a-ac58-3afa5662a745.png)

## 🚀 Key Features

### 🌐 Multi-Network Support
- **Preset Networks**: Quick connection to popular networks (Ethereum, BSC, Polygon, Testnets)
- **Custom RPC**: Connect to any EVM network using custom RPC URLs
- **Auto Detection**: Automatically detect network and verify chain ID
- **Auto Connect**: Automatically connect when entering RPC URL

### 💳 Flexible Wallet Integration
- **Private Key Import**: Securely import private keys with show/hide functionality
- **Web3 Wallet Connection**: Support for MetaMask, OKX, and other popular wallets
- **Balance Updates**: Real-time wallet balance and information updates

### 📋 Smart Contract Management
- **ABI Loading**: Multiple ways to load contract ABI:
  - Manual JSON input
  - File upload (.json)
  - Explorer integration (demo)
- **Auto Loading**: Automatically load contract when address and ABI are provided
- **Method Discovery**: Automatically categorize READ and WRITE methods

### ⚡ Method Execution
- **READ Methods**: Direct blockchain calls with real-time results
- **WRITE Methods**: Transaction simulation with gas estimation
- **Parameter Validation**: Smart validation based on Solidity data types
- **Gas Estimation**: Accurate gas limit and gas price estimation
- **Result Formatting**: Beautiful formatting for complex return values including structs and arrays

### 💾 Configuration Management
- **Save Configurations**: Save frequently used network and contract configurations
- **Quick Load**: Load saved configurations with one click
- **Export/Import**: Easy configuration sharing

### 📊 Activity Tracking
- **Activity Logs**: Record all blockchain interaction activities
- **Detailed Timestamps**: Each log has precise timestamp (day/month/year hour:minute:second)
- **Raw Data**: Display raw data for debugging
- **Clearable**: Users can clear all logs
- **Scrollable**: Scrollable interface to view multiple logs

### 🎨 User Experience
- **Responsive Design**: Works perfectly on desktop and mobile
- **Real-time Updates**: Live connection status and wallet information
- **Error Handling**: Comprehensive error messages and troubleshooting guidance
- **Professional Interface**: Modern, clean interface with smooth effects
- **Notifications**: Display in top-right corner

## 🛠️ Getting Started

### System Requirements
- Node.js 16+ or Bun
- Modern browser with MetaMask or other Web3 wallet (optional)

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd evm-buddy
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5173`

## 📖 Usage Guide

### 1. Connect to Blockchain Network

**Option A: Use preset networks**
1. Select a preset network from dropdown (Ethereum, BSC, Polygon, etc.)
2. App will automatically connect

**Option B: Custom RPC (Auto Connect)**
1. Enter custom RPC URL in "RPC URL" field
2. App will automatically connect and detect network

### 2. Connect Your Wallet

**Option A: Private Key**
1. Enter private key in "Private Key" field
2. Use eye icon to show/hide key
3. Wallet address and balance will display automatically

**Option B: Web3 Wallet**
1. Click "Connect Wallet"
2. Choose preferred wallet (MetaMask, OKX, etc.)
3. Approve connection in your wallet

### 3. Load Smart Contract

**Auto Load Method (Recommended):**
1. Enter contract address
2. Paste ABI JSON or load from file
3. Contract will automatically load

**ABI Loading Options:**
- **Manual**: Copy and paste ABI JSON
- **File Upload**: Click "Load from file" and select .json file
- **Explorer**: Click "Load from Explorer" (demo with sample ABI)

### 4. Execute Contract Methods

**READ Methods (View/Pure):**
1. Select READ method from dropdown
2. Enter required parameters
3. Click "Call Method"
4. Results display immediately

**WRITE Methods (State-changing):**
1. Select WRITE method from dropdown
2. Enter required parameters
3. Set ETH value (if payable)
4. Adjust gas settings or click "Estimate Gas"
5. Click "Call Method"
6. Approve transaction in wallet (if using Web3 wallet)

### 5. Save and Load Configurations

**Save Configuration:**
1. Set up network, contract, and wallet
2. Click "Save as Preset" in Preset Management section
3. Enter name for preset

**Load Configuration:**
1. Click on saved preset to load instantly
2. All settings will be restored

### 6. Track Activity

**Activity Logs:**
- View all activity logs at bottom of interface
- Each log has detailed timestamp
- Scrollable to view multiple logs
- Click "Clear" to remove all logs

## 🔧 Supported Features

### Contract Types
- **ERC-20 Tokens**: Full support for standard token operations
- **ERC-721 NFTs**: Complete NFT interaction capabilities
- **Custom Contracts**: Any EVM-compatible smart contract
- **Complex Types**: Structs, arrays, and nested data structures

### Parameter Types
- **Basic Types**: uint256, string, bool, address, bytes32
- **Complex Types**: Arrays, structs, tuples
- **Validation**: Automatic parameter validation and type checking

### Transaction Features
- **Gas Estimation**: Accurate gas calculations
- **Custom Gas**: Manual gas limit and gas price setting
- **ETH Value**: Support for payable functions
- **Transaction Simulation**: Safe testing before execution

## 🌟 Advanced Features

### Real-time Blockchain Calls
- READ methods perform actual RPC calls to blockchain
- Direct data retrieval with proper result parsing
- Support for complex return types

### Smart Result Formatting
- Automatic formatting based on parameter types
- Special handling for timestamps, token amounts, and addresses
- Structured display for complex objects and arrays

### Error Handling
- Comprehensive error messages
- Transaction revert reasons
- Network connection issues
- Parameter validation errors

## 🔒 Security

- **Private Key Handling**: Private keys are stored locally and never transmitted
- **Secure Connections**: All RPC calls use secure HTTPS connections
- **Input Validation**: Comprehensive validation of all user inputs
- **No Backend**: Completely client-side application for maximum security

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Blockchain**: ethers.js v6
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📝 Examples

### Example 1: ERC-20 Token Interaction
1. Connect to Ethereum Mainnet
2. Load USDC contract: `0xA0b86a33E6417Aa1e7Ae27c0D93C26c717E1D4dE`
3. Use standard ERC-20 ABI
4. Call `balanceOf` with your address
5. Call `transfer` to send tokens

### Example 2: Custom Contract
1. Connect to your network
2. Enter contract address
3. Load contract ABI file
4. Execute custom methods with appropriate parameters

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🆘 Support

If you encounter issues:
1. Check console for error messages
2. Verify network connection
3. Ensure wallet is properly connected
4. Validate contract address and ABI format
5. Check Activity Logs for debugging

For additional support, please open an issue in the repository.

---

**EVM Buddy - Built with ❤️ for the Web3 community**
