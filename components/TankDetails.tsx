import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { ProgressStage, WaterTank } from '@/app/data/tanks';
import { getTankStageStatus, getApplicableStages } from '@/lib/tankUtils';

// Extended WaterTank interface for internal use
interface ExtendedWaterTank extends WaterTank {
  currentSubTankIndex?: number;
}

interface TankDetailsProps {
  tank: WaterTank | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStage: (stage: ProgressStage) => void;
  onConfirmUndo: () => void;
  stageToUndo: ProgressStage | null;
  confirmDialogOpen: boolean;
  onConfirmDialogClose: () => void;
  onChangeSubTank?: (index: number) => void;
}

const TankDetails: React.FC<TankDetailsProps> = ({
  tank,
  isOpen,
  onClose,
  onToggleStage,
  onConfirmUndo,
  stageToUndo,
  confirmDialogOpen,
  onConfirmDialogClose,
  onChangeSubTank
}) => {
  // Local state for selecting sub-tanks in grouped tanks
  const [activeSubTankIndex, setActiveSubTankIndex] = useState(0);

  // Handler for changing the active sub-tank
  const handleSubTankChange = (index: number) => {
    setActiveSubTankIndex(index);
    if (onChangeSubTank) {
      onChangeSubTank(index);
    }
  };

  if (!tank) return null;

  // Cast tank to extended type
  const extendedTank = tank as ExtendedWaterTank;

  // Get applicable stages for the currently selected tank/sub-tank
  const getStageClasses = (stageName: string) => {
    const result = getTankStageStatus({
      ...extendedTank,
      currentSubTankIndex: extendedTank.isGrouped ? activeSubTankIndex : undefined
    }, stageName);
    
    if (!result.applicable) return "text-gray-300 line-through";
    
    if (result.status === "Completed") {
      return "text-green-600 font-bold";
    } else if (result.status === "In Progress") {
      return "text-blue-600 font-bold";
    }
    return "text-gray-700";
  };

  // Get checkbox icon for each stage
  const getStageIcon = (stageName: string) => {
    const result = getTankStageStatus({
      ...extendedTank,
      currentSubTankIndex: extendedTank.isGrouped ? activeSubTankIndex : undefined
    }, stageName);
    
    if (!result.applicable) return null;
    
    if (result.status === "Completed") {
      return <Check className="h-5 w-5 text-green-600" />;
    } else if (result.status === "In Progress") {
      return (
        <div className="h-5 w-5 border-2 border-blue-600 rounded-sm"></div>
      );
    }
    return <div className="h-5 w-5 border-2 border-gray-300 rounded-sm"></div>;
  };

  // Get the active sub-tank if this is a grouped tank
  const getActiveSubTank = () => {
    if (extendedTank.isGrouped && extendedTank.subTanks && extendedTank.subTanks.length > 0) {
      return extendedTank.subTanks[activeSubTankIndex];
    }
    return null;
  };

  // Get the current tank name to display
  const getCurrentTankName = () => {
    const subTank = getActiveSubTank();
    if (subTank) {
      return `${extendedTank.name} - ${subTank.name}`;
    }
    return extendedTank.name;
  };

  // Get applicable stages based on tank type and ID
  const getFilteredStages = () => {
    const currentTank = extendedTank.isGrouped && extendedTank.subTanks && extendedTank.currentSubTankIndex !== undefined
      ? extendedTank.subTanks[extendedTank.currentSubTankIndex]
      : extendedTank;
    
    const tankToCheck = {
      ...currentTank,
      isSubTank: extendedTank.isGrouped ? true : false,
      parentId: extendedTank.isGrouped ? extendedTank.id : undefined
    };
    
    return getApplicableStages(tankToCheck);
  };

  // Get the applicable stages for the current tank
  const applicableStages = getFilteredStages();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{getCurrentTankName()}</DialogTitle>
            <DialogDescription className="text-center">
              {extendedTank.location}
            </DialogDescription>
          </DialogHeader>

          {/* Sub-tank selector for grouped tanks */}
          {extendedTank.isGrouped && extendedTank.subTanks && extendedTank.subTanks.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Sub-Tanks:</div>
              <div className="flex flex-wrap gap-2">
                {extendedTank.subTanks.map((subTank, index) => (
                  <Button
                    key={subTank.id}
                    variant={index === activeSubTankIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSubTankChange(index)}
                  >
                    {subTank.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {applicableStages.map((stage) => (
              <div
                key={stage}
                className={`flex items-center justify-between p-2 rounded hover:bg-gray-100 ${getStageClasses(stage)}`}
                onClick={() => onToggleStage(stage)}
              >
                <span>{stage}</span>
                {getStageIcon(stage)}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Undoing Tasks */}
      <Dialog open={confirmDialogOpen} onOpenChange={onConfirmDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Undo</DialogTitle>
            <DialogDescription>
              Are you sure you want to undo the completion of "{stageToUndo}"? This will also reset all subsequent stages.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onConfirmDialogClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirmUndo}>
              Undo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TankDetails; 