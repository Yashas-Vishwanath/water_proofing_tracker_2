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
import { getTankStageStatus } from '@/lib/tankUtils';

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

  // Get applicable stages for the currently selected tank/sub-tank
  const getStageClasses = (stageName: string) => {
    const result = getTankStageStatus({
      ...tank,
      currentSubTankIndex: tank.isGrouped ? activeSubTankIndex : undefined
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
      ...tank,
      currentSubTankIndex: tank.isGrouped ? activeSubTankIndex : undefined
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
    if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
      return tank.subTanks[activeSubTankIndex];
    }
    return null;
  };

  // Get the current tank name to display
  const getCurrentTankName = () => {
    const subTank = getActiveSubTank();
    if (subTank) {
      return `${tank.name} - ${subTank.name}`;
    }
    return tank.name;
  };

  // All stages for rendering (not filtered)
  const allStages: ProgressStage[] = [
    "Formwork Removal",
    "Repair and Cleaning",
    "Pump Anchors",
    "Slope",
    "Dwall anchorage removal",
    "Dwall anchorage waterproofing",
    "Grout openings in wall",
    "Inspection Stage 1",
    "Waterproofing",
    "Inspection Stage 2",
    "Inspection Stage 3",
  ] as ProgressStage[];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">{getCurrentTankName()}</DialogTitle>
            <DialogDescription className="text-center">
              {tank.location}
            </DialogDescription>
          </DialogHeader>

          {/* Sub-tank selector for grouped tanks */}
          {tank.isGrouped && tank.subTanks && tank.subTanks.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Sub-Tanks:</div>
              <div className="flex flex-wrap gap-2">
                {tank.subTanks.map((subTank, index) => (
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
            {allStages.map((stage) => (
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