
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
          <span>User Guide</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span>EVM Buddy - User Guide</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Introduction */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span>About EVM Buddy</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                EVM Buddy is a powerful web application that helps you interact with smart contracts on EVM-compatible blockchains. 
                The app provides an intuitive interface to connect networks, manage wallets, and execute contract methods.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">✨ Key Features</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Multi-network blockchain support</li>
                    <li>• Flexible wallet integration</li>
                    <li>• Smart contract execution</li>
                    <li>• Activity tracking</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-1">🔒 Security</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Private keys stored locally</li>
                    <li>• Secure HTTPS connections</li>
                    <li>• No backend required</li>
                    <li>• Input validation</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step-by-step Guide */}
            <div>
              <h3 className="text-lg font-semibold mb-4">📚 Step-by-Step Guide</h3>
              
              {/* Step 1: Network Connection */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>Step 1: Connect to Blockchain Network</span>
                  <Badge variant="outline" className="text-xs">Auto</Badge>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Method 1:</strong> Select preset network from dropdown (Ethereum, BSC, Polygon...)</p>
                  <p><strong>Method 2:</strong> Enter custom RPC URL - app will auto-connect and detect network</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 text-xs">Connection successful when you see green badge with network name</span>
                  </div>
                </div>
              </div>

              {/* Step 2: Wallet Connection */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-purple-600" />
                  <span>Step 2: Connect Wallet</span>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Private Key:</strong> Enter private key (can hide/show), balance will auto-update</p>
                  <p><strong>Web3 Wallet:</strong> Click "Connect Wallet" to connect MetaMask, OKX, etc.</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700 text-xs">Private keys are only stored locally, never transmitted</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Load Contract */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Code className="w-4 h-4 text-green-600" />
                  <span>Step 3: Load Smart Contract</span>
                  <Badge variant="outline" className="text-xs">Auto</Badge>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Auto:</strong> Enter contract address and ABI - contract will auto-load</p>
                  <p><strong>Load ABI:</strong> Paste JSON, upload .json file, or "Load from Explorer" (demo)</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 text-xs">Contract loaded when you see number of read/write methods</span>
                  </div>
                </div>
              </div>

              {/* Step 4: Execute Methods */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Send className="w-4 h-4 text-orange-600" />
                  <span>Step 4: Execute Methods</span>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-3">
                  <div>
                    <p className="font-medium text-blue-700">READ Methods (View/Pure):</p>
                    <p>• Select method from dropdown → Enter parameters → "Call Method" → Instant results</p>
                  </div>
                  <div>
                    <p className="font-medium text-orange-700">WRITE Methods (Nonpayable/Payable):</p>
                    <p>• Select method → Enter parameters → Set ETH value/Gas → "Estimate Gas" or "Call Method"</p>
                  </div>
                </div>
              </div>

              {/* Step 5: Activity Tracking */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <ScrollText className="w-4 h-4 text-teal-600" />
                  <span>Step 5: Track Activity</span>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Activity Logs:</strong> All activities recorded with detailed timestamps</p>
                  <p><strong>Raw Data:</strong> View raw data for debugging</p>
                  <p><strong>Clear Logs:</strong> Clear all logs when needed</p>
                </div>
              </div>

              {/* Step 6: Preset Management */}
              <div className="mb-6">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-600" />
                  <span>Step 6: Manage Presets</span>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-2">
                  <p><strong>Save:</strong> "Save as Preset" to save current configuration (RPC, contract, wallet...)</p>
                  <p><strong>Load:</strong> Click saved preset to instantly restore configuration</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tips and Troubleshooting */}
            <div>
              <h3 className="text-lg font-semibold mb-4">💡 Tips & Troubleshooting</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">✅ Best Practices</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Always verify contract address before interacting</li>
                    <li>• Use "Estimate Gas" before sending transactions</li>
                    <li>• Check Activity Logs for debugging</li>
                    <li>• Save presets for frequently used contracts</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Troubleshooting</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Connection error: Check RPC URL</li>
                    <li>• ABI error: Ensure proper JSON format</li>
                    <li>• Gas error: Increase gas limit or gas price</li>
                    <li>• Parameter error: Check type and format</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            {/* Supported Features */}
            <div>
              <h3 className="text-lg font-semibold mb-4">🔧 Supported Features</h3>
              
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
