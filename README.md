# Water Tank Waterproofing Tracker

A web application for tracking progress of waterproofing works on water tanks at a construction site. The application provides visual tracking of various water tanks across different levels of the construction project.

## Features

- Interactive map view of water tanks across multiple levels (N00, N10, N20)
- Color-coded status indicators for each tank
- Detailed progress tracking for each waterproofing stage
- Export data to spreadsheet functionality
- Progress stage management with completion tracking
- Fixed positioning for tank markers

## API Endpoints

The application uses serverless API endpoints for data persistence:

- `/api/hello` - Test endpoint to verify API functionality
- `/api/tasks` - Main endpoint for managing all tank data
  - `GET` - Retrieves all tank data
  - `POST` - Updates or initializes all tank data
- `/api/tasks/[level]/[tankId]` - Endpoint for managing individual tanks
  - `GET` - Retrieves a specific tank's data
  - `PUT` - Updates a specific tank's data

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components

## Getting Started

### Prerequisites

- Node.js (>= 16.x)
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Yashas-Vishwanath/water_proofing_tracker_2.git
   cd water_proofing_tracker_2
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Select a level (N00, N10, N20) from the tab navigation
2. Click on a tank to view its details and progress
3. Update the progress status for different stages of waterproofing
4. Use the export function to download data as a spreadsheet

## License

This project is proprietary and not licensed for public use.

## Contact

For questions or support, please contact the project maintainer.

## Setting Up Vercel KV for Production

For production deployments, the application is designed to use Vercel KV for data persistence. This ensures proper data storage in the serverless environment.

To set this up:

1. Install the Vercel KV package:
   ```bash
   npm install @vercel/kv
   ```

2. Create a Vercel KV database:
   - Go to your Vercel dashboard
   - Navigate to Storage > KV
   - Click "Create Database"
   - Follow the setup instructions
   - Connect the KV database to your project

3. Update the KV configuration:
   - In `app/lib/vercel-kv.ts`, uncomment the `@vercel/kv` import
   - Update the `isVercelKVAvailable` function to return `true` in production
   - Uncomment the KV implementation in the functions

4. Deploy to Vercel

The application will automatically switch to using KV for data persistence in the production environment, while still using the local file system during development.

## Deployment

The application is deployed on Vercel. 