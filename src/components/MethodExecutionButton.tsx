
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Send, Calculator, Loader2 } from 'lucide-react';

interface MethodExecutionButtonProps {
  onExecute: () => void;
  onEstimateGas: () => void;
  isExecuting: boolean;
  isEstimatingGas: boolean;
  disabled: boolean;
}

const MethodExecutionButton: React.FC<MethodExecutionButtonProps> = ({
  onExecute,
  onEstimateGas,
  isExecuting,
  isEstimatingGas,
  disabled
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex">
      {/* Main button */}
      <Button 
        onClick={onExecute}
        disabled={disabled || isExecuting || isEstimatingGas}
        className="flex-1 rounded-r-none border-r-0"
      >
        {isExecuting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Đang thực hiện...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Gọi Method
          </>
        )}
      </Button>

      {/* Dropdown button */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            size="sm" 
            className="px-2 rounded-l-none"
            disabled={disabled || isExecuting || isEstimatingGas}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50">
          <DropdownMenuItem 
            onClick={() => {
              onExecute();
              setIsOpen(false);
            }}
            disabled={isExecuting || isEstimatingGas}
          >
            <Send className="w-4 h-4 mr-2" />
            Gọi Method
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              onEstimateGas();
              setIsOpen(false);
            }}
            disabled={isExecuting || isEstimatingGas}
          >
            {isEstimatingGas ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4 mr-2" />
            )}
            Estimate Gas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MethodExecutionButton;
