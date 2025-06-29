'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Key, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Copy,
  ExternalLink,
  Settings,
  Zap,
  Shield
} from 'lucide-react'
import { groqAPI, GroqAPI } from '@/lib/groq-api'
import Link from 'next/link'

interface APIValidationResult {
  isValid: boolean
  message: string
  error?: string
}

export default function TestAPIPage() {
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<APIValidationResult | null>(null)
  const [apiKeyStatus, setApiKeyStatus] = useState<{ hasKey: boolean; keyLength: number; keyPrefix: string } | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [userApiKey, setUserApiKey] = useState<string | null>(null)

  useEffect(() => {
    // Get API key status on component mount
    const status = groqAPI.getAPIKeyStatus()
    setApiKeyStatus(status)

    // Get user API key from localStorage
    if (typeof window !== 'undefined') {
      setUserApiKey(localStorage.getItem('userGroqApiKey'))
    }
  }, [])

  const testAPIKey = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const result = await groqAPI.testAPIKey(GroqAPI.getActiveApiKey())
      setTestResult(result)
    } catch (error) {
      setTestResult({
        isValid: false,
        message: 'Test failed unexpectedly',
        error: 'UNKNOWN_ERROR'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getErrorIcon = (error?: string) => {
    switch (error) {
      case 'MISSING_API_KEY':
        return <Key className="w-5 h-5 text-red-500" />
      case 'INVALID_FORMAT':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'INVALID_API_KEY':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'INSUFFICIENT_PERMISSIONS':
        return <Shield className="w-5 h-5 text-orange-500" />
      case 'RATE_LIMIT_EXCEEDED':
        return <RefreshCw className="w-5 h-5 text-blue-500" />
      default:
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getErrorColor = (error?: string) => {
    switch (error) {
      case 'MISSING_API_KEY':
        return 'bg-red-50 border-red-200'
      case 'INVALID_FORMAT':
        return 'bg-yellow-50 border-yellow-200'
      case 'INVALID_API_KEY':
        return 'bg-red-50 border-red-200'
      case 'INSUFFICIENT_PERMISSIONS':
        return 'bg-orange-50 border-orange-200'
      case 'RATE_LIMIT_EXCEEDED':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-red-50 border-red-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 to-dark-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <Key className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">API Key Tester</h1>
          </div>
          <p className="text-xl text-dark-600 max-w-2xl mx-auto">
            Test and validate your Groq API key to ensure it's working correctly
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* API Key Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-dark-900 mb-6 flex items-center gap-3">
              <Settings className="w-6 h-6" />
              API Key Status
            </h2>

            {/* Default API Key Section (never show the key itself) */}
            {process.env.NEXT_PUBLIC_GROQ_API_KEY && (
              <div className="flex items-center justify-between p-4 bg-white rounded-xl mb-4">
                <span className="text-dark-600">Default API Key:</span>
                <span className="font-semibold text-dark-900">Present (hidden)</span>
              </div>
            )}

            {apiKeyStatus && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                  <span className="text-dark-600">User API Key Present:</span>
                  <span className={`font-semibold ${userApiKey ? 'text-green-600' : 'text-red-600'}`}>{userApiKey ? 'Yes' : 'No'}</span>
                </div>

                {userApiKey && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <span className="text-dark-600">User Key Length:</span>
                      <span className="font-semibold text-dark-900">{userApiKey.length} characters</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                      <span className="text-dark-600">User Key Prefix:</span>
                      <span className="font-semibold text-dark-900">{userApiKey.substring(0, 4)}...</span>
                    </div>
                    <div className="p-4 bg-white rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-600">User API Key Preview:</span>
                        <button
                          onClick={() => setShowKey(!showKey)}
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          {showKey ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <div className="font-mono text-sm bg-dark-50 p-3 rounded-lg break-all">
                        {showKey 
                          ? userApiKey
                          : `${userApiKey.substring(0, 4)}${'•'.repeat(userApiKey.length - 4)}`
                        }
                      </div>
                    </div>
                  </>
                )}

                {!userApiKey && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">No User API Key Set</span>
                    </div>
                    <p className="text-yellow-700 text-sm mb-3">
                      You have not added a user API key. Add one in the practice session screen for rapid, private responses.
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* API Test */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-effect rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-dark-900 mb-6 flex items-center gap-3">
              <Zap className="w-6 h-6" />
              Test API Connection
            </h2>

            <div className="space-y-6">
              <button
                onClick={testAPIKey}
                disabled={isTesting || !apiKeyStatus?.hasKey}
                className="w-full button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Testing API Key...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5" />
                    Test API Key
                  </div>
                )}
              </button>

              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${testResult.isValid ? 'bg-green-50 border-green-200' : getErrorColor(testResult.error)}`}
                >
                  <div className="flex items-start gap-3">
                    {testResult.isValid ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                    ) : (
                      getErrorIcon(testResult.error)
                    )}
                    <div className="flex-1">
                      <h3 className={`font-semibold mb-1 ${testResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                        {testResult.isValid ? 'API Key is Valid!' : 'API Key Test Failed'}
                      </h3>
                      <p className={`text-sm ${testResult.isValid ? 'text-green-700' : 'text-red-700'}`}>
                        {testResult.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  What this test does:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Validates API key format (starts with "gsk_")</li>
                  <li>• Tests connection to Groq API</li>
                  <li>• Verifies authentication</li>
                  <li>• Checks model access permissions</li>
                  <li>• Confirms response format</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/">
            <button className="button-secondary">
              ← Back to Home
            </button>
          </Link>
          <Link href="/practice">
            <button className="button-primary">
              Start Practice Session →
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
} 