"use client"

import { ChevronDown, FileSpreadsheet, Check, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { useState } from "react"

// Types for our water tank data
type ProgressStage =
  | "Formwork Removal"
  | "Repair and Cleaning"
  | "Pump Anchors"
  | "Slope"
  | "Inspection Stage 1"
  | "Waterproofing"
  | "Inspection Stage 2"

type ProgressStatus = "Not Started" | "In Progress" | "Completed"

type StageProgress = {
  stage: ProgressStage
  status: ProgressStatus
}

type TankType = "SEWAGE WATER" | "RAIN WATER" | "CHILLER ROOM"

type WaterTank = {
  id: string
  name: string
  location: string
  currentStage: ProgressStage
  progress: StageProgress[]
  coordinates: {
    top: number
    left: number
    width: number
    height: number
  }
  type: TankType
}

// Define all possible progress stages in order
const allProgressStages: ProgressStage[] = [
  "Formwork Removal",
  "Repair and Cleaning",
  "Pump Anchors",
  "Slope",
  "Inspection Stage 1",
  "Waterproofing",
  "Inspection Stage 2",
]

// Update the tank data for N00 level with correct tank IDs and positions based on the new image
const n00Tanks: Record<string, WaterTank> = {
  "PBF-S3-03": {
    id: "PBF-S3-03",
    name: "SEWAGE WATER | PBF-S3-03",
    location: "West Section",
    currentStage: "Waterproofing",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Inspection Stage 2" ? "Not Started" : stage === "Waterproofing" ? "In Progress" : "Completed",
    })),
    coordinates: {
      top: 398,
      left: 90,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBF-S3-02": {
    id: "PBF-S3-02",
    name: "SEWAGE WATER | PBF-S3-02",
    location: "Center",
    currentStage: "Inspection Stage 1",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors", "Slope"].includes(stage)
        ? "Completed"
        : stage === "Inspection Stage 1"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 525,
      left: 500,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBF-S3-01": {
    id: "PBF-S3-01",
    name: "SEWAGE WATER | PBF-S3-01",
    location: "East Section",
    currentStage: "Repair and Cleaning",
    progress: allProgressStages.map((stage) => ({
      stage,
      status:
        stage === "Formwork Removal" ? "Completed" : stage === "Repair and Cleaning" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 423,
      left: 660,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "CHILLER-ROOM-INSIDE": {
    id: "CHILLER-ROOM-INSIDE",
    name: "SEWAGE WATER | CHILLER ROOM INSIDE",
    location: "Far East",
    currentStage: "Slope",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors"].includes(stage)
        ? "Completed"
        : stage === "Slope"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 535,
      left: 1000,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "GARDENTONA-SMALL": {
    id: "GARDENTONA-SMALL",
    name: "RAIN WATER | GARDENTONA SMALL",
    location: "Top Center",
    currentStage: "Waterproofing",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Inspection Stage 2" ? "Not Started" : stage === "Waterproofing" ? "In Progress" : "Completed",
    })),
    coordinates: {
      top: 390,
      left: 500,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "GARDENTONA-BIG": {
    id: "GARDENTONA-BIG",
    name: "RAIN WATER | GARDENTONA BIG",
    location: "Center Right",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 450,
      left: 576,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "CHILLER-ROOM-OUTSIDE": {
    id: "CHILLER-ROOM-OUTSIDE",
    name: "CHILLER ROOM OUTSIDE",
    location: "Bottom Right",
    currentStage: "Inspection Stage 1",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors", "Slope"].includes(stage)
        ? "Completed"
        : stage === "Inspection Stage 1"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 620,
      left: 1000,
      width: 20,
      height: 20,
    },
    type: "CHILLER ROOM",
  },
}

// Update the tank data for N10 level with correct tank IDs and positions based on the new image
const n10Tanks: Record<string, WaterTank> = {
  "PBF-S2-01": {
    id: "PBF-S2-01",
    name: "SEWAGE WATER | PBF-S2-01",
    location: "Bottom Right",
    currentStage: "Waterproofing",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Inspection Stage 2" ? "Not Started" : stage === "Waterproofing" ? "In Progress" : "Completed",
    })),
    coordinates: {
      top: 590,
      left: 890,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBF-S2-11": {
    id: "PBF-S2-11",
    name: "SEWAGE WATER | PBF-S2-11",
    location: "Middle Left",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 240,
      left: 310,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBF-S2-12": {
    id: "PBF-S2-12",
    name: "SEWAGE WATER | PBF-S2-12",
    location: "Left",
    currentStage: "Pump Anchors",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning"].includes(stage)
        ? "Completed"
        : stage === "Pump Anchors"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 320,
      left: 270,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBF-S2-13": {
    id: "PBF-S2-13",
    name: "SEWAGE WATER | PBF-S2-13",
    location: "Bottom Left",
    currentStage: "Inspection Stage 1",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors", "Slope"].includes(stage)
        ? "Completed"
        : stage === "Inspection Stage 1"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 440,
      left: 285,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-04": {
    id: "S2-PB-04",
    name: "SEWAGE WATER | S2-PB-04",
    location: "Top Center",
    currentStage: "Slope",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors"].includes(stage)
        ? "Completed"
        : stage === "Slope"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 85,
      left: 535,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-05": {
    id: "S2-PB-05",
    name: "SEWAGE WATER | S2-PB-05",
    location: "Top Left",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 135,
      left: 435,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-03": {
    id: "S2-PB-03",
    name: "SEWAGE WATER | S2-PB-03",
    location: "Top Right",
    currentStage: "Repair and Cleaning",
    progress: allProgressStages.map((stage) => ({
      stage,
      status:
        stage === "Formwork Removal" ? "Completed" : stage === "Repair and Cleaning" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 130,
      left: 745,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-06": {
    id: "S2-PB-06",
    name: "SEWAGE WATER | S2-PB-06",
    location: "Bottom Center",
    currentStage: "Waterproofing",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Inspection Stage 2" ? "Not Started" : stage === "Waterproofing" ? "In Progress" : "Completed",
    })),
    coordinates: {
      top: 585,
      left: 485,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-07": {
    id: "S2-PB-07",
    name: "SEWAGE WATER | S2-PB-07",
    location: "Bottom Center-Right",
    currentStage: "Repair and Cleaning",
    progress: allProgressStages.map((stage) => ({
      stage,
      status:
        stage === "Formwork Removal" ? "Completed" : stage === "Repair and Cleaning" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 645,
      left: 810,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "PBP-S2-01": {
    id: "PBP-S2-01",
    name: "SEWAGE WATER | PBP-S2-01",
    location: "Bottom Center",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 745,
      left: 670,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
  "S2-PB-15": {
    id: "S2-PB-15",
    name: "SEWAGE WATER | S2-PB-15",
    location: "Bottom Center",
    currentStage: "Inspection Stage 1",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors", "Slope"].includes(stage)
        ? "Completed"
        : stage === "Inspection Stage 1"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 790,
      left: 670,
      width: 20,
      height: 20,
    },
    type: "SEWAGE WATER",
  },
}

// Update the tank data for N20 level with correct tank IDs and positions based on the new image
const n20Tanks: Record<string, WaterTank> = {
  "PBF-S1-05": {
    id: "PBF-S1-05",
    name: "RAIN WATER | PBF-S1-05",
    location: "Top Left",
    currentStage: "Inspection Stage 1",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors", "Slope"].includes(stage)
        ? "Completed"
        : stage === "Inspection Stage 1"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 140,
      left: 520,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "PBF-S1-04": {
    id: "PBF-S1-04",
    name: "RAIN WATER | PBF-S1-04",
    location: "Top Right",
    currentStage: "Slope",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: ["Formwork Removal", "Repair and Cleaning", "Pump Anchors"].includes(stage)
        ? "Completed"
        : stage === "Slope"
          ? "In Progress"
          : "Not Started",
    })),
    coordinates: {
      top: 140,
      left: 740,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "PBF-S1-03": {
    id: "PBF-S1-03",
    name: "RAIN WATER | PBF-S1-03",
    location: "Middle Left",
    currentStage: "Waterproofing",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Inspection Stage 2" ? "Not Started" : stage === "Waterproofing" ? "In Progress" : "Completed",
    })),
    coordinates: {
      top: 440,
      left: 180,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "PBF-S1-02": {
    id: "PBF-S1-02",
    name: "RAIN WATER | PBF-S1-02",
    location: "Bottom Left",
    currentStage: "Repair and Cleaning",
    progress: allProgressStages.map((stage) => ({
      stage,
      status:
        stage === "Formwork Removal" ? "Completed" : stage === "Repair and Cleaning" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 600,
      left: 180,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
  "PBF-S1-08": {
    id: "PBF-S1-08",
    name: "RAIN WATER | PBF-S1-08",
    location: "Bottom Right",
    currentStage: "Formwork Removal",
    progress: allProgressStages.map((stage) => ({
      stage,
      status: stage === "Formwork Removal" ? "In Progress" : "Not Started",
    })),
    coordinates: {
      top: 640,
      left: 1120,
      width: 20,
      height: 20,
    },
    type: "RAIN WATER",
  },
}

export default function ConstructionTracker() {
  // State for active section and tank
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [selectedTank, setSelectedTank] = useState<WaterTank | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isWaterTanksOpen, setIsWaterTanksOpen] = useState(false)
  const [isMechanicalPitsOpen, setIsMechanicalPitsOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [stageToUndo, setStageToUndo] = useState<ProgressStage | null>(null)

  // State for tanks data
  const [n00TanksData, setN00TanksData] = useState(n00Tanks)
  const [n10TanksData, setN10TanksData] = useState(n10Tanks)
  const [n20TanksData, setN20TanksData] = useState(n20Tanks)

  // Add a new state for the inspection dialog
  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false)

  // Add a new state for the spreadsheet dialog
  const [isSpreadsheetDialogOpen, setIsSpreadsheetDialogOpen] = useState(false)

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

  const downloadCsvFile = (csvContent) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "water_tanks_progress.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Add this type declaration for the global XLSX object
  declare global {
    interface Window {
      XLSX: any
    }
  }

  // Update the handleReadyForInspection function to open the dialog
  const handleReadyForInspection = () => {
    setIsInspectionDialogOpen(true)
  }

  // Add a function to get all tanks that are ready for inspection
  const getTanksReadyForInspection = () => {
    const n00Ready = Object.values(n00TanksData).filter(
      (tank) => tank.currentStage === "Inspection Stage 1" || tank.currentStage === "Inspection Stage 2",
    )

    const n10Ready = Object.values(n10TanksData).filter(
      (tank) => tank.currentStage === "Inspection Stage 1" || tank.currentStage === "Inspection Stage 2",
    )

    const n20Ready = Object.values(n20TanksData).filter(
      (tank) => tank.currentStage === "Inspection Stage 1" || tank.currentStage === "Inspection Stage 2",
    )

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

  // Function to mark a task as completed
  const markTaskAsCompleted = (stage: ProgressStage) => {
    if (!selectedTank) return

    // Find the stage index
    const stageIndex = allProgressStages.findIndex((s) => s === stage)
    if (stageIndex === -1) return

    // Update the tank's progress
    const updatedProgress = [...selectedTank.progress]

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

  // Function to undo a task
  const undoTask = () => {
    if (!selectedTank || !stageToUndo) return

    // Find the stage index
    const stageIndex = allProgressStages.findIndex((s) => s === stageToUndo)
    if (stageIndex === -1) return

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

    // Close the confirm dialog
    setConfirmDialogOpen(false)
    setStageToUndo(null)
  }

  // Function to update tank data in the appropriate state
  const updateTankData = (updatedTank: WaterTank) => {
    if (activeSection === "N00") {
      setN00TanksData((prev) => ({
        ...prev,
        [updatedTank.id]: updatedTank,
      }))
    } else if (activeSection === "N10") {
      setN10TanksData((prev) => ({
        ...prev,
        [updatedTank.id]: updatedTank,
      }))
    } else if (activeSection === "N20") {
      setN20TanksData((prev) => ({
        ...prev,
        [updatedTank.id]: updatedTank,
      }))
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

        <div className="relative w-full">
          {activeSection === "N00" && (
            <div className="overflow-auto">
              <div className="relative" style={{ width: "1280px", height: "900px" }}>
                <Image
                  src="/images/N00-1.png"
                  alt="N00 Level Map"
                  width={1280}
                  height={900}
                  className="w-full h-auto"
                  style={{ maxWidth: "none" }}
                />
                {/* Render clickable boxes for each tank */}
                {Object.values(n00TanksData).map((tank) => (
                  <div
                    key={tank.id}
                    className="absolute"
                    style={{
                      top: `${tank.coordinates.top}px`,
                      left: `${tank.coordinates.left}px`,
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
                ))}
              </div>
            </div>
          )}

          {activeSection === "N10" && (
            <div className="overflow-auto">
              <div className="relative" style={{ width: "1280px", height: "900px" }}>
                <Image 
                  src="/images/N10-1.png" 
                  alt="N10 Level Map" 
                  width={1280} 
                  height={900} 
                  className="w-full h-auto"
                  style={{ maxWidth: "none" }}
                />
                {/* Render clickable boxes for each tank */}
                {Object.values(n10TanksData).map((tank) => (
                  <div
                    key={tank.id}
                    className="absolute"
                    style={{
                      top: `${tank.coordinates.top}px`,
                      left: `${tank.coordinates.left}px`,
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
                ))}
              </div>
            </div>
          )}

          {activeSection === "N20" && (
            <div className="overflow-auto">
              <div className="relative" style={{ width: "1280px", height: "900px" }}>
                <Image 
                  src="/images/N20-1.png" 
                  alt="N20 Level Map" 
                  width={1280} 
                  height={900} 
                  className="w-full h-auto"
                  style={{ maxWidth: "none" }}
                />
                {/* Render clickable boxes for each tank */}
                {Object.values(n20TanksData).map((tank) => (
                  <div
                    key={tank.id}
                    className="absolute"
                    style={{
                      top: `${tank.coordinates.top}px`,
                      left: `${tank.coordinates.left}px`,
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
                ))}
              </div>
            </div>
          )}

          {!activeSection && (
            <div className="flex items-center justify-center h-96 bg-gray-200 rounded-lg">
              <p className="text-gray-500 text-lg">Select a level (N00, N10, N20, N30) to view the map</p>
            </div>
          )}
        </div>
      </main>

      {/* Tank Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedTank?.name}</DialogTitle>
          </DialogHeader>
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

