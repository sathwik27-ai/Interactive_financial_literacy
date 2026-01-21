'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import api from '@/utils/api'

export default function ScamDetectorPage() {
  const [message, setMessage] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  
  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    
    setLoading(true)
    try {
      const response = await api.post('/scam/detect', { message })
      setResult(response.data.analysis)
      setHistory((prev) => [response.data.analysis, ...prev].slice(0, 10))
    } catch (error) {
      console.error('Failed to analyze:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
          <svg className="w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" d="M12 2L2 22h20L12 2zm0 8v4m0 4h.01"/>
          </svg>
          <span>Scam Detector</span>
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600 mb-6">
            Paste any suspicious message and let AI analyze if it's a potential scam
          </p>
          
          <form onSubmit={handleAnalyze} className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Paste the suspicious message here..."
            />
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Analyzing...' : '🔍 Analyze Message'}
            </button>
          </form>
        </div>
        
        {result && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className={`p-6 rounded-lg ${
              result.isScam ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                {result.isScam ? (
                  <svg className="w-7 h-7 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" d="M12 2L2 22h20L12 2zm0 8v4m0 4h.01"/>
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
                <div>
                  <h2 className="text-2xl font-bold">
                    {result.isScam ? 'Potential Scam Detected' : 'Looks Safe'}
                  </h2>
                  <p className="text-sm text-gray-600">Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>
              
              {result.category && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700">Category:</p>
                  <p className="text-lg text-gray-800">{result.category}</p>
                </div>
              )}
              
              {result.explanation && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Explanation:</p>
                  <p className="text-gray-800">{result.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {history.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Analyses</h2>
            <div className="space-y-3">
              {history.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {item.isScam ? (
                      <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeWidth="2" d="M12 2L2 22h20L12 2zm0 8v4m0 4h.01"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeWidth="2" d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">{item.category || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{(item.confidence * 100).toFixed(1)}% confidence</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

