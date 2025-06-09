
# Smart Contract Communicator

A powerful web application for interacting with smart contracts on EVM-compatible blockchains. This tool provides an intuitive interface for connecting to blockchain networks, loading smart contracts, and executing both read and write operations.

![Smart Contract Communicator](/lovable-uploads/a7912155-f4fc-486a-ac58-3afa5662a745.png)

## 🚀 Features

### 🌐 Multi-Network Support
- **Preset Networks**: Quick connection to popular networks (Ethereum, BSC, Polygon, Testnets)
- **Custom RPC**: Connect to any EVM-compatible network using custom RPC URLs
- **Auto-Detection**: Automatic network detection and chain ID verification

### 💳 Flexible Wallet Integration
- **Private Key Input**: Secure private key entry with show/hide functionality
- **Web3 Wallet Connection**: Support for MetaMask, OKX, and other popular wallets
- **Real-time Balance**: Automatic balance updates and wallet information display

### 📋 Smart Contract Management
- **ABI Loading**: Multiple ways to load contract ABIs:
  - Manual JSON input
  - File upload (.json)
  - Explorer integration (demo)
- **Auto-Loading**: Automatic contract loading when address and ABI are provided
- **Method Discovery**: Automatic categorization of READ and WRITE methods

### ⚡ Method Execution
- **READ Methods**: Direct blockchain calls with real-time results
- **WRITE Methods**: Transaction simulation with gas estimation
- **Parameter Validation**: Smart parameter validation based on Solidity types
- **Gas Estimation**: Accurate gas limit and price estimation
- **Result Formatting**: Beautiful formatting of complex return values including structs and arrays

### 💾 Preset Management
- **Save Configurations**: Save frequently used network and contract configurations
- **Quick Load**: One-click loading of saved presets
- **Export/Import**: Easy sharing of configurations

### 🎨 User Experience
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Real-time Updates**: Live connection status and wallet information
- **Error Handling**: Comprehensive error messages and troubleshooting
- **Professional UI**: Modern, clean interface with smooth animations

## 🛠️ Getting Started

### Prerequisites
- Node.js 16+ or Bun
- Modern web browser with MetaMask or other Web3 wallet (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-contract-communicator
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 How to Use

### 1. Connect to a Blockchain Network

**Option A: Use Preset Networks**
1. Select a preset network from the dropdown (Ethereum, BSC, Polygon, etc.)
2. The application will automatically connect

**Option B: Custom RPC**
1. Enter your custom RPC URL in the "RPC URL" field
2. The application will auto-connect and detect the network

### 2. Connect Your Wallet

**Option A: Private Key**
1. Enter your private key in the "Private Key" field
2. Use the eye icon to show/hide the key
3. Your wallet address and balance will appear automatically

**Option B: Web3 Wallet**
1. Click "Connect Wallet"
2. Choose your preferred wallet (MetaMask, OKX, etc.)
3. Approve the connection in your wallet

### 3. Load a Smart Contract

**Auto-Loading Method (Recommended):**
1. Enter the contract address
2. Paste the ABI JSON or load from file
3. The contract will load automatically

**Manual Loading:**
1. Enter contract address and ABI
2. Click "Load Smart Contract"

**ABI Loading Options:**
- **Manual**: Copy and paste ABI JSON
- **File Upload**: Click "Load from file" and select a .json file
- **Explorer**: Click "Load from Explorer" (demo with sample ABI)

### 4. Execute Contract Methods

**READ Methods (View/Pure):**
1. Select a READ method from the dropdown
2. Enter required parameters
3. Click "Call Method"
4. Results appear instantly

**WRITE Methods (State-Changing):**
1. Select a WRITE method from the dropdown
2. Enter required parameters
3. Set ETH value (if payable)
4. Adjust gas settings or click "Estimate Gas"
5. Click "Call Method"
6. Approve transaction in your wallet (if using Web3 wallet)

### 5. Save and Load Presets

**Save Configuration:**
1. Set up your network, contract, and wallet
2. Click "Save as Preset" in the Preset Management section
3. Enter a name for your preset

**Load Configuration:**
1. Click on any saved preset to load it instantly
2. All settings (RPC, contract, wallet) will be restored

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
- **Custom Gas**: Manual gas limit and price setting
- **ETH Value**: Support for payable functions
- **Transaction Simulation**: Safe testing before execution

## 🌟 Advanced Features

### Real-time Blockchain Calls
- READ methods make actual RPC calls to the blockchain
- Live data retrieval with proper result parsing
- Support for complex return types

### Intelligent Result Formatting
- Automatic formatting based on parameter types
- Special handling for timestamps, token amounts, and addresses
- Structured display of complex objects and arrays

### Error Handling
- Comprehensive error messages
- Transaction revert reasons
- Network connectivity issues
- Parameter validation errors

## 🔒 Security

- **Private Key Handling**: Private keys are stored locally and never transmitted
- **Secure Connections**: All RPC calls use secure HTTPS connections
- **Input Validation**: Comprehensive validation of all user inputs
- **No Backend**: Fully client-side application for maximum security

## 🛠️ Technical Stack

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
2. Enter your contract address
3. Upload your contract's ABI file
4. Execute custom methods with proper parameters

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your network connection
3. Ensure your wallet is properly connected
4. Validate contract address and ABI format

For additional help, please open an issue in the repository.

---

**Made with ❤️ for the Web3 community**
