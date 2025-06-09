
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Settings, Trash2, Edit, Save, Upload } from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  rpcUrl: string;
  contractAddress: string;
  abi: string;
  walletAddress: string;
  gasLimit: string;
  gasPrice: string;
  createdAt: string;
}

interface PresetManagementProps {
  onLoadPreset: (preset: Preset) => void;
  currentData: {
    rpcUrl: string;
    contractAddress: string;
    abi: string;
    walletAddress: string;
    gasLimit: string;
    gasPrice: string;
  };
}

const PresetManagement: React.FC<PresetManagementProps> = ({ onLoadPreset, currentData }) => {
  const { toast } = useToast();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [newPresetName, setNewPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState<Preset | null>(null);
  const [editName, setEditName] = useState('');
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isOverwriteDialogOpen, setIsOverwriteDialogOpen] = useState(false);
  const [overwritePresetName, setOverwritePresetName] = useState('');

  // Load presets from localStorage on component mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('smartContractPresets');
    if (savedPresets) {
      try {
        setPresets(JSON.parse(savedPresets));
      } catch (error) {
        console.error('Error loading presets:', error);
      }
    }
  }, []);

  // Save presets to localStorage whenever presets change
  useEffect(() => {
    localStorage.setItem('smartContractPresets', JSON.stringify(presets));
  }, [presets]);

  const savePreset = (name: string, overwrite: boolean = false) => {
    if (!name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên preset",
        variant: "destructive"
      });
      return;
    }

    const existingPreset = presets.find(p => p.name === name);
    
    if (existingPreset && !overwrite) {
      setOverwritePresetName(name);
      setIsOverwriteDialogOpen(true);
      return;
    }

    const newPreset: Preset = {
      id: existingPreset ? existingPreset.id : Date.now().toString(),
      name,
      rpcUrl: currentData.rpcUrl,
      contractAddress: currentData.contractAddress,
      abi: currentData.abi,
      walletAddress: currentData.walletAddress,
      gasLimit: currentData.gasLimit,
      gasPrice: currentData.gasPrice,
      createdAt: existingPreset ? existingPreset.createdAt : new Date().toISOString()
    };

    if (existingPreset) {
      setPresets(prev => prev.map(p => p.id === existingPreset.id ? newPreset : p));
      toast({
        title: "Preset đã được cập nhật",
        description: `"${name}" đã được cập nhật`
      });
    } else {
      setPresets(prev => [...prev, newPreset]);
      toast({
        title: "Preset đã được lưu",
        description: `"${name}" đã được lưu thành công`
      });
    }

    setNewPresetName('');
    setIsSaveDialogOpen(false);
    setIsOverwriteDialogOpen(false);
  };

  const loadPreset = () => {
    const preset = presets.find(p => p.id === selectedPresetId);
    if (preset) {
      onLoadPreset(preset);
      toast({
        title: "Preset đã được tải",
        description: `"${preset.name}" đã được áp dụng`
      });
    }
  };

  const deletePreset = (id: string) => {
    const preset = presets.find(p => p.id === id);
    setPresets(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Preset đã được xóa",
      description: preset ? `"${preset.name}" đã được xóa` : "Preset đã được xóa"
    });
  };

  const updatePresetName = (id: string, newName: string) => {
    if (!newName.trim()) return;
    
    setPresets(prev => prev.map(p => 
      p.id === id ? { ...p, name: newName } : p
    ));
    setEditingPreset(null);
    setEditName('');
    
    toast({
      title: "Tên preset đã được cập nhật",
      description: `Đã đổi tên thành "${newName}"`
    });
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Preset Selection */}
          <div className="flex-1">
            <Label htmlFor="preset-select" className="text-sm font-medium">Load Preset</Label>
            <Select value={selectedPresetId} onValueChange={setSelectedPresetId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Chọn preset để tải" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg z-50">
                {presets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Load Button */}
          <Button 
            onClick={loadPreset}
            disabled={!selectedPresetId}
            size="sm"
            className="mt-6"
          >
            <Upload className="w-4 h-4 mr-2" />
            Load Preset
          </Button>

          {/* Save As Preset */}
          <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="mt-6">
                <Save className="w-4 h-4 mr-2" />
                Save as Preset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lưu Preset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preset-name">Tên Preset</Label>
                  <Input
                    id="preset-name"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    placeholder="Nhập tên preset"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => savePreset(newPresetName)} className="flex-1">
                    Lưu
                  </Button>
                  <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Manage Presets */}
          <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="mt-6">
                <Settings className="w-4 h-4 mr-2" />
                Quản lý Preset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Quản lý Preset</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {presets.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Chưa có preset nào</p>
                ) : (
                  presets.map((preset) => (
                    <div key={preset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        {editingPreset?.id === preset.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1"
                            />
                            <Button size="sm" onClick={() => updatePresetName(preset.id, editName)}>
                              Lưu
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingPreset(null)}>
                              Hủy
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-medium">{preset.name}</h4>
                            <p className="text-xs text-gray-500">
                              {new Date(preset.createdAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {editingPreset?.id !== preset.id && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingPreset(preset);
                              setEditName(preset.name);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deletePreset(preset.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Overwrite Confirmation Dialog */}
        <Dialog open={isOverwriteDialogOpen} onOpenChange={setIsOverwriteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận ghi đè</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Preset "{overwritePresetName}" đã tồn tại. Bạn có muốn ghi đè không?</p>
              <div className="flex space-x-2">
                <Button onClick={() => savePreset(overwritePresetName, true)} className="flex-1">
                  Ghi đè
                </Button>
                <Button variant="outline" onClick={() => setIsOverwriteDialogOpen(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PresetManagement;
