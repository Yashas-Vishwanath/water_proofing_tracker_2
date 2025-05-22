"use client"

import { ChevronDown, FileSpreadsheet, Check, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { useState, useEffect } from "react"
import { 
  ProgressStage,
  ProgressStatus,
  StageProgress,
  TankType,
  WaterTank,
  allProgressStages,
  n00Tanks,
  n10Tanks,
  n20Tanks
} from "./data/tanks"

// Add this type declaration for the global XLSX object
declare global {
  interface Window {
    XLSX: any
  }
}

// Add this interface extension to WaterTank to include currentSubTankIndex
interface ExtendedWaterTank extends WaterTank {
  currentSubTankIndex?: number;
}

export default function ConstructionTracker() {
  // State for active section and tank
  const [activeSection, setActiveSection] = useState<string | null>("N00")
  const [selectedTank, setSelectedTank] = useState<ExtendedWaterTank | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isWaterTanksOpen, setIsWaterTanksOpen] = useState(false)
  const [isMechanicalPitsOpen, setIsMechanicalPitsOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [stageToUndo, setStageToUndo] = useState<ProgressStage | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)

  // State for tanks data
  const [n00TanksData, setN00TanksData] = useState<Record<string, WaterTank>>(n00Tanks)
  const [n10TanksData, setN10TanksData] = useState<Record<string, WaterTank>>(n10Tanks)
  const [n20TanksData, setN20TanksData] = useState<Record<string, WaterTank>>(n20Tanks)

  // Add a new state for the inspection dialog
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false)

  // Add a new state for the spreadsheet dialog
  const [isSpreadsheetDialogOpen, setIsSpreadsheetDialogOpen] = useState(false)

  // Image dimensions
  const targetWidth = 1280;
  const targetHeight = 900;
  
  // Since we're now using images that are already correctly sized (1280x900),
  // we don't need to scale coordinates anymore
  const getScaledPosition = (top: number, left: number, level: string) => {
    // Return the positions directly without scaling
    return {
      top: top,
      left: left
    };
  };

  // Load tank data from the API when the component mounts
  useEffect(() => {
    async function fetchTasksData() {
      try {
        setLoading(true);
        console.log("Fetching tank data...");
        const response = await fetch('/api/tasks');
        
        if (response.ok) {
          const data = await response.json();
          console.log("Tank data fetched successfully:", data);
          
          // Update state with data from API
          if (data.n00Tanks && Object.keys(data.n00Tanks).length > 0) {
            setN00TanksData(data.n00Tanks);
          }
          if (data.n10Tanks && Object.keys(data.n10Tanks).length > 0) {
            setN10TanksData(data.n10Tanks);
          }
          if (data.n20Tanks && Object.keys(data.n20Tanks).length > 0) {
            setN20TanksData(data.n20Tanks);
          }
        } else {
          console.log("API returned non-OK status, initializing with default data");
          // If API fails, initialize with default data and save it to the API
          setInitializing(true);
          await saveTanksData();
          setInitializing(false);
        }
      } catch (error) {
        console.error("Error fetching tasks data:", error);
        // On error, initialize with default data and save it to the API
        setInitializing(true);
        await saveTanksData();
        setInitializing(false);
      } finally {
        setLoading(false);
      }
    }

    fetchTasksData();
  }, []);

  // Function to save all tanks data to the API
  const saveTanksData = async () => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          n00Tanks,
          n10Tanks,
          n20Tanks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save tanks data');
      }

      // Set the state with the initial data
      setN00TanksData(n00Tanks);
      setN10TanksData(n10Tanks);
      setN20TanksData(n20Tanks);
    } catch (error) {
      console.error('Error saving tanks data:', error);
    }
  };

  // Function to get tank color based on status
  const getTankColor = (tank: WaterTank) => {
    // Check if all tasks are completed
    const allCompleted = tank.progress.every((p) => p.status === "Completed")
    if (allCompleted) {
      return "bg-green-600" // Green for completed tanks
    }

    // Check if in inspection stage
    const isInspection = tank.currentStage === "Inspection Stage 1" || 
                         tank.currentStage === "Inspection Stage 2" || 
                         tank.currentStage === "Inspection Stage 3"
    if (isInspection) {
      return "bg-purple-600" // Purple for inspection stages
    }

    // Default is red for ongoing operations
    return "bg-red-600"
  }

  // Function to handle exporting to spreadsheet
  const handleExportToSpreadsheet = () => {
    setIsSpreadsheetDialogOpen(true)
  }

  // Replace the downloadSpreadsheet function with this browser-compatible implementation
  const downloadSpreadsheet = () => {
    // Get current date for title
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    // Get all tanks data using our getAllTanks helper
    const allTanks = getAllTanks();

    // Since we're having issues with the Excel library, let's use a more reliable approach
    // We'll create an HTML table and open it in a new window for printing/saving
    let tableHtml = `
    <html>
    <head>
      <title>Water Tanks Progress - ${formattedDate}</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; position: sticky; top: 0; z-index: 10; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .completed { background-color: #d4edda; }
        .in-progress { background-color: #fff3cd; }
        .not-applicable { color: #aaa; font-style: italic; }
        .export-bar { 
          position: fixed; 
          top: 0; 
          left: 0; 
          right: 0; 
          background: #333; 
          color: white; 
          padding: 10px; 
          text-align: center;
          z-index: 20;
        }
        .export-bar button {
          background: #4CAF50;
          border: none;
          color: white;
          padding: 8px 16px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 14px;
          margin: 4px 2px;
          cursor: pointer;
          border-radius: 4px;
        }
        .table-container {
          overflow: auto;
          max-height: 85vh;
          margin-top: 50px;
        }
        @media print {
          .export-bar { display: none; }
          .table-container { margin-top: 0; max-height: none; overflow: visible; }
        }
      </style>
    </head>
    <body>
      <div class="export-bar">
        <button onclick="window.print()">Print</button>
        <button onclick="window.close()">Close</button>
      </div>
      <h1>Water Tanks Progress Report - ${formattedDate}</h1>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Level</th>
              <th>Type of Tank</th>
              <th>Parent Tank</th>
              <th>ID</th>
              <th>Formwork Removal</th>
              <th>Repair and Cleaning</th>
              <th>Pump Anchors</th>
              <th>Slope</th>
              <th>Dwall anchorage removal</th>
              <th>Dwall anchorage waterproofing</th>
              <th>Grout openings in wall</th>
              <th>Inspection Stage 1</th>
              <th>Waterproofing</th>
              <th>Waterproofing of walls</th>
              <th>Inspection Stage 2</th>
              <th>Waterproofing of floor</th>
              <th>Inspection Stage 3</th>
            </tr>
          </thead>
          <tbody>
    `

    // Add a row for each tank
    allTanks.forEach((tank: any) => {
      const tankId = tank.id;
      const parentInfo = tank.isSubTank ? tank.parentName : "-";
      
      // Get all stage statuses
      const formwork = getTankStageStatus(tank, "Formwork Removal");
      const repair = getTankStageStatus(tank, "Repair and Cleaning");
      const pump = getTankStageStatus(tank, "Pump Anchors");
      const slope = getTankStageStatus(tank, "Slope");
      const dwallRemoval = getTankStageStatus(tank, "Dwall anchorage removal");
      const dwallWaterproofing = getTankStageStatus(tank, "Dwall anchorage waterproofing");
      const groutOpenings = getTankStageStatus(tank, "Grout openings in wall");
      const inspection1 = getTankStageStatus(tank, "Inspection Stage 1");
      const waterproofing = getTankStageStatus(tank, "Waterproofing");
      const waterproofingWalls = getTankStageStatus(tank, "Waterproofing of walls");
      const inspection2 = getTankStageStatus(tank, "Inspection Stage 2");
      const waterproofingFloor = getTankStageStatus(tank, "Waterproofing of floor");
      const inspection3 = getTankStageStatus(tank, "Inspection Stage 3");
      
      // Helper function to get cell styling based on status
      const getCellClass = (result: { status: string, applicable: boolean }) => {
        if (!result.applicable) return "class='not-applicable'";
        if (result.status === "Completed") return "class='completed'";
        if (result.status === "In Progress") return "class='in-progress'";
        return "";
      };
      
      tableHtml += `
        <tr>
          <td>${tank.level}</td>
          <td>${tank.type}</td>
          <td>${parentInfo}</td>
          <td>${tankId}</td>
          <td ${getCellClass(formwork)}>${formwork.status}</td>
          <td ${getCellClass(repair)}>${repair.status}</td>
          <td ${getCellClass(pump)}>${pump.status}</td>
          <td ${getCellClass(slope)}>${slope.status}</td>
          <td ${getCellClass(dwallRemoval)}>${dwallRemoval.status}</td>
          <td ${getCellClass(dwallWaterproofing)}>${dwallWaterproofing.status}</td>
          <td ${getCellClass(groutOpenings)}>${groutOpenings.status}</td>
          <td ${getCellClass(inspection1)}>${inspection1.status}</td>
          <td ${getCellClass(waterproofing)}>${waterproofing.status}</td>
          <td ${getCellClass(waterproofingWalls)}>${waterproofingWalls.status}</td>
          <td ${getCellClass(inspection2)}>${inspection2.status}</td>
          <td ${getCellClass(waterproofingFloor)}>${waterproofingFloor.status}</td>
          <td ${getCellClass(inspection3)}>${inspection3.status}</td>
        </tr>
      `
    })

    tableHtml += `
        </tbody>
      </table>
    </div>
    </body>
    </html>
  `

    // Open the HTML table in a new window
    const newWindow = window.open("", "_blank")
    if (newWindow) {
      newWindow.document.write(tableHtml)
      newWindow.document.close()
    } else {
      alert("Please allow pop-ups to view the spreadsheet")
    }
  }

  // Get all tanks including sub-tanks with proper parent references
  const getAllTanks = (): any[] => {
    const tanks: any[] = [];
    
    // Process a level's tanks and add them to the result array
    const processTanks = (levelTanks: Record<string, any>, level: string) => {
      Object.values(levelTanks).forEach(tank => {
        // For tanks with sub-tanks
        if (tank.isGrouped && tank.subTanks) {
          // Add the parent tank first
          tanks.push({ ...tank, level });
          
          // Then add each sub-tank as a separate entry with parent reference
          tank.subTanks.forEach((subTank: any) => {
            tanks.push({
              ...subTank,
              parentId: tank.id,
              parentName: tank.name || tank.id,
              level,
              isSubTank: true,
              type: tank.type
            });
          });
        } else {
          // Normal tank, just add it
          tanks.push({ ...tank, level });
        }
      });
    };
    
    // Process all levels using the CURRENT state data
    processTanks(n00TanksData, "N00");
    processTanks(n10TanksData, "N10");
    processTanks(n20TanksData, "N20");
    
    return tanks;
  };
  
  // Helper function to get stages that are applicable for a given tank type
  const getApplicableStages = (tank: any): ProgressStage[] => {
    // Special case for EB16-STE-089 tanks
    if (tank.id === "EB16-STE-089" || (tank.isSubTank && tank.parentId === "EB16-STE-089")) {
      // For LARGE TANK-01, include all special stages
      if (tank.isSubTank && tank.id === "EB16-STE-089-TANK-01") {
        return [
          "Formwork Removal",
          "Repair and Cleaning",
          "Dwall anchorage removal",
          "Dwall anchorage waterproofing",
          "Grout openings in wall",
          "Inspection Stage 1",
          "Waterproofing of walls",
          "Inspection Stage 2",
          "Waterproofing of floor",
          "Inspection Stage 3"
        ] as ProgressStage[];
      }
      
      // For other EB16-STE-089 tanks (parent tank and other sub-tanks)
      return [
        "Formwork Removal",
        "Repair and Cleaning",
        "Inspection Stage 1",
        "Waterproofing of walls", 
        "Inspection Stage 2",
        "Waterproofing of floor",
        "Inspection Stage 3"
      ] as ProgressStage[];
    }
    
    // Special case for EB1-EXTERIOR tanks and its sub-tanks
    if (tank.id === "EB1-EXTERIOR" || (tank.isSubTank && tank.parentId === "EB1-EXTERIOR")) {
      return [
        "Formwork Removal",
        "Repair and Cleaning",
        "Pump Anchors",
        "Slope",
        "Inspection Stage 1",
        "Waterproofing",
        "Inspection Stage 2"
      ] as ProgressStage[];
    }
    
    // For all other regular tanks
    return [
      "Formwork Removal",
      "Repair and Cleaning",
      "Pump Anchors",
      "Slope",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
  };

  // Helper function to get stage status for a tank (handle both regular and custom stage configurations)
  const getTankStageStatus = (tank: any, stageName: string) => {
    // Check if this stage is applicable for this tank type
    const applicableStages = getApplicableStages(tank);
    const isApplicable = applicableStages.includes(stageName as ProgressStage);
    
    if (!isApplicable) {
      return {
        status: "N/A",
        applicable: false
      };
    }
    
    // Check if tank has this stage in its progress array
    const stageProgress = tank.progress.find((p: any) => p.stage === stageName);
    
    // If stage exists in progress, return its status
    if (stageProgress) {
      return {
        status: stageProgress.status,
        applicable: true
      };
    }
    
    // If the stage is applicable but not in progress, return Not Started
    return {
      status: "Not Started",
      applicable: true
    };
  };

  // Add these helper functions for the CSV fallback
  const generateCsvContent = () => {
    const allTanks: any[] = getAllTanks();

    let csvContent =
      "Level,Type of Tank,Parent Tank,ID,Formwork Removal,Repair and Cleaning,Pump Anchors,Slope,Dwall anchorage removal,Dwall anchorage waterproofing,Grout openings in wall,Inspection Stage 1,Waterproofing,Waterproofing of walls,Inspection Stage 2,Waterproofing of floor,Inspection Stage 3\n"

    allTanks.forEach((tank: any) => {
      const tankId = tank.id;
      const parentInfo = tank.isSubTank ? tank.parentName : "-";
      
      // Get status for each stage (or N/A if not applicable for this tank type)
      const formwork = getTankStageStatus(tank, "Formwork Removal");
      const repair = getTankStageStatus(tank, "Repair and Cleaning");
      const pump = getTankStageStatus(tank, "Pump Anchors");
      const slope = getTankStageStatus(tank, "Slope");
      const dwallRemoval = getTankStageStatus(tank, "Dwall anchorage removal");
      const dwallWaterproofing = getTankStageStatus(tank, "Dwall anchorage waterproofing");
      const groutOpenings = getTankStageStatus(tank, "Grout openings in wall");
      const inspection1 = getTankStageStatus(tank, "Inspection Stage 1");
      const waterproofing = getTankStageStatus(tank, "Waterproofing");
      const waterproofingWalls = getTankStageStatus(tank, "Waterproofing of walls");
      const inspection2 = getTankStageStatus(tank, "Inspection Stage 2");
      const waterproofingFloor = getTankStageStatus(tank, "Waterproofing of floor");
      const inspection3 = getTankStageStatus(tank, "Inspection Stage 3");

      csvContent += `${tank.level},${tank.type},${parentInfo},${tankId},${formwork.status},${repair.status},${pump.status},${slope.status},${dwallRemoval.status},${dwallWaterproofing.status},${groutOpenings.status},${inspection1.status},${waterproofing.status},${waterproofingWalls.status},${inspection2.status},${waterproofingFloor.status},${inspection3.status}\n`
    });

    return csvContent;
  }
  
  const downloadCsvFile = (csvContent: string) => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `WaterTankTracker-${formattedDate}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Update the handleReadyForInspection function to open the dialog
  const handleReadyForInspection = () => {
    setIsInspectionDialogOpen(true)
  }

  // Function to get tanks ready for inspection
  const getTanksReadyForInspection = () => {
    // Helper function to check if all stages are completed
    const isFullyCompleted = (tank: WaterTank) => {
      return tank.progress.every(p => p.status === "Completed");
    };

    const n00Ready = Object.values(n00TanksData).filter(
      (tank) => (tank.currentStage === "Inspection Stage 1" || 
                tank.currentStage === "Inspection Stage 2" || 
                tank.currentStage === "Inspection Stage 3") && 
                !isFullyCompleted(tank)
    );

    const n10Ready = Object.values(n10TanksData).filter(
      (tank) => (tank.currentStage === "Inspection Stage 1" || 
                tank.currentStage === "Inspection Stage 2" || 
                tank.currentStage === "Inspection Stage 3") && 
                !isFullyCompleted(tank)
    );

    const n20Ready = Object.values(n20TanksData).filter(
      (tank) => (tank.currentStage === "Inspection Stage 1" || 
                tank.currentStage === "Inspection Stage 2" || 
                tank.currentStage === "Inspection Stage 3") && 
                !isFullyCompleted(tank)
    );
    
    return {
      n00: n00Ready,
      n10: n10Ready,
      n20: n20Ready,
      n30: [], // No tanks in N30 yet
    }
  };

  // Function to handle tank click
  const handleTankClick = (tankId: string) => {
    let tank: WaterTank | undefined

    if (activeSection === "N00") {
      tank = n00TanksData[tankId]
    } else if (activeSection === "N10") {
      tank = n10TanksData[tankId]
    } else if (activeSection === "N20") {
      tank = n20TanksData[tankId]
    }

    if (tank) {
      setSelectedTank(tank)
      setIsDetailsOpen(true)
    }
  }

  // Function to toggle task completion
  const toggleTaskCompletion = (stage: ProgressStage) => {
    if (!selectedTank) return;
    
    // Check if the stage is already completed - if so, show confirmation dialog
    let isCompleted = false;
    
    if (selectedTank.currentSubTankIndex !== undefined && selectedTank.isGrouped && selectedTank.subTanks) {
      // For sub-tanks, check completion status in the sub-tank's progress
      const subTank = selectedTank.subTanks[selectedTank.currentSubTankIndex];
      if (subTank) {
        const stageProgress = subTank.progress.find(p => p.stage === stage);
        isCompleted = stageProgress?.status === "Completed";
      }
    } else {
      // For regular tanks, check in the tank's progress
      const stageProgress = selectedTank.progress.find(p => p.stage === stage);
      isCompleted = stageProgress?.status === "Completed";
    }
    
    // If stage is completed, show confirmation dialog for undo
    if (isCompleted) {
      setStageToUndo(stage);
      setConfirmDialogOpen(true);
      return;
    }
    
    // Otherwise proceed with marking as completed
    markTaskAsCompleted(stage);
  }

  // Function to mark a task as completed
  const markTaskAsCompleted = (stage: ProgressStage) => {
    if (!selectedTank) return;

    // Clone the selected tank to avoid modifying state directly
    const updatedTank = { ...selectedTank } as ExtendedWaterTank;
    
    // If we're dealing with a sub-tank
    if (selectedTank.currentSubTankIndex !== undefined && selectedTank.isGrouped && selectedTank.subTanks) {
      // Get a reference to the current sub-tank
      const subTank = selectedTank.subTanks[selectedTank.currentSubTankIndex];
      
      if (!subTank) return;
      
      // Clone the sub-tank and its progress array
      const updatedSubTank = { ...subTank };
      
      // Find the stage in the sub-tank's progress array
      const stageIndex = updatedSubTank.progress.findIndex(p => p.stage === stage);
      
      if (stageIndex !== -1) {
        // Create a copy of the progress array and update the status
        const updatedProgress = [...updatedSubTank.progress];
        updatedProgress[stageIndex] = { ...updatedProgress[stageIndex], status: "Completed" };
        
        // Determine the next stage
        const applicableStages = getApplicableStages({
          ...subTank, 
          isSubTank: true, 
          parentId: selectedTank.id
        });
        
        const currentStageIndex = applicableStages.indexOf(stage);
        const nextStageIndex = currentStageIndex + 1;
        
        // If there is a next stage, set it to "In Progress"
        if (nextStageIndex < applicableStages.length) {
          const nextStage = applicableStages[nextStageIndex];
          
          // Find the next stage in progress array
          const nextStageProgressIndex = updatedProgress.findIndex(p => p.stage === nextStage);
          
          if (nextStageProgressIndex !== -1) {
            // Update existing stage
            updatedProgress[nextStageProgressIndex] = { 
              ...updatedProgress[nextStageProgressIndex], 
              status: "In Progress" 
            };
          } else {
            // Add new stage
            updatedProgress.push({ stage: nextStage, status: "In Progress" });
            
            // Sort progress to maintain the correct order
            updatedProgress.sort((a, b) => {
              const aIndex = applicableStages.indexOf(a.stage);
              const bIndex = applicableStages.indexOf(b.stage);
              return aIndex - bIndex;
            });
          }
          
          // Create a copy of the sub-tanks array
          const updatedSubTanks = [...selectedTank.subTanks];
          updatedSubTanks[selectedTank.currentSubTankIndex] = {
            ...updatedSubTank,
            progress: updatedProgress,
            currentStage: nextStage
          };
          
          // Update the selected tank with the updated sub-tanks
          updatedTank.subTanks = updatedSubTanks;
          
          // Mirror the active sub-tank's currentStage back to the parent tank
          updatedTank.currentStage = updatedSubTanks[selectedTank.currentSubTankIndex].currentStage;
        } else {
          // This was the last stage, just mark it as completed
          // Create a copy of the sub-tanks array
          const updatedSubTanks = [...selectedTank.subTanks];
          updatedSubTanks[selectedTank.currentSubTankIndex] = {
            ...updatedSubTank,
            progress: updatedProgress,
            // Keep the current stage as the last stage
            currentStage: stage
          };
          
          // Update the selected tank with the updated sub-tanks
          updatedTank.subTanks = updatedSubTanks;
          
          // Mirror the active sub-tank's currentStage back to the parent tank
          updatedTank.currentStage = updatedSubTanks[selectedTank.currentSubTankIndex].currentStage;
        }
        
        // Update the tank data based on which level it belongs to
        updateTankData(updatedTank);
      }
    } else {
      // Regular non-grouped tank logic
      // Find the stage in the progress array
      const stageIndex = updatedTank.progress.findIndex(p => p.stage === stage);
      
      if (stageIndex !== -1) {
        // Create a copy of the progress array and update the status
        const updatedProgress = [...updatedTank.progress];
        updatedProgress[stageIndex] = { ...updatedProgress[stageIndex], status: "Completed" };
        
        // Determine the next stage
        const applicableStages = getApplicableStages(updatedTank);
        const currentStageIndex = applicableStages.indexOf(stage);
        const nextStageIndex = currentStageIndex + 1;
        
        // If there is a next stage, set it to "In Progress"
        if (nextStageIndex < applicableStages.length) {
          const nextStage = applicableStages[nextStageIndex];
          
          // Find the next stage in progress array
          const nextStageProgressIndex = updatedProgress.findIndex(p => p.stage === nextStage);
          
          if (nextStageProgressIndex !== -1) {
            // Update existing stage
            updatedProgress[nextStageProgressIndex] = { 
              ...updatedProgress[nextStageProgressIndex], 
              status: "In Progress" 
            };
          } else {
            // Add new stage
            updatedProgress.push({ stage: nextStage, status: "In Progress" });
            
            // Sort progress to maintain the correct order
            updatedProgress.sort((a, b) => {
              const aIndex = applicableStages.indexOf(a.stage);
              const bIndex = applicableStages.indexOf(b.stage);
              return aIndex - bIndex;
            });
          }
          
          updatedTank.progress = updatedProgress;
          updatedTank.currentStage = nextStage;
        } else {
          // This was the last stage, just mark it as completed
          updatedTank.progress = updatedProgress;
          // Keep the current stage as the last stage
          updatedTank.currentStage = stage;
        }
        
        // Update the tank data based on which level it belongs to
        updateTankData(updatedTank);
      }
    }
  }

  // Function to undo a task
  const undoTask = () => {
    if (!selectedTank || !stageToUndo) return;

    // Clone the selected tank to avoid modifying state directly
    const updatedTank = { ...selectedTank } as ExtendedWaterTank;
    
    // If we're dealing with a sub-tank
    if (selectedTank.currentSubTankIndex !== undefined && selectedTank.isGrouped && selectedTank.subTanks) {
      // Get a reference to the current sub-tank
      const subTank = selectedTank.subTanks[selectedTank.currentSubTankIndex];
      
      if (!subTank) return;
      
      // Clone the sub-tank and its progress array
      const updatedSubTank = { ...subTank };
      
      // Get applicable stages for this sub-tank
      const applicableStages = getApplicableStages({
        ...subTank, 
        isSubTank: true, 
        parentId: selectedTank.id
      });
      
      // Find the stage index in applicable stages
      const stageIndex = applicableStages.indexOf(stageToUndo);
      
      if (stageIndex !== -1) {
        // Create a copy of the progress array
        let updatedProgress = [...updatedSubTank.progress];
        
        // Find the stage in progress array
        const stageProgressIndex = updatedProgress.findIndex(p => p.stage === stageToUndo);
        
        if (stageProgressIndex !== -1) {
          // Mark this stage as Not Started
          updatedProgress[stageProgressIndex] = { 
            ...updatedProgress[stageProgressIndex], 
            status: "Not Started" 
          };
          
          // Mark all subsequent stages as Not Started too
          for (let i = stageProgressIndex + 1; i < updatedProgress.length; i++) {
            updatedProgress[i] = { ...updatedProgress[i], status: "Not Started" };
          }
          
          // Set previous stage as In Progress, if there is one
          if (stageIndex > 0) {
            const prevStage = applicableStages[stageIndex - 1];
            const prevStageIndex = updatedProgress.findIndex(p => p.stage === prevStage);
            
            if (prevStageIndex !== -1) {
              updatedProgress[prevStageIndex] = { 
                ...updatedProgress[prevStageIndex], 
                status: "In Progress" 
              };
            }
          }
          
          // Create a copy of the sub-tanks array
          const updatedSubTanks = [...selectedTank.subTanks];
          
          // Determine the new current stage
          const newCurrentStage = stageIndex > 0 ? applicableStages[stageIndex - 1] : applicableStages[0];
          
          updatedSubTanks[selectedTank.currentSubTankIndex] = {
            ...updatedSubTank,
            progress: updatedProgress,
            currentStage: newCurrentStage
          };
          
          // Update the selected tank with the updated sub-tanks
          updatedTank.subTanks = updatedSubTanks;
          
          // Mirror the active sub-tank's currentStage back to the parent tank
          updatedTank.currentStage = updatedSubTanks[selectedTank.currentSubTankIndex].currentStage;
          
          // Update the tank data based on which level it belongs to
          updateTankData(updatedTank);
        }
      }
    } else {
      // Regular non-grouped tank logic
      // Get applicable stages for this tank
      const applicableStages = getApplicableStages(updatedTank);
      
      // Find the stage index in applicable stages
      const stageIndex = applicableStages.indexOf(stageToUndo);
      
      if (stageIndex !== -1) {
        // Create a copy of the progress array
        let updatedProgress = [...updatedTank.progress];
        
        // Find the stage in progress array
        const stageProgressIndex = updatedProgress.findIndex(p => p.stage === stageToUndo);
        
        if (stageProgressIndex !== -1) {
          // Mark this stage as Not Started
          updatedProgress[stageProgressIndex] = { 
            ...updatedProgress[stageProgressIndex], 
            status: "Not Started" 
          };
          
          // Mark all subsequent stages as Not Started too
          for (let i = stageProgressIndex + 1; i < updatedProgress.length; i++) {
            updatedProgress[i] = { ...updatedProgress[i], status: "Not Started" };
          }
          
          // Set previous stage as In Progress, if there is one
          if (stageIndex > 0) {
            const prevStage = applicableStages[stageIndex - 1];
            const prevStageIndex = updatedProgress.findIndex(p => p.stage === prevStage);
            
            if (prevStageIndex !== -1) {
              updatedProgress[prevStageIndex] = { 
                ...updatedProgress[prevStageIndex], 
                status: "In Progress" 
              };
            }
          }
          
          // Determine the new current stage
          const newCurrentStage = stageIndex > 0 ? applicableStages[stageIndex - 1] : applicableStages[0];
          
          updatedTank.progress = updatedProgress;
          updatedTank.currentStage = newCurrentStage;
          
          // Update the tank data based on which level it belongs to
          updateTankData(updatedTank);
        }
      }
    }
    
    // Close the confirmation dialog
    setConfirmDialogOpen(false);
    setStageToUndo(null);
  }

  // Function to update tank data in the appropriate state and API
  const updateTankData = async (updatedTank: ExtendedWaterTank) => {
    // First update local state
    const levelKey = activeSection === "N00" ? "n00Tanks" : 
                    activeSection === "N10" ? "n10Tanks" : 
                    activeSection === "N20" ? "n20Tanks" : null;
    
    if (!levelKey) return;

    // Create a clean version of the tank without temporary properties
    const cleanTank = { ...updatedTank };
    // Remove temporary properties that shouldn't be stored
    if ('currentSubTankIndex' in cleanTank) {
      delete cleanTank.currentSubTankIndex;
    }
    
    if (activeSection === "N00") {
      setN00TanksData((prev) => ({
        ...prev,
        [cleanTank.id]: cleanTank,
      }))
    } else if (activeSection === "N10") {
      setN10TanksData((prev) => ({
        ...prev,
        [cleanTank.id]: cleanTank,
      }))
    } else if (activeSection === "N20") {
      setN20TanksData((prev) => ({
        ...prev,
        [cleanTank.id]: cleanTank,
      }))
    }

    // Then update via API
    try {
      const apiLevel = levelKey;
      await fetch(`/api/tasks/${apiLevel}/${cleanTank.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedTank: cleanTank })
      });
    } catch (error) {
      console.error("Error updating tank via API:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-700 text-white">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex-1"></div>
          <div className="flex items-center justify-center flex-1">
            <div className="bg-gray-200 text-black px-4 py-2 my-2 text-center w-full max-w-xl">
              Camp Nou Construction - Water Proofing Tracker
            </div>
          </div>
          <div className="flex-1 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-black bg-gray-200 border-gray-300 hover:bg-gray-300 mr-2"
              onClick={() => window.location.href = '/api-test'}
            >
              API Test
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-black bg-gray-200 border-gray-300 hover:bg-gray-300 mr-4"
            >
              Sign-in
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-gray-700 text-white py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between px-4">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <h2 className="text-xl mr-2">Water Tanks</h2>
              <DropdownMenu open={isWaterTanksOpen} onOpenChange={setIsWaterTanksOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72">
                  <DropdownMenuItem onClick={handleExportToSpreadsheet} className="py-3 cursor-pointer">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export Progress to Spreadsheet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReadyForInspection} className="py-3 cursor-pointer">
                    Ready for Inspection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={activeSection === "N00" ? "default" : "outline"}
                className={`bg-gray-200 text-black hover:bg-gray-300 ${activeSection === "N00" ? "bg-black text-white hover:bg-black" : ""}`}
                onClick={() => setActiveSection("N00")}
              >
                N00
              </Button>
              <Button
                variant={activeSection === "N10" ? "default" : "outline"}
                className={`bg-gray-200 text-black hover:bg-gray-300 ${activeSection === "N10" ? "bg-black text-white hover:bg-black" : ""}`}
                onClick={() => setActiveSection("N10")}
              >
                N10
              </Button>
              <Button
                variant={activeSection === "N20" ? "default" : "outline"}
                className={`bg-gray-200 text-black hover:bg-gray-300 ${activeSection === "N20" ? "bg-black text-white hover:bg-black" : ""}`}
                onClick={() => setActiveSection("N20")}
              >
                N20
              </Button>
              <Button
                variant={activeSection === "N30" ? "default" : "outline"}
                className={`bg-gray-200 text-black hover:bg-gray-300 ${activeSection === "N30" ? "bg-black text-white hover:bg-black" : ""}`}
                onClick={() => setActiveSection("N30")}
              >
                N30
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <h2 className="text-xl mr-2">Mechanical Pits</h2>
              <DropdownMenu open={isMechanicalPitsOpen} onOpenChange={setIsMechanicalPitsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-72">
                  <DropdownMenuItem onClick={handleExportToSpreadsheet} className="py-3 cursor-pointer">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export Progress to Spreadsheet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReadyForInspection} className="py-3 cursor-pointer">
                    Ready for Inspection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" className="bg-gray-200 text-black hover:bg-gray-300">
                N30
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 relative">
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" className="bg-gray-200 text-black hover:bg-gray-300">
            Activity Log
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[600px]">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-lg">{initializing ? "Initializing tank data..." : "Loading tank data..."}</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full">
            {activeSection === "N00" && (
              <div className="overflow-auto">
                <div className="relative" style={{ width: "1280px", height: "900px" }}>
                  <Image
                    src="/images/n00.jpg"
                    alt="N00 Level Map"
                    width={1280}
                    height={900}
                    className="w-full h-auto"
                    style={{ maxWidth: "none" }}
                  />
                  {/* Render clickable boxes for each tank */}
                  {Object.values(n00TanksData).map((tank) => {
                    // No scaling needed as the coordinates are already for the target size
                    const position = getScaledPosition(tank.coordinates.top, tank.coordinates.left, "N00");
                    return (
                      <div
                        key={tank.id}
                        className="absolute"
                        style={{
                          top: `${position.top}px`,
                          left: `${position.left}px`,
                        }}
                      >
                        <div
                          className={`${getTankColor(tank)} cursor-pointer hover:opacity-80 transition-opacity border border-black`}
                          style={{
                            width: `${tank.coordinates.width}px`,
                            height: `${tank.coordinates.height}px`,
                          }}
                          onClick={() => handleTankClick(tank.id)}
                        ></div>
                        <div className="text-[8px] font-bold mt-1 text-black whitespace-nowrap">{tank.type}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection === "N10" && (
              <div className="overflow-auto">
                <div className="relative" style={{ width: "1280px", height: "900px" }}>
                  <Image 
                    src="/images/n10.jpg" 
                    alt="N10 Level Map" 
                    width={1280} 
                    height={900} 
                    className="w-full h-auto"
                    style={{ maxWidth: "none" }}
                  />
                  {/* Render clickable boxes for each tank */}
                  {Object.values(n10TanksData).map((tank) => {
                    // No scaling needed as the coordinates are already for the target size
                    const position = getScaledPosition(tank.coordinates.top, tank.coordinates.left, "N10");
                    return (
                      <div
                        key={tank.id}
                        className="absolute"
                        style={{
                          top: `${position.top}px`,
                          left: `${position.left}px`,
                        }}
                      >
                        <div
                          className={`${getTankColor(tank)} cursor-pointer hover:opacity-80 transition-opacity border border-black`}
                          style={{
                            width: `${tank.coordinates.width}px`,
                            height: `${tank.coordinates.height}px`,
                          }}
                          onClick={() => handleTankClick(tank.id)}
                        ></div>
                        <div className="text-[8px] font-bold mt-1 text-black whitespace-nowrap">{tank.type}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeSection === "N20" && (
              <div className="overflow-auto">
                <div className="relative" style={{ width: "1280px", height: "900px" }}>
                  <Image 
                    src="/images/n20.jpg" 
                    alt="N20 Level Map" 
                    width={1280} 
                    height={900} 
                    className="w-full h-auto"
                    style={{ maxWidth: "none" }}
                  />
                  {/* Render clickable boxes for each tank */}
                  {Object.values(n20TanksData).map((tank) => {
                    // No scaling needed as the coordinates are already for the target size
                    const position = getScaledPosition(tank.coordinates.top, tank.coordinates.left, "N20");
                    return (
                      <div
                        key={tank.id}
                        className="absolute"
                        style={{
                          top: `${position.top}px`,
                          left: `${position.left}px`,
                        }}
                      >
                        <div
                          className={`${getTankColor(tank)} cursor-pointer hover:opacity-80 transition-opacity border border-black`}
                          style={{
                            width: `${tank.coordinates.width}px`,
                            height: `${tank.coordinates.height}px`,
                          }}
                          onClick={() => handleTankClick(tank.id)}
                        ></div>
                        <div className="text-[8px] font-bold mt-1 text-black whitespace-nowrap">{tank.type}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!activeSection && (
              <div className="flex items-center justify-center h-96 bg-gray-200 rounded-lg">
                <p className="text-gray-500 text-lg">Select a level (N00, N10, N20, N30) to view the map</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Tank Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedTank?.name}</DialogTitle>
            {selectedTank?.location && (
              <DialogDescription>{selectedTank.location}</DialogDescription>
            )}
          </DialogHeader>
          
          {selectedTank?.isGrouped && selectedTank.subTanks ? (
            // If this is a grouped tank, show sub-tanks horizontally instead of vertically
            <div className="flex flex-row gap-4 py-2 overflow-x-auto">
              {selectedTank.subTanks.map((subTank, index) => {
                // Get applicable stages for this sub-tank
                const applicableStages = getApplicableStages({
                  ...subTank, 
                  isSubTank: true, 
                  parentId: selectedTank.id
                });
                
                // Filter progress to only show applicable stages
                const filteredProgress = applicableStages.map(stage => {
                  // Find this stage in the subTank's progress array
                  const existingProgress = subTank.progress.find(p => p.stage === stage);
                  
                  // If found, use it; otherwise create a default "Not Started" entry
                  return existingProgress || { 
                    stage, 
                    status: "Not Started" as ProgressStatus 
                  };
                });
                
                return (
                  <div key={subTank.id || index} className="border rounded-lg p-4 bg-gray-50 flex-1 min-w-[250px]">
                    <h3 className="font-semibold text-lg mb-2">{subTank.name}</h3>
                    <div className="grid gap-2">
                      {filteredProgress.map((stage, stageIndex) => {
                        // Determine if this is the current ongoing task
                        const isCurrentTask = stage.status === "In Progress";
                        
                        return (
                          <div
                            key={`${subTank.id || index}-${stage.stage}`}
                            className={`flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer ${isCurrentTask ? "bg-blue-100" : ""}`}
                            onClick={() => {
                              // Create a temporary copy of the selected tank with this sub-tank's progress
                              const tempSelectedTank = {
                                ...selectedTank,
                                currentSubTankIndex: index,
                                progress: subTank.progress
                              };
                              setSelectedTank(tempSelectedTank);
                              toggleTaskCompletion(stage.stage);
                            }}
                          >
                            <div
                              className={`w-6 h-6 border rounded-md flex items-center justify-center ${
                                stage.status === "Completed" ? "bg-green-500 border-green-500" : "border-gray-400"
                              }`}
                            >
                              {stage.status === "Completed" && <Check className="h-4 w-4 text-white" />}
                            </div>
                            <div className="flex-1">{stage.stage}</div>
                            {isCurrentTask && <div className="text-blue-500 text-xs font-medium">Current Task</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Regular non-grouped tank
            <div className="grid gap-2 py-4">
              {selectedTank && getApplicableStages(selectedTank).map((stage) => {
                // Find this stage in the progress array
                const progressStage = selectedTank.progress.find(p => p.stage === stage);
                const status = progressStage ? progressStage.status : "Not Started";
                
                // Determine if this is the current ongoing task
                const isCurrentTask = status === "In Progress";

                return (
                  <div
                    key={stage}
                    className={`flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer ${isCurrentTask ? "bg-blue-100" : ""}`}
                    onClick={() => toggleTaskCompletion(stage)}
                  >
                    <div
                      className={`w-6 h-6 border rounded-md flex items-center justify-center ${status === "Completed" ? "bg-green-500 border-green-500" : "border-gray-400"}`}
                    >
                      {status === "Completed" && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1">{stage}</div>
                    {isCurrentTask && <div className="text-blue-500 text-xs font-medium">Current Task</div>}
                  </div>
                )
              })}
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
              className="mr-2"
            >
              Close
            </Button>
            <Button
              onClick={async () => {
                if (selectedTank) {
                  // Get the level key based on active section
                  const levelKey = activeSection === "N00" ? "n00Tanks" : 
                                 activeSection === "N10" ? "n10Tanks" : 
                                 activeSection === "N20" ? "n20Tanks" : null;
                  
                  if (levelKey) {
                    try {
                      // Save changes via API
                      await fetch(`/api/tasks/${levelKey}/${selectedTank.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ updatedTank: selectedTank })
                      });
                    } catch (error) {
                      console.error("Error saving tank data:", error);
                    }
                  }
                  
                  setIsDetailsOpen(false);
                }
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Undoing Tasks */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Undo</DialogTitle>
            <DialogDescription>
              Are you sure you want to undo this task? This will also undo all subsequent tasks that were marked as
              completed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              No
            </Button>
            <Button variant="destructive" onClick={undoTask}>
              Yes, Undo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ready for Inspection Dialog */}
      <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tanks Ready for Inspection</DialogTitle>
            <DialogDescription>The following tanks are ready for inspection:</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {Object.entries(getTanksReadyForInspection()).map(
              ([level, tanks]) =>
                tanks.length > 0 && (
                  <div key={level} className="space-y-2">
                    <h3 className="font-medium text-lg">{level.toUpperCase()} Level</h3>
                    <div className="pl-2 space-y-1">
                      {tanks.map((tank) => (
                        <div key={tank.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                          <span>{tank.name}</span>
                          <span className="text-sm px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                            {tank.currentStage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
            )}
            {Object.values(getTanksReadyForInspection()).every((tanks) => tanks.length === 0) && (
              <div className="text-center py-4 text-gray-500">No tanks are currently ready for inspection.</div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsInspectionDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spreadsheet Dialog */}
      <Dialog open={isSpreadsheetDialogOpen} onOpenChange={setIsSpreadsheetDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Spreadsheet Data View</DialogTitle>
            <DialogDescription>
              This view allows you to see all tasks in a spreadsheet format.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[70vh] max-w-full">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent Tank</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formwork Removal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repair and Cleaning</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pump Anchors</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slope</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dwall anchorage removal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dwall anchorage waterproofing</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grout openings in wall</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Stage 1</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waterproofing</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waterproofing of walls</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Stage 2</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waterproofing of floor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Stage 3</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {getAllTanks().map((tank: any, i: number) => {
                  const tankId = tank.id;
                  const parentInfo = tank.isSubTank ? tank.parentName : "-";
                  
                  // Get each stage status with applicable flag
                  const formwork = getTankStageStatus(tank, "Formwork Removal");
                  const repair = getTankStageStatus(tank, "Repair and Cleaning");
                  const pump = getTankStageStatus(tank, "Pump Anchors");
                  const slope = getTankStageStatus(tank, "Slope");
                  const dwallRemoval = getTankStageStatus(tank, "Dwall anchorage removal");
                  const dwallWaterproofing = getTankStageStatus(tank, "Dwall anchorage waterproofing");
                  const groutOpenings = getTankStageStatus(tank, "Grout openings in wall");
                  const inspection1 = getTankStageStatus(tank, "Inspection Stage 1");
                  const waterproofing = getTankStageStatus(tank, "Waterproofing");
                  const waterproofingWalls = getTankStageStatus(tank, "Waterproofing of walls");
                  const inspection2 = getTankStageStatus(tank, "Inspection Stage 2");
                  const waterproofingFloor = getTankStageStatus(tank, "Waterproofing of floor");
                  const inspection3 = getTankStageStatus(tank, "Inspection Stage 3");
                  
                  // Add colored cell styles based on status
                  const getCellClass = (result: { status: string, applicable: boolean }) => {
                    if (!result.applicable) return "px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic";
                    
                    if (result.status === "Completed") 
                      return "px-6 py-4 whitespace-nowrap text-sm text-gray-800 bg-green-100 dark:bg-green-900 dark:text-green-200";
                    else if (result.status === "In Progress") 
                      return "px-6 py-4 whitespace-nowrap text-sm text-gray-800 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200";
                    
                    return "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400";
                  };
                  
                  return (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{tank.level}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{tank.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{parentInfo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{tankId}</td>
                      <td className={getCellClass(formwork)}>{formwork.status}</td>
                      <td className={getCellClass(repair)}>{repair.status}</td>
                      <td className={getCellClass(pump)}>{pump.status}</td>
                      <td className={getCellClass(slope)}>{slope.status}</td>
                      <td className={getCellClass(dwallRemoval)}>{dwallRemoval.status}</td>
                      <td className={getCellClass(dwallWaterproofing)}>{dwallWaterproofing.status}</td>
                      <td className={getCellClass(groutOpenings)}>{groutOpenings.status}</td>
                      <td className={getCellClass(inspection1)}>{inspection1.status}</td>
                      <td className={getCellClass(waterproofing)}>{waterproofing.status}</td>
                      <td className={getCellClass(waterproofingWalls)}>{waterproofingWalls.status}</td>
                      <td className={getCellClass(inspection2)}>{inspection2.status}</td>
                      <td className={getCellClass(waterproofingFloor)}>{waterproofingFloor.status}</td>
                      <td className={getCellClass(inspection3)}>{inspection3.status}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsSpreadsheetDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            <Button onClick={downloadSpreadsheet}>
              <Download className="h-4 w-4 mr-2" />
              Export Print
            </Button>
            <Button onClick={() => downloadCsvFile(generateCsvContent())}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Table
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

