'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function DebugPage() {
  const [testResult, setTestResult] = useState<string>('')

  const testSupabaseConnection = async () => {
    try {
      setTestResult('Testing Supabase connection...')
      
      // Test basic connection
      const { data, error } = await supabase.from('users').select('count').limit(1)
      
      if (error) {
        setTestResult(`❌ Supabase connection failed: ${error.message}`)
      } else {
        setTestResult('✅ Supabase connection successful!')
      }
    } catch (error) {
      setTestResult(`❌ Connection error: ${error}`)
    }
  }

  const testAuth = async () => {
    try {
      setTestResult('Testing auth...')
      
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setTestResult(`❌ Auth test failed: ${error.message}`)
      } else {
        setTestResult(`✅ Auth working! Session: ${data.session ? 'Active' : 'None'}`)
      }
    } catch (error) {
      setTestResult(`❌ Auth error: ${error}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🔧 SoleFolio Debug Dashboard</h1>
      
      <div className="space-y-6">
        {/* Environment Variables */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Environment Variables</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <span className="font-semibold">NEXT_PUBLIC_SUPABASE_URL:</span>{' '}
              <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ Missing'}
              </span>
            </div>
            <div>
              <span className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>{' '}
              <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Present' : '❌ Missing'}
              </span>
            </div>
            <div>
              <span className="font-semibold">NEXT_PUBLIC_APP_URL:</span>{' '}
              <span className={process.env.NEXT_PUBLIC_APP_URL ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_APP_URL || '❌ Missing'}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Tests */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Connection Tests</h2>
          <div className="space-x-2 mb-4">
            <button
              onClick={testSupabaseConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Supabase
            </button>
            <button
              onClick={testAuth}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Auth
            </button>
          </div>
          {testResult && (
            <div className="bg-white p-3 rounded border">
              <code>{testResult}</code>
            </div>
          )}
        </div>

        {/* Runtime Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Runtime Info</h2>
          <div className="space-y-2 text-sm">
            <div><span className="font-semibold">Environment:</span> {process.env.NODE_ENV}</div>
            <div><span className="font-semibold">Window:</span> {typeof window !== 'undefined' ? '✅ Available' : '❌ SSR'}</div>
            <div><span className="font-semibold">User Agent:</span> {typeof window !== 'undefined' ? navigator.userAgent : 'N/A'}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">🔍 Debugging Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check that all environment variables are present and correct</li>
            <li>Test the Supabase connection to verify database access</li>
            <li>Test auth to verify authentication is working</li>
            <li>If any tests fail, check the Vercel dashboard environment variables</li>
            <li>Ensure the Supabase project is active and accessible</li>
          </ol>
        </div>
      </div>
    </div>
  )
}