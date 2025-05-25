"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { n00Tanks, n10Tanks, n20Tanks, n30Tanks } from '@/app/data/tanks';

export default function ApiTest() {
  const [helloData, setHelloData] = useState<any>(null);
  const [tanksData, setTanksData] = useState<any>(null);
  const [loadingHello, setLoadingHello] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Function to test the hello endpoint
  const testHelloApi = async () => {
    setLoadingHello(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/hello');
      const data = await response.json();
      setHelloData(data);
    } catch (err) {
      setError(`Error testing hello API: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoadingHello(false);
    }
  };

  // Function to test the tasks endpoint
  const testTasksApi = async () => {
    setLoadingTasks(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTanksData(data);
    } catch (err) {
      setError(`Error testing tasks API: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Function to initialize the tank data from frontend
  const initializeTankData = async () => {
    setInitializing(true);
    setError(null);
    setSuccessMessage(null);
    try {
      // Use all the tanks from our imported constants
      const defaultTanks = {
        n00Tanks,
        n10Tanks,
        n20Tanks,
        n30Tanks
      };

      // Send the data to the API endpoint
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(defaultTanks),
      });

      if (response.ok) {
        setSuccessMessage('Tank data initialized successfully with all tanks!');
        // Also refresh the tanks data display
        const tasksResponse = await fetch('/api/tasks');
        const tasksData = await tasksResponse.json();
        setTanksData(tasksData);
      } else {
        const errorData = await response.json();
        setError(`Failed to initialize tank data: ${errorData.error || response.statusText}`);
      }
    } catch (err) {
      setError(`Error initializing tank data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">API Testing Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Test /api/hello</CardTitle>
            <CardDescription>Basic API test endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testHelloApi} 
              disabled={loadingHello}
              className="mb-4"
            >
              {loadingHello ? 'Loading...' : 'Test Hello Endpoint'}
            </Button>
            
            {helloData && (
              <div className="bg-gray-100 p-4 rounded overflow-auto">
                <pre className="text-sm">{JSON.stringify(helloData, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test /api/tasks</CardTitle>
            <CardDescription>Tanks data API endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Button 
                onClick={testTasksApi} 
                disabled={loadingTasks || initializing}
              >
                {loadingTasks ? 'Loading...' : 'Test Tasks Endpoint'}
              </Button>
              
              <Button 
                onClick={initializeTankData} 
                disabled={initializing || loadingTasks}
                variant="outline"
              >
                {initializing ? 'Initializing...' : 'Initialize Tank Data'}
              </Button>
            </div>
            
            {tanksData && (
              <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[400px]">
                <pre className="text-sm">{JSON.stringify(tanksData, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Back to Main App
        </Button>
      </div>
    </div>
  );
} 