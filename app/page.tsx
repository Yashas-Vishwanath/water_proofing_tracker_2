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

  // State for tanks data
  const [n00TanksData, setN00TanksData] = useState<Record<string, WaterTank>>(n00Tanks)
  const [n10TanksData, setN10TanksData] = useState<Record<string, WaterTank>>(n10Tanks)
  const [n20TanksData, setN20TanksData] = useState<Record<string, WaterTank>>(n20Tanks)
  const [initializing, setInitializing] = useState(false)

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
        setLoading(true)
        const response = await fetch('/api/tasks')
        
        if (response.ok) {
          const data = await response.json()
          // Update state with data from API
          if (data.n00Tanks && Object.keys(data.n00Tanks).length > 0) setN00TanksData(data.n00Tanks)
          if (data.n10Tanks && Object.keys(data.n10Tanks).length > 0) setN10TanksData(data.n10Tanks)
          if (data.n20Tanks && Object.keys(data.n20Tanks).length > 0) setN20TanksData(data.n20Tanks)
        } else {
          console.log("API returned non-OK status, initializing with default data")
          // If API fails, initialize with default data and save it to the API
          setInitializing(true)
          await saveTanksData()
          setInitializing(false)
        }
      } catch (error) {
        console.error("Error fetching tasks data:", error)
        // On error, initialize with default data and save it to the API
        setInitializing(true)
        await saveTanksData()
        setInitializing(false)
      } finally {
        setLoading(false)
      }
    }

    fetchTasksData()
  }, [])

  // Function to save all tanks data to the API
  const saveTanksData = async () => {
    try {
      const tasksData = {
        n00Tanks: n00TanksData,
        n10Tanks: n10TanksData,
        n20Tanks: n20TanksData
      }

      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tasksData)
      })
    } catch (error) {
      console.error("Error saving tasks data:", error)
    }
  }

  // Function to get tank color based on status
  const getTankColor = (tank: WaterTank) => {
    // Check if all tasks are completed
    const allCompleted = tank.progress.every((p) => p.status === "Completed")
    if (allCompleted) {
      return "bg-green-600" // Green for completed tanks
    }

    // Check if in inspection stage
    const isInspection = tank.currentStage === "Inspection Stage 1" || tank.currentStage === "Inspection Stage 2"
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
    // Get all tanks data
    const allTanks = [
      ...Object.values(n00TanksData).map((tank) => ({ ...tank, level: "N00" })),
      ...Object.values(n10TanksData).map((tank) => ({ ...tank, level: "N10" })),
      ...Object.values(n20TanksData).map((tank) => ({ ...tank, level: "N20" })),
    ]

    // Since we're having issues with the Excel library, let's use a more reliable approach
    // We'll create an HTML table and open it in a new window for printing/saving
    let tableHtml = `
    <html>
    <head>
      <title>Water Tanks Progress</title>
      <style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; position: sticky; top: 0; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .completed { background-color: #d4edda; }
        .in-progress { background-color: #fff3cd; }
        .export-bar { 
          position: fixed; 
          top: 0; 
          left: 0; 
          right: 0; 
          background: #333; 
          color: white; 
          padding: 10px; 
          text-align: center;
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
        @media print {
          .export-bar { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="export-bar">
        <button onclick="window.print()">Print</button>
        <button onclick="window.close()">Close</button>
      </div>
      <h1>Water Tanks Progress Report</h1>
      <table>
        <thead>
          <tr>
            <th>Level</th>
            <th>Type of Tank</th>
            <th>ID</th>
  `

    // Add headers for each progress stage
    allProgressStages.forEach((stage) => {
      tableHtml += `<th>${stage}</th>`
    })

    tableHtml += `
          </tr>
        </thead>
        <tbody>
  `

    // Add rows for each tank
    allTanks.forEach((tank) => {
      tableHtml += `<tr>
      <td>${tank.level}</td>
      <td>${tank.type}</td>
      <td>${tank.id}</td>
    `

      // Add cells for each progress stage
      tank.progress.forEach((progress) => {
        const cellClass =
          progress.status === "Completed" ? "completed" : progress.status === "In Progress" ? "in-progress" : ""

        tableHtml += `<td class="${cellClass}">${progress.status}</td>`
      })

      tableHtml += `</tr>`
    })

    tableHtml += `
        </tbody>
      </table>
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

  // Add these helper functions for the CSV fallback
  const generateCsvContent = () => {
    const allTanks = [
      ...Object.values(n00TanksData).map((tank) => ({ ...tank, level: "N00" })),
      ...Object.values(n10TanksData).map((tank) => ({ ...tank, level: "N10" })),
      ...Object.values(n20TanksData).map((tank) => ({ ...tank, level: "N20" })),
    ]

    let csvContent =
      "Level,Type of Tank,ID,Formwork Removal,Repair and Cleaning,Pump Anchors,Slope,Inspection Stage 1,Waterproofing,Inspection Stage 2\n"

    allTanks.forEach((tank) => {
      const formworkStatus = tank.progress.find((p) => p.stage === "Formwork Removal")?.status || "Not Started"
      const repairStatus = tank.progress.find((p) => p.stage === "Repair and Cleaning")?.status || "Not Started"
      const pumpStatus = tank.progress.find((p) => p.stage === "Pump Anchors")?.status || "Not Started"
      const slopeStatus = tank.progress.find((p) => p.stage === "Slope")?.status || "Not Started"
      const inspection1Status = tank.progress.find((p) => p.stage === "Inspection Stage 1")?.status || "Not Started"
      const waterproofingStatus = tank.progress.find((p) => p.stage === "Waterproofing")?.status || "Not Started"
      const inspection2Status = tank.progress.find((p) => p.stage === "Inspection Stage 2")?.status || "Not Started"

      csvContent += `${tank.level},${tank.type},${tank.id},${formworkStatus},${repairStatus},${pumpStatus},${slopeStatus},${inspection1Status},${waterproofingStatus},${inspection2Status}\n`
    })

    return csvContent
  }

  const downloadCsvFile = (csvContent: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "WaterTankTracker.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Update the handleReadyForInspection function to open the dialog
  const handleReadyForInspection = () => {
    setIsInspectionDialogOpen(true)
  }

  // Add a function to get all manholes that are ready for inspection
  const getTanksReadyForInspection = () => {
    // Helper function to check if all stages are completed
    const isFullyCompleted = (tank: WaterTank) => {
      return tank.progress.every(p => p.status === "Completed");
    };

    const n00Ready = Object.values(n00TanksData).filter(
      (tank) => (tank.currentStage === "Inspection Stage 1" || tank.currentStage === "Inspection Stage 2") && 
                !isFullyCompleted(tank)
    );

    const n10Ready = Object.values(n10TanksData).filter(
      (tank) => (tank.currentStage === "Inspection Stage 1" || tank.currentStage === "Inspection Stage 2") && 
                !isFullyCompleted(tank)
    );

    const n20Ready = Object.values(n20TanksData).filter(
      (tank) => (tank.currentStage === "Inspection Stage 1" || tank.currentStage === "Inspection Stage 2") && 
                !isFullyCompleted(tank)
    );

    return {
      n00: n00Ready,
      n10: n10Ready,
      n20: n20Ready,
      n30: [], // No tanks in N30 yet
    }
  }

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
    if (!selectedTank) return

    // Find the stage index
    const stageIndex = allProgressStages.findIndex((s) => s === stage)
    if (stageIndex === -1) return

    // Check if we're dealing with a grouped tank or a regular tank
    if (selectedTank.isGrouped && selectedTank.subTanks && selectedTank.currentSubTankIndex !== undefined) {
      // We're dealing with a specific sub-tank in a grouped tank
      // Get current status from the sub-tank
      const subTank = selectedTank.subTanks[selectedTank.currentSubTankIndex]
      const currentStatus = subTank.progress.find((p) => p.stage === stage)?.status

      if (currentStatus === "Completed") {
        // If trying to undo a completed task
        setStageToUndo(stage)
        setConfirmDialogOpen(true)
      } else {
        // Mark task as completed
        markTaskAsCompleted(stage)
      }
    } else {
      // Regular tank handling
      // Get current status
      const currentStatus = selectedTank.progress.find((p) => p.stage === stage)?.status

      if (currentStatus === "Completed") {
        // If trying to undo a completed task
        setStageToUndo(stage)
        setConfirmDialogOpen(true)
      } else {
        // Mark task as completed
        markTaskAsCompleted(stage)
      }
    }
  }

  // Function to mark a task as completed
  const markTaskAsCompleted = (stage: ProgressStage) => {
    if (!selectedTank) return

    // Find the stage index
    const stageIndex = allProgressStages.findIndex((s) => s === stage)
    if (stageIndex === -1) return

    // Check if we're dealing with a grouped tank or a regular tank
    if (selectedTank.isGrouped && selectedTank.subTanks && selectedTank.currentSubTankIndex !== undefined) {
      // We're dealing with a specific sub-tank in a grouped tank
      const subTankIndex = selectedTank.currentSubTankIndex
      const subTank = { ...selectedTank.subTanks[subTankIndex] }
      
      // Update the sub-tank's progress
      const updatedProgress = [...subTank.progress]

      // First, set all stages to "Not Started" or "Completed"
      // This ensures no multiple "In Progress" tasks
      updatedProgress.forEach((p, i) => {
        if (p.status === "In Progress" && i !== stageIndex) {
          updatedProgress[i] = {
            ...updatedProgress[i],
            status: i < stageIndex ? "Completed" : "Not Started",
          }
        }
      })

      // Mark the current stage as completed
      updatedProgress[stageIndex] = {
        ...updatedProgress[stageIndex],
        status: "Completed",
      }

      // If there's a next stage, mark it as in progress
      if (stageIndex < updatedProgress.length - 1) {
        updatedProgress[stageIndex + 1] = {
          ...updatedProgress[stageIndex + 1],
          status: "In Progress",
        }
      }

      // Update the sub-tank's current stage
      const nextStage =
        stageIndex < allProgressStages.length - 1 ? allProgressStages[stageIndex + 1] : allProgressStages[stageIndex]

      // Update the sub-tank
      const updatedSubTank = {
        ...subTank,
        progress: updatedProgress,
        currentStage: nextStage,
      }

      // Create a copy of all sub-tanks
      const updatedSubTanks = [...selectedTank.subTanks]
      // Update the specific sub-tank
      updatedSubTanks[subTankIndex] = updatedSubTank

      // Create updated grouped tank
      const updatedTank = {
        ...selectedTank,
        subTanks: updatedSubTanks,
        // Also update the progress array that was temporarily copied to the parent
        progress: updatedProgress,
      }

      // Update the appropriate tanks data state
      updateTankData(updatedTank)

      // Update selected tank
      setSelectedTank(updatedTank)
    } else {
      // Regular tank handling
      // Update the tank's progress
      const updatedProgress = [...selectedTank.progress]

      // First, set all stages to "Not Started" or "Completed"
      // This ensures no multiple "In Progress" tasks
      updatedProgress.forEach((p, i) => {
        if (p.status === "In Progress" && i !== stageIndex) {
          updatedProgress[i] = {
            ...updatedProgress[i],
            status: i < stageIndex ? "Completed" : "Not Started",
          }
        }
      })

      // Mark the current stage as completed
      updatedProgress[stageIndex] = {
        ...updatedProgress[stageIndex],
        status: "Completed",
      }

      // If there's a next stage, mark it as in progress
      if (stageIndex < updatedProgress.length - 1) {
        updatedProgress[stageIndex + 1] = {
          ...updatedProgress[stageIndex + 1],
          status: "In Progress",
        }
      }

      // Update the tank's current stage
      const nextStage =
        stageIndex < allProgressStages.length - 1 ? allProgressStages[stageIndex + 1] : allProgressStages[stageIndex]

      // Create updated tank
      const updatedTank = {
        ...selectedTank,
        progress: updatedProgress,
        currentStage: nextStage,
      }

      // Update the appropriate tanks data state
      updateTankData(updatedTank)

      // Update selected tank
      setSelectedTank(updatedTank)
    }
  }

  // Function to undo a task
  const undoTask = () => {
    if (!selectedTank || !stageToUndo) return

    // Find the stage index
    const stageIndex = allProgressStages.findIndex((s) => s === stageToUndo)
    if (stageIndex === -1) return

    // Check if we're dealing with a grouped tank or a regular tank
    if (selectedTank.isGrouped && selectedTank.subTanks && selectedTank.currentSubTankIndex !== undefined) {
      // We're dealing with a specific sub-tank in a grouped tank
      const subTankIndex = selectedTank.currentSubTankIndex
      const subTank = { ...selectedTank.subTanks[subTankIndex] }

      // Update the sub-tank's progress
      const updatedSubTankProgress = [...subTank.progress]

      // Mark the current stage and all subsequent stages as not started
      for (let i = stageIndex; i < updatedSubTankProgress.length; i++) {
        updatedSubTankProgress[i] = {
          ...updatedSubTankProgress[i],
          status: i === stageIndex ? "In Progress" : "Not Started",
        }
      }

      // Update the sub-tank
      const updatedSubTank = {
        ...subTank,
        progress: updatedSubTankProgress,
        currentStage: stageToUndo,
      }

      // Create a copy of all sub-tanks
      const updatedSubTanks = [...selectedTank.subTanks]
      // Update the specific sub-tank
      updatedSubTanks[subTankIndex] = updatedSubTank

      // Create updated grouped tank
      const updatedGroupedTank = {
        ...selectedTank,
        subTanks: updatedSubTanks,
        // Also update the progress array that was temporarily copied to the parent
        progress: updatedSubTankProgress,
      }

      // Update the appropriate tanks data state
      updateTankData(updatedGroupedTank)

      // Update selected tank
      setSelectedTank(updatedGroupedTank)
    } else {
      // Regular tank handling - existing code
      // Update the tank's progress
      const updatedProgress = [...selectedTank.progress]

      // Mark the current stage and all subsequent stages as not started
      for (let i = stageIndex; i < updatedProgress.length; i++) {
        updatedProgress[i] = {
          ...updatedProgress[i],
          status: i === stageIndex ? "In Progress" : "Not Started",
        }
      }

      // Update the tank's current stage
      const updatedTank = {
        ...selectedTank,
        progress: updatedProgress,
        currentStage: stageToUndo,
      }

      // Update the appropriate tanks data state
      updateTankData(updatedTank)

      // Update selected tank
      setSelectedTank(updatedTank)
    }

    // Close the confirm dialog
    setConfirmDialogOpen(false)
    setStageToUndo(null)
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

  // Get all tanks for the spreadsheet
  const getAllTanks = () => {
    return [
      ...Object.values(n00TanksData).map((tank) => ({ ...tank, level: "N00" })),
      ...Object.values(n10TanksData).map((tank) => ({ ...tank, level: "N10" })),
      ...Object.values(n20TanksData).map((tank) => ({ ...tank, level: "N20" })),
    ]
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
              {selectedTank.subTanks.map((subTank, index) => (
                <div key={subTank.id} className="border rounded-lg p-4 bg-gray-50 flex-1 min-w-[250px]">
                  <h3 className="font-semibold text-lg mb-2">{subTank.name}</h3>
                  <div className="grid gap-2">
                    {subTank.progress.map((stage, stageIndex) => {
                      // Determine if this is the current ongoing task
                      const isCurrentTask = stage.status === "In Progress";
                      
                      return (
                        <div
                          key={`${subTank.id}-${stage.stage}`}
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
              ))}
            </div>
          ) : (
            // Regular non-grouped tank
            <div className="grid gap-2 py-4">
              {selectedTank?.progress.map((stage, index) => {
                // Determine if this is the current ongoing task
                const isCurrentTask = stage.status === "In Progress"

                return (
                  <div
                    key={stage.stage}
                    className={`flex items-center gap-3 py-2 px-3 rounded-md cursor-pointer ${isCurrentTask ? "bg-blue-100" : ""}`}
                    onClick={() => toggleTaskCompletion(stage.stage)}
                  >
                    <div
                      className={`w-6 h-6 border rounded-md flex items-center justify-center ${stage.status === "Completed" ? "bg-green-500 border-green-500" : "border-gray-400"}`}
                    >
                      {stage.status === "Completed" && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <div className="flex-1">{stage.stage}</div>
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
            <DialogTitle>Water Tanks Progress Spreadsheet</DialogTitle>
            <DialogDescription>Overview of all water tanks and their progress stages</DialogDescription>
          </DialogHeader>
          <div className="py-4 overflow-auto max-h-[70vh]">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border border-gray-300 sticky top-0 bg-gray-100">Level</th>
                  <th className="p-2 border border-gray-300 sticky top-0 bg-gray-100">Type of Tank</th>
                  <th className="p-2 border border-gray-300 sticky top-0 bg-gray-100">ID</th>
                  {allProgressStages.map((stage) => (
                    <th key={stage} className="p-2 border border-gray-300 sticky top-0 bg-gray-100">
                      {stage}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getAllTanks().map((tank, index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-2 border border-gray-300">{tank.level}</td>
                    <td className="p-2 border border-gray-300">{tank.type}</td>
                    <td className="p-2 border border-gray-300">{tank.id}</td>
                    {tank.progress.map((progress, i) => (
                      <td
                        key={i}
                        className={`p-2 border border-gray-300 ${
                          progress.status === "Completed"
                            ? "bg-green-100"
                            : progress.status === "In Progress"
                              ? "bg-yellow-100"
                              : ""
                        }`}
                      >
                        {progress.status}
                      </td>
                    ))}
                  </tr>
                ))}
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

