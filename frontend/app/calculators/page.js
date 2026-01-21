'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import api from '@/utils/api'
import { formatCurrency } from '@/utils/formatters'

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState('emi')
  const [emiData, setEmiData] = useState({ principal: '', annualRate: '', tenureMonths: '' })
  const [sipData, setSipData] = useState({ monthlyAmount: '', annualRate: '', years: '' })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const calculateEMI = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/finance/calculators/emi', emiData)
      setResults({ type: 'emi', data: response.data.result })
    } catch (error) {
      console.error('Failed to calculate EMI:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const calculateSIP = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post('/finance/calculators/sip', sipData)
      setResults({ type: 'sip', data: response.data.result })
    } catch (error) {
      console.error('Failed to calculate SIP:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
          <svg className="w-7 h-7 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="4" y="3" width="16" height="18" rx="2"/>
            <path d="M8 7h8M8 11h2m4 0h2M8 15h2m4 0h2"/>
          </svg>
          <span>Finance Calculators</span>
        </h1>
        
        {/* Tabs */}
        <div className="bg-white p-1 rounded-lg shadow-md inline-flex space-x-1">
          <button
            onClick={() => setActiveTab('emi')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'emi'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            EMI Calculator
          </button>
          <button
            onClick={() => setActiveTab('sip')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              activeTab === 'sip'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            SIP Calculator
          </button>
        </div>
        
        {/* EMI Calculator */}
        {activeTab === 'emi' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">EMI Calculator</h2>
            <form onSubmit={calculateEMI} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={emiData.principal}
                  onChange={(e) => setEmiData({ ...emiData, principal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Interest Rate (%)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={emiData.annualRate}
                  onChange={(e) => setEmiData({ ...emiData, annualRate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="8.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (Months)</label>
                <input
                  type="number"
                  required
                  value={emiData.tenureMonths}
                  onChange={(e) => setEmiData({ ...emiData, tenureMonths: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="60"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Calculate EMI'}
              </button>
            </form>
            
            {results?.type === 'emi' && (
              <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly EMI:</span>
                    <span className="font-bold text-green-600">{formatCurrency(results.data.emi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-semibold">{formatCurrency(results.data.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Interest:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(results.data.totalInterest)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* SIP Calculator */}
        {activeTab === 'sip' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">SIP Calculator</h2>
            <form onSubmit={calculateSIP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Investment</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={sipData.monthlyAmount}
                  onChange={(e) => setSipData({ ...sipData, monthlyAmount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Annual Returns (%)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={sipData.annualRate}
                  onChange={(e) => setSipData({ ...sipData, annualRate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Period (Years)</label>
                <input
                  type="number"
                  required
                  value={sipData.years}
                  onChange={(e) => setSipData({ ...sipData, years: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="10"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Calculating...' : 'Calculate SIP'}
              </button>
            </form>
            
            {results?.type === 'sip' && (
              <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Results</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Maturity Amount:</span>
                    <span className="font-bold text-green-600">{formatCurrency(results.data.maturityAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invested Amount:</span>
                    <span className="font-semibold">{formatCurrency(results.data.investedAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Returns:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(results.data.returns)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

