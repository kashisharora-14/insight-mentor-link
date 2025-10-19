/**
 * Supabase Test Component
 * Use this component to test Supabase connection and configuration
 */

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { testSupabaseConnection, displaySupabaseConfig } from '../utils/supabaseTest'

interface TestResults {
  connection: boolean
  auth: boolean
  realtime: boolean
}

export const SupabaseTest: React.FC = () => {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResults | null>(null)

  const runTests = async () => {
    setTesting(true)
    setResults(null)
    
    // Display config first
    displaySupabaseConfig()
    
    // Run connection tests
    const testResults = await testSupabaseConnection()
    setResults(testResults)
    setTesting(false)
  }

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌'
  }

  const getStatusText = (status: boolean) => {
    return status ? 'Working' : 'Failed'
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>
          Test your Supabase configuration and connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Testing...' : 'Run Connection Test'}
        </Button>
        
        {results && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Connection:</span>
              <span>
                {getStatusIcon(results.connection)} {getStatusText(results.connection)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Authentication:</span>
              <span>
                {getStatusIcon(results.auth)} {getStatusText(results.auth)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Real-time:</span>
              <span>
                {getStatusIcon(results.realtime)} {getStatusText(results.realtime)}
              </span>
            </div>
            
            {results.connection && results.auth && results.realtime && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm font-medium">
                  🎉 Supabase is configured correctly!
                </p>
              </div>
            )}
            
            {(!results.connection || !results.auth) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm font-medium">
                  ⚠️ Check your environment variables and Supabase keys
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="text-xs text-gray-500 mt-4">
          <p>Check the browser console for detailed logs</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default SupabaseTest