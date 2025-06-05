
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Upload, Download, Edit, Trash2, Plus } from 'lucide-react';

interface ConnectionState {
  rpcUrl: string;
  chainId: number | null;
  isConnected: boolean;
  networkName: string;
}

interface ContractState {
  address: string;
  abi: any[];
  isLoaded: boolean;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  rpcUrl: string;
  contractAddress: string;
  abi: any[];
  createdAt: string;
}

interface PresetManagerProps {
  presets: Preset[];
  onPresetsChange: (presets: Preset[]) => void;
  connection: ConnectionState;
  contract: ContractState;
}

const PresetManager: React.FC<PresetManagerProps> = ({
  presets,
  onPresetsChange,
  connection,
  contract
}) => {
  const { toast } = useToast();
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);

  // Sample presets for demo
  const samplePresets: Preset[] = [
    {
      id: '1',
      name: 'BSC USDT Contract',
      description: 'USDT token trên Binance Smart Chain',
      rpcUrl: 'https://bsc-dataseed1.binance.org/',
      contractAddress: '0x55d398326f99059fF775485246999027B3197955',
      abi: [],
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'Polygon MATIC',
      description: 'Native MATIC token trên Polygon',
      rpcUrl: 'https://polygon-rpc.com/',
      contractAddress: '0x0000000000000000000000000000000000001010',
      abi: [],
      createdAt: '2024-01-14T15:45:00Z'
    }
  ];

  const createPreset = () => {
    if (!newPresetName || !connection.rpcUrl || !contract.address) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên preset và đảm bảo có kết nối RPC + contract",
        variant: "destructive"
      });
      return;
    }

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName,
      description: newPresetDescription,
      rpcUrl: connection.rpcUrl,
      contractAddress: contract.address,
      abi: contract.abi,
      createdAt: new Date().toISOString()
    };

    const updatedPresets = [...presets, newPreset];
    onPresetsChange(updatedPresets);

    // Reset form
    setNewPresetName('');
    setNewPresetDescription('');
    setIsCreateModalOpen(false);

    toast({
      title: "Preset đã được tạo",
      description: `"${newPreset.name}" đã được lưu`,
    });
  };

  const deletePreset = (presetId: string) => {
    const updatedPresets = presets.filter(preset => preset.id !== presetId);
    onPresetsChange(updatedPresets);

    toast({
      title: "Preset đã được xóa",
      description: "Preset đã được xóa khỏi danh sách",
    });
  };

  const loadPreset = (preset: Preset) => {
    // This would trigger loading the preset configuration
    toast({
      title: "Preset đã được tải",
      description: `Đang áp dụng cấu hình "${preset.name}"`,
    });
  };

  const exportPresets = () => {
    const dataStr = JSON.stringify(presets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'smart_contract_presets.json';
    link.click();
    
    URL.revokeObjectURL(url);

    toast({
      title: "Xuất preset thành công",
      description: "File JSON đã được tải xuống",
    });
  };

  const importPresets = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedPresets = JSON.parse(e.target?.result as string);
          onPresetsChange([...presets, ...importedPresets]);
          
          toast({
            title: "Nhập preset thành công",
            description: `Đã nhập ${importedPresets.length} preset`,
          });
        } catch (error) {
          toast({
            title: "Lỗi",
            description: "File preset không hợp lệ",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
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

  // Use sample presets if no presets exist
  const displayPresets = presets.length > 0 ? presets : samplePresets;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <span>Quản lý Preset</span>
            </CardTitle>
            
            <div className="flex space-x-2">
              {/* Create Preset */}
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo mới
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo Preset mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="preset-name">Tên Preset</Label>
                      <Input
                        id="preset-name"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        placeholder="VD: BSC USDT Contract"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="preset-description">Mô tả (tùy chọn)</Label>
                      <Input
                        id="preset-description"
                        value={newPresetDescription}
                        onChange={(e) => setNewPresetDescription(e.target.value)}
                        placeholder="VD: USDT token trên Binance Smart Chain"
                      />
                    </div>

                    {/* Current Configuration Preview */}
                    <div className="p-3 bg-gray-50 border rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Cấu hình hiện tại:</h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>RPC: {connection.rpcUrl || 'Chưa kết nối'}</div>
                        <div>Network: {connection.networkName || 'N/A'}</div>
                        <div>Contract: {contract.address || 'Chưa tải'}</div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        onClick={createPreset}
                        disabled={!newPresetName || !connection.rpcUrl || !contract.address}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Lưu Preset
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateModalOpen(false)}
                      >
                        Hủy
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Export/Import */}
              <Button variant="outline" size="sm" onClick={exportPresets}>
                <Download className="w-4 h-4 mr-2" />
                Xuất
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importPresets}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Nhập
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Presets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayPresets.map((preset) => (
          <Card key={preset.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{preset.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                </div>
                
                <div className="flex space-x-1 ml-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deletePreset(preset.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Configuration Info */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">RPC:</span>
                  <span className="font-mono text-right">{preset.rpcUrl.slice(0, 30)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contract:</span>
                  <span className="font-mono text-right">{preset.contractAddress.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tạo lúc:</span>
                  <span>{formatDate(preset.createdAt)}</span>
                </div>
              </div>

              {/* Load Button */}
              <Button 
                onClick={() => loadPreset(preset)}
                className="w-full"
                size="sm"
              >
                Tải Preset
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {displayPresets.length === 0 && (
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có Preset nào</h3>
            <p className="text-gray-500 mb-4">Tạo preset để lưu cấu hình kết nối và contract</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo Preset đầu tiên
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PresetManager;
