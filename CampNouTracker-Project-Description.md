# Camp Nou Tracker Project Description

## Context

This document provides a comprehensive reference for the Camp Nou Tracker water tank monitoring application. It captures the current state of development as of April 6, 2025, including implementation details, deployment challenges, and future plans. The purpose of this document is to enable any developer or AI assistant to understand the project's architecture, functionality, and technical decisions without requiring additional context. Whether you're continuing development on this project or rebuilding it from scratch, this guide contains all essential information needed to work with the codebase, deploy the application, and understand its core features.

## Project Overview

Camp Nou Tracker is a web application developed to monitor and track the waterproofing progress of water tanks in construction sites. The application provides a visual interface that shows the status of various water tanks across different levels of a construction site (N00, N10, N20). Each tank is represented on a map with color-coded markers that indicate the current progress status.

## Core Features

1. **Interactive Map Interface**
   - Visual representation of the construction site across multiple levels (N00, N10, N20)
   - Clickable tank markers positioned accurately on floor plans
   - Color-coded markers indicate status:
     - Green: Completed
     - Purple: In inspection phase
     - Red: Work in progress

2. **Tank Status Tracking**
   - Each tank progresses through 7 defined stages:
     - Formwork Removal
     - Repair and Cleaning
     - Pump Anchors
     - Slope
     - Inspection Stage 1
     - Waterproofing
     - Inspection Stage 2
   - Status tracking for each stage (Not Started, In Progress, Completed)
   - Detailed view of individual tank progress

3. **Data Management**
   - Persistent storage of tank data
   - API endpoints for data retrieval and updates
   - Automatic initialization of default data if none exists

4. **Export Functionality**
   - Export tank status data to spreadsheet format
   - Generate reports for inspection-ready tanks

## Technical Architecture

### Frontend
- **Framework**: Next.js 14.1.1 with React 18
- **UI Components**: Shadcn/UI with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: React hooks and context
- **Maps**: Static images with absolute positioning for tank markers

### Backend (Serverless)
- **API**: Next.js API routes (serverless functions)
- **Data Storage**: Vercel KV (Redis) for production
- **Local Development**: File-based storage fallback

### Data Models

#### Tank Types
```typescript
enum ProgressStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

enum ProgressStage {
  STAGE_1 = 'Stage 1',  // Formwork Removal
  STAGE_2 = 'Stage 2',  // Repair and Cleaning
  STAGE_3 = 'Stage 3',  // Pump Anchors
  STAGE_4 = 'Stage 4'   // Slope
  // Also includes Inspection stages and Waterproofing
}

enum TankType {
  OVERHEAD = 'Overhead Tank',
  UNDERGROUND = 'Underground Tank',
  // Also includes SEWAGE WATER, RAIN WATER, CHILLER ROOM
}

type StageProgress = {
  stage: ProgressStage;
  status: ProgressStatus;
};

type WaterTank = {
  id: string;
  name: string;
  type: TankType;
  location: string;
  progress: StageProgress[];
  coordinates: {  // For positioning on the map
    top: number;
    left: number;
    width: number;
    height: number;
  }
};

type TasksData = {
  tanks: WaterTank[];
  lastUpdated: string;
};
```

## Deployment Strategy

The application is deployed on Vercel with the following configuration:

1. **Build Settings**
   - Node.js version: >=18.0.0
   - Package manager: npm >=8.0.0
   - Build command: `npm run build`
   - Install command: `npm install`

2. **Database**
   - Vercel KV (Redis) for data persistence
   - Located in Paris region (closest to Barcelona)
   - Single Zone availability (99.9% SLA)
   - Free tier with 30MB storage

## Implementation Challenges

### Deployment Issues
The application has encountered several deployment challenges:

1. **Package Manager Conflicts**
   - Initial deployment attempted to use pnpm, resulting in failures
   - Solution: Created vercel.json to explicitly use npm instead

2. **Node.js Version Compatibility**
   - Initially using Next.js 15.1.0 with React 19
   - Downgraded to Next.js 14.1.1 with React 18.2.0 for better compatibility

3. **Windows Development Environment Limitations**
   - PowerShell execution policy restrictions
   - npm dependency resolution errors
   - Difficulty implementing Vercel CLI operations

4. **Vercel KV Integration**
   - Initial attempts to use Vercel KV directly failed
   - Simplified API to use static data temporarily
   - Plan to re-implement KV storage once deployment is stable

### Current Status
As of April 6, 2025:
- Successfully created a working version (tagged as v1.0)
- Deployed simplified API implementation without KV dependency
- Most recent commits focused on resolving deployment issues haven't been successful
- The last working state is at commit "Implement API endpoints with Vercel KV compatibility"

## UI Components Details

### Tank Markers
- Small colored square markers (20x20px)
- Positioned with absolute positioning on map images
- Clickable to display detailed information
- Show tank type beneath the marker

### Tank Details Dialog
When clicking on a tank marker, a dialog appears showing:
- Tank ID and name
- Current stage and overall progress
- Detailed progress for each stage
- Type of tank and location information

### Tank Status Colors
- Green: Fully completed tanks
- Purple: Tanks in inspection stage
- Red: Tanks with work in progress

## API Endpoints

### `/api/tasks`
- **GET**: Retrieve all tanks data
- **POST**: Update all tanks data

### `/api/tasks/[level]/[tankId]`
- **GET**: Retrieve specific tank data by level and ID
- **PUT**: Update specific tank data

## Future Development Plans

1. **Implement Full Vercel KV Integration**
   - Complete the Redis database integration for persistent storage
   - Add proper error handling for database operations

2. **Enhanced User Management**
   - Add user authentication
   - Role-based access control (admin, inspector, worker)

3. **Real-time Updates**
   - Implement webhook notifications when tank status changes
   - Real-time data synchronization across clients

4. **Improved Visualization**
   - Add filtering options by tank type or status
   - Timeline view of progress
   - Historical data tracking

5. **Mobile Optimizations**
   - Responsive design for field workers
   - Offline capabilities

## Development Environment Setup

To set up the project for development:

1. **Clone Repository**
   ```
   git clone https://github.com/Yashas-Vishwanath/water_proofing_tracker_2.git
   cd water_proofing_tracker_2
   ```

2. **Install Dependencies**
   ```
   npm install
   ```

3. **Set Up Vercel KV (Development)**
   ```
   npm install -g vercel
   vercel login
   vercel link
   vercel env pull .env.development.local
   ```

4. **Run Development Server**
   ```
   npm run dev
   ```

5. **Linux Environment Recommended**
   - The project encountered issues on Windows
   - Linux provides better compatibility with Node.js and Vercel tooling

## Known Issues

1. **Deployment Failures**
   - Current deployment attempts fail with npm installation errors
   - Recommended solution: Deploy from Linux environment

2. **Windows Development Limitations**
   - PowerShell execution policy blocks Vercel CLI
   - npm dependency resolution issues with certain packages

3. **Data Persistence**
   - Current implementation uses static data
   - KV integration needs completion after deployment stabilizes

## Tank Data Specifics

The application tracks multiple types of water tanks:
- Sewage Water tanks
- Rain Water tanks
- Chiller Room tanks

Each level of the construction site (N00, N10, N20) has different tanks with varying stages of completion. The exact positions and statuses are defined in the `app/data/tanks.ts` file.

Example tank markers and their meaning:
- Red marker: Work in progress (eg. "Formwork Removal" stage)
- Purple marker: In inspection (eg. "Inspection Stage 1")
- Green marker: Fully completed (all stages are "Completed")

## Conclusion

Camp Nou Tracker provides a visual, interactive solution for monitoring waterproofing progress in construction sites. While facing some deployment challenges, the core functionality works as expected in development. Moving forward, deploying from a Linux environment and completing the Vercel KV integration will be key priorities. 