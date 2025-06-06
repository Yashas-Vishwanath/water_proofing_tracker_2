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
  n20Tanks,
  n30Tanks
} from "./data/tanks"

// Import our new components and hooks
import TankMap from "@/components/TankMap"
import TankDetails from "@/components/TankDetails"
import { useTanksData } from "@/hooks/useTanksData"
import { useGroupedTankProgress } from "@/hooks/useGroupedTankProgress"
import { isFullyCompleted } from "@/lib/tankUtils"

// Import the getTankColor function from tankUtils
import { getTankColor } from "@/lib/tankUtils"

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
  const [n30TanksData, setN30TanksData] = useState<Record<string, WaterTank>>(n30Tanks)

  // Add a new state for the inspection dialog
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false)

  // Add a new state for the spreadsheet dialog
  const [isSpreadsheetDialogOpen, setIsSpreadsheetDialogOpen] = useState(false)

  // Image dimensions
  const targetWidth = 1280;
  const targetHeight = 900;
  
  // Function to get scaled position for tank boxes
  const getScaledPosition = (top: number, left: number, section: string) => {
    // No scaling needed as coordinates are already for the target size
    return { top, left };
  };

  // Use our custom hooks
  const tanksData = useTanksData();
  const tankProgress = useGroupedTankProgress(null);

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
          if (data.n30Tanks && Object.keys(data.n30Tanks).length > 0) {
            setN30TanksData(data.n30Tanks);
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
          n30Tanks,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save tanks data');
      }

      // Set the state with the initial data
      setN00TanksData(n00Tanks);
      setN10TanksData(n10Tanks);
      setN20TanksData(n20Tanks);
      setN30TanksData(n30Tanks);
    } catch (error) {
      console.error('Error saving tanks data:', error);
    }
  };

  // Function to handle exporting to spreadsheet
  const handleExportToSpreadsheet = () => {
    setIsSpreadsheetDialogOpen(true)
  }

  // Function to download the spreadsheet
  const downloadSpreadsheet = () => {
    // Get current date for title
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    // Get all tanks data
    const allTanks = getAllTanks();

    // Create an HTML table for printing/saving
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
              <th>No.</th>
              <th>Level</th>
              <th>Parent Tank</th>
              <th>Tank ID</th>
              <th>Type of Tank</th>
              <th>Formwork Removal</th>
              <th>Repair and Cleaning</th>
              <th>Dwall Anchorage Removal</th>
              <th>Dwall Anchorage Waterproofing</th>
              <th>Filling Dwall openings</th>
              <th>Pump Anchors</th>
              <th>Slope</th>
              <th>Inspection Stage 1</th>
              <th>Waterproofing Walls and Floor</th>
              <th>Only Walls</th>
              <th>Inspection Stage 2</th>
              <th>Waterproofing Only Floor</th>
              <th>Inspection Stage 3</th>
            </tr>
            <tr>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th>PUMP PITS</th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Helper function to get cell class for a stage
    const getCellClass = (result: { status: string, applicable: boolean }) => {
      if (!result.applicable) return "not-applicable";
      if (result.status === "Completed") return "completed";
      if (result.status === "In Progress") return "in-progress";
      return "";
    };
    
    // Add a row for each tank
    let rowIndex = 1;
    allTanks.forEach(tank => {
      // Skip parent tanks with sub-tanks since we show individual sub-tanks
      if (tank.isParentTank) return;
      
      const parentName = tank.isSubTank ? tank.parentName : "-";
      const tankType = tank.type || "";
      const level = tank.level || "";
      
      // Check if this tank needs special stages
      const isEB16Tank = tank.id?.includes("EB16-STE-089") || 
                       (tank.isSubTank && tank.parentId?.includes("EB16-STE-089"));
                       
      const isRainWaterValve = tankType.includes("Rain Water") && tankType.includes("Valve");
      const isEB1Interior = tank.id?.includes("EB1") && tank.id?.includes("Interior") ||
                          (tank.isSubTank && tank.parentId?.includes("EB1") && tank.parentId?.includes("Interior"));
      const isEB1Exterior = tank.id?.includes("EB1") && tank.id?.includes("Exterior") ||
                          (tank.isSubTank && tank.parentId?.includes("EB1") && tank.parentId?.includes("Exterior"));
      const isEB9Tank = tank.id?.includes("EB9") ||
                      (tank.isSubTank && tank.parentId?.includes("EB9"));
      
      // Helper function to get status for a specific stage
      const getStageStatus = (stageName: string) => {
        const stageProgress = tank.progress?.find((p: any) => p.stage === stageName);
        
        if (isEB16Tank) {
          // EB16 tanks have dwall anchoring stages
          if (stageName === "Pump Anchors" || stageName === "Slope") {
            return { status: "N/A", applicable: false };
          }
        } else if (isRainWaterValve || isEB1Interior || isEB1Exterior || isEB9Tank) {
          // These tank types don't have pump anchors or slope
          if (stageName === "Pump Anchors" || stageName === "Slope" || 
              stageName === "Dwall anchorage removal" || stageName === "Dwall anchorage waterproofing" || 
              stageName === "Grout openings in wall" || stageName === "Inspection Stage 3") {
            return { status: "N/A", applicable: false };
          }
        } else {
          // Standard tanks don't have dwall anchorage or grout openings
          if (stageName === "Dwall anchorage removal" || stageName === "Dwall anchorage waterproofing" || 
              stageName === "Grout openings in wall" || stageName === "Inspection Stage 3") {
            return { status: "N/A", applicable: false };
          }
        }
        
        return {
          status: stageProgress ? stageProgress.status : "Not Started",
          applicable: true
        };
      };
      
      tableHtml += `
        <tr>
          <td>${rowIndex++}</td>
          <td>${level}</td>
          <td>${parentName}</td>
          <td>${tank.name || tank.id}</td>
          <td>${tankType}</td>
          <td class="${getCellClass(getStageStatus("Formwork Removal"))}">${getStageStatus("Formwork Removal").status !== "N/A" ? getStageStatus("Formwork Removal").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Repair and Cleaning"))}">${getStageStatus("Repair and Cleaning").status !== "N/A" ? getStageStatus("Repair and Cleaning").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Dwall anchorage removal"))}">${getStageStatus("Dwall anchorage removal").status !== "N/A" ? getStageStatus("Dwall anchorage removal").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Dwall anchorage waterproofing"))}">${getStageStatus("Dwall anchorage waterproofing").status !== "N/A" ? getStageStatus("Dwall anchorage waterproofing").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Grout openings in wall"))}">${getStageStatus("Grout openings in wall").status !== "N/A" ? getStageStatus("Grout openings in wall").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Pump Anchors"))}">${getStageStatus("Pump Anchors").status !== "N/A" ? getStageStatus("Pump Anchors").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Slope"))}">${getStageStatus("Slope").status !== "N/A" ? getStageStatus("Slope").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Inspection Stage 1"))}">${getStageStatus("Inspection Stage 1").status !== "N/A" ? getStageStatus("Inspection Stage 1").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Waterproofing"))}">${getStageStatus("Waterproofing").status !== "N/A" ? getStageStatus("Waterproofing").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Waterproofing of walls"))}">${getStageStatus("Waterproofing of walls").status !== "N/A" ? getStageStatus("Waterproofing of walls").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Inspection Stage 2"))}">${getStageStatus("Inspection Stage 2").status !== "N/A" ? getStageStatus("Inspection Stage 2").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Waterproofing of floor"))}">${getStageStatus("Waterproofing of floor").status !== "N/A" ? getStageStatus("Waterproofing of floor").status : "n/a"}</td>
          <td class="${getCellClass(getStageStatus("Inspection Stage 3"))}">${getStageStatus("Inspection Stage 3").status !== "N/A" ? getStageStatus("Inspection Stage 3").status : "n/a"}</td>
        </tr>
      `;
    });
    
    tableHtml += `
          </tbody>
        </table>
      </div>
    </body>
    </html>
    `;
    
    // Open the HTML in a new window for printing
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(tableHtml);
      printWindow.document.close();
    }
  };

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
    processTanks(n30TanksData, "N30");
    
    return tanks;
  };
  
  // Helper function to get stages that are applicable for a given tank type
  const getApplicableStages = (tank: any): ProgressStage[] => {
    // Check if this is a pump pit by ID
    const isPumpPit = tank.id && (
      // N00 pump pits
      tank.id === "PBF-S3-01" || 
      tank.id === "PBF-S3-02" || 
      tank.id === "PBF-S3-03" || 
      tank.id === "PBF-S3-04" || 
      tank.id === "PBP-S3-GT" || 
      tank.id === "S3-PBP-1G+CP" ||
      // N10 pump pits 
      tank.id === "PBF-S2-01" || 
      tank.id === "PBF-S2-03" || 
      tank.id === "PBF-S2-11" || 
      tank.id === "PBF-S2-12" || 
      tank.id === "PBF-S2-13" || 
      tank.id === "S2-PB-04" || 
      tank.id === "S2-PB-05" || 
      tank.id === "S2-PB-06" || 
      tank.id === "S2-PB-07" || 
      tank.id === "S2-PB-15" || 
      tank.id === "PBP-S2-01" || 
      tank.id === "FEC-PB-08" ||
      // N20 pump pits
      tank.id === "PBF-S1-02" || 
      tank.id === "PBF-S1-03" || 
      tank.id === "PBF-S1-04" || 
      tank.id === "PBF-S1-05" || 
      tank.id === "PBF-S1-08" ||
      // Chiller room tanks (all are pump pits)
      tank.id === "CHILLER-ROOM-INSIDE" || 
      tank.id === "CHILLER-ROOM-OUTSIDE" ||
      tank.id === "EB16-STE-088" ||
      tank.id === "EB16-STE-089-CR" ||
      // Check by type
      (tank.type && (
        tank.type.includes("CHILLER ROOM") ||
        tank.type === "CHILLER ROOM"
      ))
    );

    // Special case for EB16-STE-089 tanks
    if (tank.id === "EB16-STE-089" || (tank.isSubTank && tank.parentId === "EB16-STE-089")) {
      // For LARGE TANK-01, include all special stages
      if (tank.isSubTank && tank.id === "EB16-STE-089-TANK-01") {
        const stages = [
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
        
        // Add Ladder Installation if this is a pump pit
        if (isPumpPit) {
          stages.push("Ladder Installation");
        }
        
        return stages;
      }
      
      // For other EB16-STE-089 tanks (parent tank and other sub-tanks)
      const stages = [
        "Formwork Removal",
        "Repair and Cleaning",
        "Inspection Stage 1",
        "Waterproofing of walls", 
        "Inspection Stage 2",
        "Waterproofing of floor",
        "Inspection Stage 3"
      ] as ProgressStage[];
      
      // Add Ladder Installation if this is a pump pit
      if (isPumpPit) {
        stages.push("Ladder Installation");
      }
      
      return stages;
    }
    
    // Special case for EB1-EXTERIOR tanks and its sub-tanks
    if (tank.id === "EB1-EXTERIOR" || (tank.isSubTank && tank.parentId === "EB1-EXTERIOR")) {
      const stages = [
        "Formwork Removal",
        "Repair and Cleaning",
        "Pump Anchors",
        "Slope",
        "Inspection Stage 1",
        "Waterproofing",
        "Inspection Stage 2"
      ] as ProgressStage[];
      
      // Add Ladder Installation if this is a pump pit
      if (isPumpPit) {
        stages.push("Ladder Installation");
      }
      
      return stages;
    }
    
    // For all other regular tanks
    const stages = [
      "Formwork Removal",
      "Repair and Cleaning",
      "Pump Anchors",
      "Slope",
      "Inspection Stage 1",
      "Waterproofing",
      "Inspection Stage 2"
    ] as ProgressStage[];
    
    // Add Ladder Installation if this is a pump pit
    if (isPumpPit) {
      stages.push("Ladder Installation");
    }
    
    return stages;
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
      "Level,Type of Tank,Parent Tank,ID,Formwork Removal,Repair and Cleaning,Dwall Anchorage Removal,Dwall Anchorage Waterproofing,Filling Dwall openings,Pump Anchors,Slope,Inspection Stage 1,Waterproofing Walls and Floor,Waterproofing Only Walls,Inspection Stage 2,Waterproofing Only Floor,Inspection Stage 3,Ladder Installation\n"

    allTanks.forEach((tank: any) => {
      const tankId = tank.id;
      const parentInfo = tank.isSubTank ? tank.parentName : "-";
      
      // Get status for each stage (or N/A if not applicable for this tank type)
      const formwork = getTankStageStatus(tank, "Formwork Removal");
      const repair = getTankStageStatus(tank, "Repair and Cleaning");
      const dwallRemoval = getTankStageStatus(tank, "Dwall anchorage removal");
      const dwallWaterproofing = getTankStageStatus(tank, "Dwall anchorage waterproofing");
      const groutOpenings = getTankStageStatus(tank, "Grout openings in wall");
      const pump = getTankStageStatus(tank, "Pump Anchors");
      const slope = getTankStageStatus(tank, "Slope");
      const inspection1 = getTankStageStatus(tank, "Inspection Stage 1");
      const waterproofing = getTankStageStatus(tank, "Waterproofing");
      const waterproofingWalls = getTankStageStatus(tank, "Waterproofing of walls");
      const inspection2 = getTankStageStatus(tank, "Inspection Stage 2");
      const waterproofingFloor = getTankStageStatus(tank, "Waterproofing of floor");
      const inspection3 = getTankStageStatus(tank, "Inspection Stage 3");
      const ladderInstallation = getTankStageStatus(tank, "Ladder Installation");

      csvContent += `${tank.level},${tank.type},${parentInfo},${tankId},${formwork.status},${repair.status},${dwallRemoval.status},${dwallWaterproofing.status},${groutOpenings.status},${pump.status},${slope.status},${inspection1.status},${waterproofing.status},${waterproofingWalls.status},${inspection2.status},${waterproofingFloor.status},${inspection3.status},${ladderInstallation.status}\n`
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
    // Helper function to check if all applicable stages except Ladder Installation are completed
    const areRequiredStagesCompleted = (tank: { progress: StageProgress[] }, applicableStages: ProgressStage[]) => {
      // Get all applicable stages except Ladder Installation
      const requiredStages = applicableStages.filter(stage => stage !== "Ladder Installation");
      
      // Check if all required stages are completed
      return requiredStages.every(stage => {
        const stageProgress = tank.progress.find(p => p.stage === stage);
        return stageProgress?.status === "Completed";
      });
    };

    // For grouped tanks, also check sub-tanks
    const isGroupTankCompleted = (tank: WaterTank) => {
      if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
        return tank.subTanks.every(subTank => {
          const applicableStages = getApplicableStages({
            ...subTank,
            isSubTank: true,
            parentId: tank.id
          });
          
          return areRequiredStagesCompleted(subTank, applicableStages);
        });
      }
      
      const applicableStages = getApplicableStages(tank);
      return areRequiredStagesCompleted(tank, applicableStages);
    };

    // Helper to check if a tank is in an inspection stage (either by currentStage or progress status)
    const isInInspectionStage = (tank: WaterTank) => {
      // Check currentStage property
      const stageByProperty = 
        tank.currentStage === "Inspection Stage 1" || 
        tank.currentStage === "Inspection Stage 2" || 
        tank.currentStage === "Inspection Stage 3";
      
      // Also check in progress array
      const inspectionStage1 = tank.progress.find(p => p.stage === "Inspection Stage 1");
      const inspectionStage2 = tank.progress.find(p => p.stage === "Inspection Stage 2");
      const inspectionStage3 = tank.progress.find(p => p.stage === "Inspection Stage 3");
      
      const stageByProgress = 
        (inspectionStage1 && inspectionStage1.status === "In Progress") ||
        (inspectionStage2 && inspectionStage2.status === "In Progress") ||
        (inspectionStage3 && inspectionStage3.status === "In Progress");
      
      return stageByProperty || stageByProgress;
    };

    // Check sub-tanks for inspection stages
    const isGroupTankInInspection = (tank: WaterTank) => {
      if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
        // Check if ANY sub-tank is in inspection stage
        return tank.subTanks.some(subTank => {
          const inspectionStage1 = subTank.progress.find(p => p.stage === "Inspection Stage 1");
          const inspectionStage2 = subTank.progress.find(p => p.stage === "Inspection Stage 2");
          const inspectionStage3 = subTank.progress.find(p => p.stage === "Inspection Stage 3");
          
          return (
            (inspectionStage1 && inspectionStage1.status === "In Progress") ||
            (inspectionStage2 && inspectionStage2.status === "In Progress") ||
            (inspectionStage3 && inspectionStage3.status === "In Progress")
          );
        });
      }
      
      return isInInspectionStage(tank);
    };

    // Filter tanks that are in inspection stage but not fully completed
    const n00Ready = Object.values(n00TanksData).filter(
      (tank) => isGroupTankInInspection(tank) && !isGroupTankCompleted(tank)
    );

    const n10Ready = Object.values(n10TanksData).filter(
      (tank) => isGroupTankInInspection(tank) && !isGroupTankCompleted(tank)
    );

    const n20Ready = Object.values(n20TanksData).filter(
      (tank) => isGroupTankInInspection(tank) && !isGroupTankCompleted(tank)
    );
    
    const n30Ready = Object.values(n30TanksData).filter(
      (tank) => isGroupTankInInspection(tank) && !isGroupTankCompleted(tank)
    );
    
    return {
      n00: n00Ready,
      n10: n10Ready,
      n20: n20Ready,
      n30: n30Ready,
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
    } else if (activeSection === "N30") {
      tank = n30TanksData[tankId]
    }

    if (tank) {
      // For grouped tanks, initialize with currentSubTankIndex = 0
      if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
        setSelectedTank({
          ...tank,
          currentSubTankIndex: 0
        } as ExtendedWaterTank);
      } else {
        setSelectedTank(tank);
      }
      setIsDetailsOpen(true);
    }
  }

  // Handle switching between sub-tanks
  const handleSubTankSwitch = (subTankIndex: number) => {
    if (!selectedTank || !selectedTank.isGrouped || !selectedTank.subTanks) return;
    
    // Update the selected tank with the new sub-tank index
    const updatedTank = {
      ...selectedTank,
      currentSubTankIndex: subTankIndex
    };
    
    setSelectedTank(updatedTank);
  };

  // Function to toggle task completion
  const toggleTaskCompletion = (stage: ProgressStage) => {
    if (!selectedTank) return;
    
    // Check if the stage is already completed - if so, show confirmation dialog
    let isCompleted = false;
    
    if (selectedTank.isGrouped && selectedTank.subTanks) {
      // For sub-tanks, check completion status in the sub-tank's progress
      const subTankIndex = selectedTank.currentSubTankIndex !== undefined ? selectedTank.currentSubTankIndex : 0;
      const subTank = selectedTank.subTanks[subTankIndex];
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

    // Check if this is a pump pit
    const isPumpPit = selectedTank.id && (
      // N00 pump pits
      selectedTank.id === "PBF-S3-01" || 
      selectedTank.id === "PBF-S3-02" || 
      selectedTank.id === "PBF-S3-03" || 
      selectedTank.id === "PBF-S3-04" || 
      selectedTank.id === "PBP-S3-GT" || 
      selectedTank.id === "S3-PBP-1G+CP" ||
      // N10 pump pits 
      selectedTank.id === "PBF-S2-01" || 
      selectedTank.id === "PBF-S2-03" || 
      selectedTank.id === "PBF-S2-11" || 
      selectedTank.id === "PBF-S2-12" || 
      selectedTank.id === "PBF-S2-13" || 
      selectedTank.id === "S2-PB-04" || 
      selectedTank.id === "S2-PB-05" || 
      selectedTank.id === "S2-PB-06" || 
      selectedTank.id === "S2-PB-07" || 
      selectedTank.id === "S2-PB-15" || 
      selectedTank.id === "PBP-S2-01" || 
      selectedTank.id === "FEC-PB-08" ||
      // N20 pump pits
      selectedTank.id === "PBF-S1-02" || 
      selectedTank.id === "PBF-S1-03" || 
      selectedTank.id === "PBF-S1-04" || 
      selectedTank.id === "PBF-S1-05" || 
      selectedTank.id === "PBF-S1-08" ||
      // Chiller room tanks (all are pump pits)
      selectedTank.id === "CHILLER-ROOM-INSIDE" || 
      selectedTank.id === "CHILLER-ROOM-OUTSIDE" ||
      selectedTank.id === "EB16-STE-088" ||
      selectedTank.id === "EB16-STE-089-CR" ||
      // Check by type
      (selectedTank.type && (
        selectedTank.type.includes("CHILLER ROOM") ||
        selectedTank.type === "CHILLER ROOM"
      ))
    );

    // Special handling for Repair and Cleaning - always set next stage to In Progress
    if (stage === "Repair and Cleaning") {
      const updatedTank = { ...selectedTank } as ExtendedWaterTank;
      
      // For grouped tanks with sub-tanks
      if (updatedTank.isGrouped && updatedTank.subTanks) {
        const subTankIndex = updatedTank.currentSubTankIndex !== undefined ? updatedTank.currentSubTankIndex : 0;
        const subTank = updatedTank.subTanks[subTankIndex];
        
        if (subTank) {
          // Create copies to avoid direct state mutation
          const updatedSubTanks = [...updatedTank.subTanks];
          const updatedSubTank = { ...subTank };
          const updatedProgress = [...updatedSubTank.progress];
          
          // First mark Repair and Cleaning as Completed
          const repairIndex = updatedProgress.findIndex(p => p.stage === "Repair and Cleaning");
          if (repairIndex !== -1) {
            updatedProgress[repairIndex] = { ...updatedProgress[repairIndex], status: "Completed" };
          }
          
          // Then mark Inspection Stage 1 as In Progress
          const inspectionIndex = updatedProgress.findIndex(p => p.stage === "Inspection Stage 1");
          if (inspectionIndex !== -1) {
            updatedProgress[inspectionIndex] = { ...updatedProgress[inspectionIndex], status: "In Progress" };
          } else {
            // If not found, add it
            updatedProgress.push({ stage: "Inspection Stage 1", status: "In Progress" });
          }
          
          // Update the sub-tank with new progress
          updatedSubTank.progress = updatedProgress;
          updatedSubTank.currentStage = "Inspection Stage 1";
          
          // Update the sub-tanks array
          updatedSubTanks[subTankIndex] = updatedSubTank;
          
          // Update the parent tank
          updatedTank.subTanks = updatedSubTanks;
          updatedTank.currentStage = "Inspection Stage 1";
          
          // Update the selected tank state
          setSelectedTank(updatedTank);
          
          // Update the tank data based on which level it belongs to
          updateTankData(updatedTank);
          return;
        }
      }
      // For regular tanks (non-grouped)
      else {
        // Create a copy of the progress array
        const updatedProgress = [...updatedTank.progress];
        
        // First mark Repair and Cleaning as Completed
        const repairIndex = updatedProgress.findIndex(p => p.stage === "Repair and Cleaning");
        if (repairIndex !== -1) {
          updatedProgress[repairIndex] = { ...updatedProgress[repairIndex], status: "Completed" };
        }
        
        // Then mark Inspection Stage 1 as In Progress
        const inspectionIndex = updatedProgress.findIndex(p => p.stage === "Inspection Stage 1");
        if (inspectionIndex !== -1) {
          updatedProgress[inspectionIndex] = { ...updatedProgress[inspectionIndex], status: "In Progress" };
        } else {
          // If not found, add it
          updatedProgress.push({ stage: "Inspection Stage 1", status: "In Progress" });
        }
        
        // Update the tank with new progress
        updatedTank.progress = updatedProgress;
        updatedTank.currentStage = "Inspection Stage 1";
        
        // Update the selected tank state
        setSelectedTank(updatedTank);
        
        // Update the tank data based on which level it belongs to
        updateTankData(updatedTank);
        return;
      }
    }
    
    // Special handling for Inspection Stage 3 in pump pits - set Ladder Installation to In Progress
    if (stage === "Inspection Stage 3" && isPumpPit) {
      const updatedTank = { ...selectedTank } as ExtendedWaterTank;
      
      // For grouped tanks with sub-tanks
      if (updatedTank.isGrouped && updatedTank.subTanks) {
        const subTankIndex = updatedTank.currentSubTankIndex !== undefined ? updatedTank.currentSubTankIndex : 0;
        const subTank = updatedTank.subTanks[subTankIndex];
        
        if (subTank) {
          // Create copies to avoid direct state mutation
          const updatedSubTanks = [...updatedTank.subTanks];
          const updatedSubTank = { ...subTank };
          const updatedProgress = [...updatedSubTank.progress];
          
          // First mark Inspection Stage 3 as Completed
          const inspectionIndex = updatedProgress.findIndex(p => p.stage === "Inspection Stage 3");
          if (inspectionIndex !== -1) {
            updatedProgress[inspectionIndex] = { ...updatedProgress[inspectionIndex], status: "Completed" };
          }
          
          // Then mark Ladder Installation as In Progress
          const ladderIndex = updatedProgress.findIndex(p => p.stage === "Ladder Installation");
          if (ladderIndex !== -1) {
            updatedProgress[ladderIndex] = { ...updatedProgress[ladderIndex], status: "In Progress" };
          } else {
            // If not found, add it
            updatedProgress.push({ stage: "Ladder Installation", status: "In Progress" });
          }
          
          // Update the sub-tank with new progress
          updatedSubTank.progress = updatedProgress;
          updatedSubTank.currentStage = "Ladder Installation";
          
          // Update the sub-tanks array
          updatedSubTanks[subTankIndex] = updatedSubTank;
          
          // Update the parent tank
          updatedTank.subTanks = updatedSubTanks;
          updatedTank.currentStage = "Ladder Installation";
          
          // Update the selected tank state
          setSelectedTank(updatedTank);
          
          // Update the tank data based on which level it belongs to
          updateTankData(updatedTank);
          return;
        }
      }
      // For regular tanks (non-grouped)
      else {
        // Create a copy of the progress array
        const updatedProgress = [...updatedTank.progress];
        
        // First mark Inspection Stage 3 as Completed
        const inspectionIndex = updatedProgress.findIndex(p => p.stage === "Inspection Stage 3");
        if (inspectionIndex !== -1) {
          updatedProgress[inspectionIndex] = { ...updatedProgress[inspectionIndex], status: "Completed" };
        }
        
        // Then mark Ladder Installation as In Progress
        const ladderIndex = updatedProgress.findIndex(p => p.stage === "Ladder Installation");
        if (ladderIndex !== -1) {
          updatedProgress[ladderIndex] = { ...updatedProgress[ladderIndex], status: "In Progress" };
        } else {
          // If not found, add it
          updatedProgress.push({ stage: "Ladder Installation", status: "In Progress" });
        }
        
        // Update the tank with new progress
        updatedTank.progress = updatedProgress;
        updatedTank.currentStage = "Ladder Installation";
        
        // Update the selected tank state
        setSelectedTank(updatedTank);
        
        // Update the tank data based on which level it belongs to
        updateTankData(updatedTank);
        return;
      }
    }
    
    // Special handling for Inspection Stage 2 in pump pits without Inspection Stage 3 - set Ladder Installation to In Progress
    if (stage === "Inspection Stage 2" && isPumpPit) {
      // First check if this tank has Inspection Stage 3
      const hasInspectionStage3 = selectedTank.progress.some(p => p.stage === "Inspection Stage 3") ||
                                 (selectedTank.isGrouped && selectedTank.subTanks && 
                                  selectedTank.subTanks[selectedTank.currentSubTankIndex || 0]?.progress.some(p => p.stage === "Inspection Stage 3"));
      
      // Only apply special handling if it doesn't have Inspection Stage 3
      if (!hasInspectionStage3) {
        const updatedTank = { ...selectedTank } as ExtendedWaterTank;
        
        // For grouped tanks with sub-tanks
        if (updatedTank.isGrouped && updatedTank.subTanks) {
          const subTankIndex = updatedTank.currentSubTankIndex !== undefined ? updatedTank.currentSubTankIndex : 0;
          const subTank = updatedTank.subTanks[subTankIndex];
          
          if (subTank) {
            // Create copies to avoid direct state mutation
            const updatedSubTanks = [...updatedTank.subTanks];
            const updatedSubTank = { ...subTank };
            const updatedProgress = [...updatedSubTank.progress];
            
            // First mark Inspection Stage 2 as Completed
            const inspectionIndex = updatedProgress.findIndex(p => p.stage === "Inspection Stage 2");
            if (inspectionIndex !== -1) {
              updatedProgress[inspectionIndex] = { ...updatedProgress[inspectionIndex], status: "Completed" };
            }
            
            // Then mark Ladder Installation as In Progress
            const ladderIndex = updatedProgress.findIndex(p => p.stage === "Ladder Installation");
            if (ladderIndex !== -1) {
              updatedProgress[ladderIndex] = { ...updatedProgress[ladderIndex], status: "In Progress" };
            } else {
              // If not found, add it
              updatedProgress.push({ stage: "Ladder Installation", status: "In Progress" });
            }
            
            // Update the sub-tank with new progress
            updatedSubTank.progress = updatedProgress;
            updatedSubTank.currentStage = "Ladder Installation";
            
            // Update the sub-tanks array
            updatedSubTanks[subTankIndex] = updatedSubTank;
            
            // Update the parent tank
            updatedTank.subTanks = updatedSubTanks;
            updatedTank.currentStage = "Ladder Installation";
            
            // Update the selected tank state
            setSelectedTank(updatedTank);
            
            // Update the tank data based on which level it belongs to
            updateTankData(updatedTank);
            return;
          }
        }
        // For regular tanks (non-grouped)
        else {
          // Create a copy of the progress array
          const updatedProgress = [...updatedTank.progress];
          
          // First mark Inspection Stage 2 as Completed
          const inspectionIndex = updatedProgress.findIndex(p => p.stage === "Inspection Stage 2");
          if (inspectionIndex !== -1) {
            updatedProgress[inspectionIndex] = { ...updatedProgress[inspectionIndex], status: "Completed" };
          }
          
          // Then mark Ladder Installation as In Progress
          const ladderIndex = updatedProgress.findIndex(p => p.stage === "Ladder Installation");
          if (ladderIndex !== -1) {
            updatedProgress[ladderIndex] = { ...updatedProgress[ladderIndex], status: "In Progress" };
          } else {
            // If not found, add it
            updatedProgress.push({ stage: "Ladder Installation", status: "In Progress" });
          }
          
          // Update the tank with new progress
          updatedTank.progress = updatedProgress;
          updatedTank.currentStage = "Ladder Installation";
          
          // Update the selected tank state
          setSelectedTank(updatedTank);
          
          // Update the tank data based on which level it belongs to
          updateTankData(updatedTank);
          return;
        }
      }
    }

    // Special handling for Ladder Installation - just mark it as completed
    if (stage === "Ladder Installation") {
      const updatedTank = { ...selectedTank } as ExtendedWaterTank;
      
      // For grouped tanks with sub-tanks
      if (updatedTank.isGrouped && updatedTank.subTanks) {
        const subTankIndex = updatedTank.currentSubTankIndex !== undefined ? updatedTank.currentSubTankIndex : 0;
        const subTank = updatedTank.subTanks[subTankIndex];
        
        if (subTank) {
          // Create copies to avoid direct state mutation
          const updatedSubTanks = [...updatedTank.subTanks];
          const updatedSubTank = { ...subTank };
          const updatedProgress = [...updatedSubTank.progress];
          
          // Mark Ladder Installation as Completed
          const ladderIndex = updatedProgress.findIndex(p => p.stage === "Ladder Installation");
          if (ladderIndex !== -1) {
            updatedProgress[ladderIndex] = { ...updatedProgress[ladderIndex], status: "Completed" };
          } else {
            // If not found, add it as completed
            updatedProgress.push({ stage: "Ladder Installation", status: "Completed" });
          }
          
          // Update the sub-tank with new progress
          updatedSubTank.progress = updatedProgress;
          // Keep current stage as Ladder Installation
          updatedSubTank.currentStage = "Ladder Installation";
          
          // Update the sub-tanks array
          updatedSubTanks[subTankIndex] = updatedSubTank;
          
          // Update the parent tank
          updatedTank.subTanks = updatedSubTanks;
          updatedTank.currentStage = "Ladder Installation";
          
          // Update the selected tank state
          setSelectedTank(updatedTank);
          
          // Update the tank data based on which level it belongs to
          updateTankData(updatedTank);
          return;
        }
      }
      // For regular tanks (non-grouped)
      else {
        // Create a copy of the progress array
        const updatedProgress = [...updatedTank.progress];
        
        // Mark Ladder Installation as Completed
        const ladderIndex = updatedProgress.findIndex(p => p.stage === "Ladder Installation");
        if (ladderIndex !== -1) {
          updatedProgress[ladderIndex] = { ...updatedProgress[ladderIndex], status: "Completed" };
        } else {
          // If not found, add it as completed
          updatedProgress.push({ stage: "Ladder Installation", status: "Completed" });
        }
        
        // Update the tank with new progress
        updatedTank.progress = updatedProgress;
        // Keep current stage as Ladder Installation
        updatedTank.currentStage = "Ladder Installation";
        
        // Update the selected tank state
        setSelectedTank(updatedTank);
        
        // Update the tank data based on which level it belongs to
        updateTankData(updatedTank);
        return;
      }
    }

    // Normal processing for other stages
    // Clone the selected tank to avoid modifying state directly
    const updatedTank = { ...selectedTank } as ExtendedWaterTank;
    
    // If we're dealing with a sub-tank
    if (updatedTank.isGrouped && updatedTank.subTanks) {
      const subTankIndex = updatedTank.currentSubTankIndex !== undefined ? updatedTank.currentSubTankIndex : 0;
      
      // Get a reference to the current sub-tank
      const subTank = updatedTank.subTanks[subTankIndex];
      
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
          parentId: updatedTank.id,
          index: subTankIndex
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
          const updatedSubTanks = [...updatedTank.subTanks];
          updatedSubTanks[subTankIndex] = {
            ...updatedSubTank,
            progress: updatedProgress,
            currentStage: nextStage
          };
          
          // Update the selected tank with the updated sub-tanks
          updatedTank.subTanks = updatedSubTanks;
          
          // Mirror the active sub-tank's currentStage back to the parent tank
          updatedTank.currentStage = updatedSubTanks[subTankIndex].currentStage;
        } else {
          // This was the last stage, just mark it as completed
          // Create a copy of the sub-tanks array
          const updatedSubTanks = [...updatedTank.subTanks];
          updatedSubTanks[subTankIndex] = {
            ...updatedSubTank,
            progress: updatedProgress,
            // Keep the current stage as the last stage
            currentStage: stage
          };
          
          // Update the selected tank with the updated sub-tanks
          updatedTank.subTanks = updatedSubTanks;
          
          // Mirror the active sub-tank's currentStage back to the parent tank
          updatedTank.currentStage = updatedSubTanks[subTankIndex].currentStage;
        }
        
        // Update the selected tank state
        setSelectedTank(updatedTank);
        
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
        
        // Update the selected tank state to show changes immediately
        setSelectedTank(updatedTank);
        
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
    if (updatedTank.isGrouped && updatedTank.subTanks) {
      const subTankIndex = updatedTank.currentSubTankIndex !== undefined ? updatedTank.currentSubTankIndex : 0;
      
      // Get a reference to the current sub-tank
      const subTank = updatedTank.subTanks[subTankIndex];
      
      if (!subTank) return;
      
      // Clone the sub-tank and its progress array
      const updatedSubTank = { ...subTank };
      
      // Get applicable stages for this sub-tank
      const applicableStages = getApplicableStages({
        ...subTank, 
        isSubTank: true, 
        parentId: updatedTank.id,
        index: subTankIndex
      });
      
      // Find the stage index in applicable stages
      const stageIndex = applicableStages.indexOf(stageToUndo);
      
      if (stageIndex !== -1) {
        // Create a copy of the progress array
        let updatedProgress = [...updatedSubTank.progress];
        
        // Find the stage in progress array
        const stageProgressIndex = updatedProgress.findIndex(p => p.stage === stageToUndo);
        
        if (stageProgressIndex !== -1) {
          // Mark this stage as In Progress
          updatedProgress[stageProgressIndex] = { 
            ...updatedProgress[stageProgressIndex], 
            status: "In Progress" 
          };
          
          // Mark all subsequent stages as Not Started
          for (let i = stageProgressIndex + 1; i < updatedProgress.length; i++) {
            updatedProgress[i] = { ...updatedProgress[i], status: "Not Started" };
          }
          
          // Set this stage as the current stage
          const newCurrentStage = applicableStages[stageIndex];
          
          // Create a copy of the sub-tanks array
          const updatedSubTanks = [...updatedTank.subTanks];
          
          updatedSubTanks[subTankIndex] = {
            ...updatedSubTank,
            progress: updatedProgress,
            currentStage: newCurrentStage
          };
          
          // Update the selected tank with the updated sub-tanks
          updatedTank.subTanks = updatedSubTanks;
          
          // Mirror the active sub-tank's currentStage back to the parent tank
          updatedTank.currentStage = updatedSubTanks[subTankIndex].currentStage;
          
          // Update the selected tank state to show changes immediately
          setSelectedTank(updatedTank);
          
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
        // Find the stage in the progress array
        const stageProgressIndex = updatedTank.progress.findIndex(p => p.stage === stageToUndo);
        
        if (stageProgressIndex !== -1) {
          // Create a copy of the progress array
          const updatedProgress = [...updatedTank.progress];
          
          // Mark this stage as In Progress
          updatedProgress[stageProgressIndex] = { 
            ...updatedProgress[stageProgressIndex], 
            status: "In Progress" 
          };
          
          // Mark all subsequent stages as Not Started
          for (let i = stageProgressIndex + 1; i < updatedProgress.length; i++) {
            updatedProgress[i] = { ...updatedProgress[i], status: "Not Started" };
          }
          
          // Set this stage as the current stage
          updatedTank.progress = updatedProgress;
          updatedTank.currentStage = stageToUndo;
          
          // Update the selected tank state to show changes immediately
          setSelectedTank(updatedTank);
          
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
                    activeSection === "N20" ? "n20Tanks" :
                    activeSection === "N30" ? "n30Tanks" : null;
    
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
    } else if (activeSection === "N30") {
      setN30TanksData((prev) => ({
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

  // Helper function to check if a tank has completed ladder installation
  const hasCompletedLadderInstallation = (tank: WaterTank) => {
    // For grouped tanks with sub-tanks
    if (tank.isGrouped && tank.subTanks && tank.subTanks.length > 0) {
      // Check if ALL sub-tanks have completed ladder installation
      return tank.subTanks.every(subTank => {
        const ladderInstallation = subTank.progress.find(p => p.stage === "Ladder Installation");
        return ladderInstallation?.status === "Completed";
      });
    }
    
    // For regular tanks
    const ladderInstallation = tank.progress.find(p => p.stage === "Ladder Installation");
    return ladderInstallation?.status === "Completed";
  };

  // Render the tank map boxes for the active section
  const renderTankBoxes = (tanks: Record<string, WaterTank>) => {
    return Object.values(tanks).map((tank) => {
      const position = getScaledPosition(tank.coordinates.top, tank.coordinates.left, activeSection || "N00");
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
            className={`${getTankColor(tank)} cursor-pointer hover:opacity-80 transition-opacity border border-black relative`}
            style={{
              width: `${tank.coordinates.width}px`,
              height: `${tank.coordinates.height}px`,
            }}
            onClick={() => handleTankClick(tank.id)}
          >
            {/* Yellow circle indicator for completed ladder installation */}
            {hasCompletedLadderInstallation(tank) && (
              <div 
                className="absolute bg-yellow-400 rounded-full"
                style={{
                  width: '10px',
                  height: '10px',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  border: '1px solid rgba(0, 0, 0, 0.3)',
                  zIndex: 10
                }}
              />
            )}
          </div>
          <div className="text-[8px] font-bold mt-1 text-black whitespace-nowrap">{tank.type}</div>
        </div>
      );
    });
  };

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
                  {renderTankBoxes(n00TanksData)}
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
                  {renderTankBoxes(n10TanksData)}
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
                  {renderTankBoxes(n20TanksData)}
                </div>
              </div>
            )}

            {activeSection === "N30" && (
              <div className="overflow-auto">
                <div className="relative" style={{ width: "1280px", height: "900px" }}>
                  <Image 
                    src="/images/n10.jpg" 
                    alt="N30 Level Map (using N10 background)" 
                    width={1280} 
                    height={900} 
                    className="w-full h-auto"
                    style={{ maxWidth: "none" }}
                  />
                  {/* Render clickable boxes for each tank */}
                  {renderTankBoxes(n30TanksData)}
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
      <TankDetails
        tank={selectedTank}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onToggleStage={toggleTaskCompletion}
        onConfirmUndo={undoTask}
        stageToUndo={stageToUndo}
        confirmDialogOpen={confirmDialogOpen}
        onConfirmDialogClose={() => setConfirmDialogOpen(false)}
        onSubTankSwitch={handleSubTankSwitch}
      />

      {/* Ready for Inspection Dialog */}
      <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tanks Ready for Inspection</DialogTitle>
            <DialogDescription>
              The following tanks are ready for inspection
            </DialogDescription>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dwall Anchorage Removal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dwall Anchorage Waterproofing</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filling Dwall Openings</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pump Anchors</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slope</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Stage 1</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waterproofing Walls and Floor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waterproofing Only Walls</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Stage 2</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waterproofing Only Floor</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspection Stage 3</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ladder Installation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {getAllTanks().map((tank: any, i: number) => {
                  const tankId = tank.id;
                  const parentInfo = tank.isSubTank ? tank.parentName : "-";
                  
                  // Get each stage status with applicable flag
                  const formwork = getTankStageStatus(tank, "Formwork Removal");
                  const repair = getTankStageStatus(tank, "Repair and Cleaning");
                  const dwallRemoval = getTankStageStatus(tank, "Dwall anchorage removal");
                  const dwallWaterproofing = getTankStageStatus(tank, "Dwall anchorage waterproofing");
                  const groutOpenings = getTankStageStatus(tank, "Grout openings in wall");
                  const pump = getTankStageStatus(tank, "Pump Anchors");
                  const slope = getTankStageStatus(tank, "Slope");
                  const inspection1 = getTankStageStatus(tank, "Inspection Stage 1");
                  const waterproofing = getTankStageStatus(tank, "Waterproofing");
                  const waterproofingWalls = getTankStageStatus(tank, "Waterproofing of walls");
                  const inspection2 = getTankStageStatus(tank, "Inspection Stage 2");
                  const waterproofingFloor = getTankStageStatus(tank, "Waterproofing of floor");
                  const inspection3 = getTankStageStatus(tank, "Inspection Stage 3");
                  const ladderInstallation = getTankStageStatus(tank, "Ladder Installation");
                  
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
                      <td className={getCellClass(dwallRemoval)}>{dwallRemoval.status}</td>
                      <td className={getCellClass(dwallWaterproofing)}>{dwallWaterproofing.status}</td>
                      <td className={getCellClass(groutOpenings)}>{groutOpenings.status}</td>
                      <td className={getCellClass(pump)}>{pump.status}</td>
                      <td className={getCellClass(slope)}>{slope.status}</td>
                      <td className={getCellClass(inspection1)}>{inspection1.status}</td>
                      <td className={getCellClass(waterproofing)}>{waterproofing.status}</td>
                      <td className={getCellClass(waterproofingWalls)}>{waterproofingWalls.status}</td>
                      <td className={getCellClass(inspection2)}>{inspection2.status}</td>
                      <td className={getCellClass(waterproofingFloor)}>{waterproofingFloor.status}</td>
                      <td className={getCellClass(inspection3)}>{inspection3.status}</td>
                      <td className={getCellClass(ladderInstallation)}>{ladderInstallation.status}</td>
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

