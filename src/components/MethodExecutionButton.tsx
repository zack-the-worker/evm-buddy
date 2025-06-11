
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ChevronDown, Send, Calculator, Loader2, RefreshCw } from 'lucide-react';

interface MethodExecutionButtonProps {
  onExecute: () => void;
  onEstimateGas: () => void;
  onContinuousExecute: () => void;
  isExecuting: boolean;
  isEstimatingGas: boolean;
  isContinuousExecuting: boolean;
  disabled: boolean;
  isWriteMethod?: boolean;
  hasPrivateKey: boolean;
}

const MethodExecutionButton: React.FC<MethodExecutionButtonProps> = ({
  onExecute,
  onEstimateGas,
  onContinuousExecute,
  isExecuting,
  isEstimatingGas,
  isContinuousExecuting,
  disabled,
  isWriteMethod = false,
  hasPrivateKey
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isAnyOperationRunning = isExecuting || isEstimatingGas || isContinuousExecuting;

  return (
    <div className="flex items-stretch">
      {/* Main button */}
      <Button 
        onClick={onExecute}
        disabled={disabled || isAnyOperationRunning}
        className={`flex-1 rounded-r-none border-r-0 h-10 ${isWriteMethod ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
      >
        {isExecuting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Executing...
          </>
        ) : isContinuousExecuting ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Running...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Execute
          </>
        )}
      </Button>

      {/* Dropdown button */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            className={`px-3 rounded-l-none h-10 min-w-[40px] flex items-center justify-center ${isWriteMethod ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
            disabled={disabled || isAnyOperationRunning}
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
            disabled={isAnyOperationRunning}
          >
            <Send className="w-4 h-4 mr-2" />
            Execute
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => {
              onEstimateGas();
              setIsOpen(false);
            }}
            disabled={isAnyOperationRunning}
          >
            {isEstimatingGas ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4 mr-2" />
            )}
            Estimate Gas
          </DropdownMenuItem>
          {isWriteMethod && hasPrivateKey && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  onContinuousExecute();
                  setIsOpen(false);
                }}
                disabled={isAnyOperationRunning}
              >
                {isContinuousExecuting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Execute When Ready
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MethodExecutionButton;
