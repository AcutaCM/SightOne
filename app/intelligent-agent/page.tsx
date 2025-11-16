/**
 * Intelligent Agent Demo Page
 * 
 * Demonstrates the TypeScript Tello Intelligent Agent
 */

'use client';

import React, { useState } from 'react';
import { Card, Tabs, Tab } from '@heroui/react';
import TelloIntelligentAgentPanel from '@/components/TelloIntelligentAgentPanel';

export default function IntelligentAgentPage() {
  const [commandHistory, setCommandHistory] = useState<any[]>([]);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);

  const handleCommandsGenerated = (commands: any[]) => {
    setCommandHistory(prev => [...prev, {
      timestamp: new Date().toISOString(),
      commands
    }]);
  };

  const handleExecutionComplete = (results: any[]) => {
    setExecutionHistory(prev => [...prev, {
      timestamp: new Date().toISOString(),
      results
    }]);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Tello Intelligent Agent</h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered drone command analysis and execution in TypeScript
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Agent Panel */}
          <div className="lg:col-span-2">
            <TelloIntelligentAgentPanel
              droneBackendUrl="http://localhost:3001"
              onCommandsGenerated={handleCommandsGenerated}
              onExecutionComplete={handleExecutionComplete}
            />
          </div>

          {/* History Sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <Tabs aria-label="History">
                <Tab key="commands" title="Commands">
                  <div className="space-y-2 mt-4 max-h-96 overflow-y-auto">
                    {commandHistory.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No commands generated yet
                      </p>
                    ) : (
                      commandHistory.slice().reverse().map((entry, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2"
                        >
                          <div className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </div>
                          <div className="space-y-1">
                            {entry.commands.map((cmd: any, cmdIndex: number) => (
                              <div key={cmdIndex} className="text-sm">
                                <span className="font-mono font-semibold">
                                  {cmd.action}
                                </span>
                                {cmd.parameters && (
                                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                                    {JSON.stringify(cmd.parameters)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Tab>

                <Tab key="execution" title="Execution">
                  <div className="space-y-2 mt-4 max-h-96 overflow-y-auto">
                    {executionHistory.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No executions yet
                      </p>
                    ) : (
                      executionHistory.slice().reverse().map((entry, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2"
                        >
                          <div className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </div>
                          <div className="space-y-1">
                            {entry.results.map((result: any, resIndex: number) => (
                              <div
                                key={resIndex}
                                className={`text-sm ${
                                  result.success
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}
                              >
                                <span className="font-mono font-semibold">
                                  {result.action}
                                </span>
                                <span className="ml-2">
                                  {result.success ? '✓' : '✗'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Card>

            {/* Quick Examples */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Quick Examples</h3>
              <div className="space-y-2 text-sm">
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <p className="font-mono text-xs">
                    "Take off, move forward 100cm, rotate 180 degrees, then land"
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <p className="font-mono text-xs">
                    "Fly up 50cm, move left 30cm, hover for a moment"
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <p className="font-mono text-xs">
                    "Check battery level and current status"
                  </p>
                </div>
              </div>
            </Card>

            {/* Features */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>✓ Natural language command parsing</li>
                <li>✓ Image analysis with vision models</li>
                <li>✓ Multiple AI provider support</li>
                <li>✓ Command sequence generation</li>
                <li>✓ Automatic execution</li>
                <li>✓ Error handling & recovery</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Documentation */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">1. Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                The AI analyzes your natural language command or image and generates
                a sequence of drone control commands with parameters.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Review</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review the generated commands before execution. The AI provides
                reasoning for its command sequence decisions.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Execute</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Commands are sent to the drone backend sequentially with proper
                delays and error handling between each command.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
