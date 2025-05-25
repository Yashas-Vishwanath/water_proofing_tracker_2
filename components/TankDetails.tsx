import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { ProgressStage, ProgressStatus, WaterTank } from '@/app/data/tanks';
import { getTankStageStatus, getApplicableStages } from '@/lib/tankUtils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

// Extended WaterTank interface for internal use
interface ExtendedWaterTank extends WaterTank {
  currentSubTankIndex?: number;
  isSubTank?: boolean;
  parentId?: string;
}

interface TankDetailsProps {
  tank: ExtendedWaterTank | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStage: (stage: ProgressStage) => void;
  onConfirmUndo: () => void;
  stageToUndo: ProgressStage | null;
  confirmDialogOpen: boolean;
  onConfirmDialogClose: () => void;
}

const TankDetails: React.FC<TankDetailsProps> = ({
  tank,
  isOpen,
  onClose,
  onToggleStage,
  onConfirmUndo,
  stageToUndo,
  confirmDialogOpen,
  onConfirmDialogClose
}) => {
  const [activeSubTankIndex, setActiveSubTankIndex] = useState(0);
  
  // Update the active sub-tank index when the tank changes
  useEffect(() => {
    if (tank && tank.currentSubTankIndex !== undefined) {
      setActiveSubTankIndex(tank.currentSubTankIndex);
    } else {
      setActiveSubTankIndex(0);
    }
  }, [tank]);
  
  // Function to switch between sub-tanks
  const switchToSubTank = (index: number) => {
    setActiveSubTankIndex(index);
  };
  
  // Only show applicable stages for the tank type
  const getStagesForDisplay = () => {
    if (!tank) return [];
    
    let tankToCheck: any = { ...tank };
    
    // If we're dealing with a sub-tank, get its applicable stages
    if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
      const subTank = tank.subTanks[activeSubTankIndex];
      if (subTank) {
        // We need to pass the parent ID to get correct applicable stages
        tankToCheck = {
          ...subTank,
          isSubTank: true,
          parentId: tank.id,
          type: tank.type,
          index: activeSubTankIndex // Pass the index to help identify which sub-tank this is
        };
      }
    }
    
    // Get applicable stages for this tank
    return getApplicableStages(tankToCheck);
  };
  
  // Get the status of a specific stage
  const getStageStatus = (stage: ProgressStage): ProgressStatus => {
    if (!tank) return "Not Started";
    
    // Handle sub-tanks
    if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
      const subTank = tank.subTanks[activeSubTankIndex];
      if (subTank) {
        const stageProgress = subTank.progress.find(p => p.stage === stage);
        return stageProgress ? stageProgress.status : "Not Started";
      }
    }
    
    // Handle regular tanks
    const stageProgress = tank.progress.find(p => p.stage === stage);
    return stageProgress ? stageProgress.status : "Not Started";
  };
  
  // Get class name for stage item based on its status
  const getStageClassName = (stage: ProgressStage) => {
    const status = getStageStatus(stage);
    
    if (status === "Completed") {
      return "text-green-600 flex items-center";
    } else if (status === "In Progress") {
      return "text-amber-500 flex items-center";
    }
    return "text-gray-600 flex items-center";
  };
  
  // Function to display check mark if stage is completed
  const getStageIcon = (stage: ProgressStage) => {
    const status = getStageStatus(stage);
    
    if (status === "Completed") {
      return <Check className="h-4 w-4 ml-2" />;
    }
    return null;
  };

  if (!tank) return null;

  // Get applicable stages
  const applicableStages = getStagesForDisplay();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {tank.type || "WATER TANKS"} | {tank.name || tank.id}
              {tank.location && <div className="text-sm font-normal mt-1">{tank.location}</div>}
            </DialogTitle>
          </DialogHeader>
          
          {/* Sub-Tanks section - only shown for grouped tanks */}
          {tank.isGrouped && tank.subTanks && tank.subTanks.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Sub-Tanks:</div>
              <div className="flex flex-wrap gap-2">
                {tank.subTanks.map((subTank, index) => (
                  <Button
                    key={subTank.id}
                    variant={index === activeSubTankIndex ? "default" : "outline"}
                    size="sm"
                    className={index === activeSubTankIndex ? "bg-black text-white" : ""}
                    onClick={() => switchToSubTank(index)}
                  >
                    {subTank.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {applicableStages.map((stage) => (
              <div 
                key={stage} 
                className="flex justify-between items-center py-2 cursor-pointer hover:bg-gray-50"
                onClick={() => onToggleStage(stage)}
              >
                <div className={getStageClassName(stage)}>
                  {stage}
                  {getStageIcon(stage)}
                </div>
                <input 
                  type="checkbox" 
                  checked={getStageStatus(stage) === "Completed"} 
                  onChange={() => onToggleStage(stage)}
                  className="h-5 w-5 text-black rounded border-gray-300 focus:ring-black"
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for undoing tasks */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={onConfirmDialogClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Undo Task Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to undo completion of "{stageToUndo}"? This will reset progress for this stage and all subsequent stages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmUndo}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TankDetails; 