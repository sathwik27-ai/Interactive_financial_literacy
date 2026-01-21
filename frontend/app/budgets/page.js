'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import api from '@/utils/api'
import { formatCurrency } from '@/utils/formatters'

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ category: '', amount: '', endDate: '' })
  const [showForm, setShowForm] = useState(false)
  
  useEffect(() => {
    fetchBudgets()
  }, [])
  
  const fetchBudgets = async () => {
    try {
      const response = await api.get('/finance/budgets')
      setBudgets(response.data.budgets)
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/finance/budgets', {
        category: formData.category,
        amount: parseFloat(formData.amount),
        endDate: formData.endDate
      })
      setFormData({ category: '', amount: '', endDate: '' })
      setShowForm(false)
      fetchBudgets()
    } catch (error) {
      console.error('Failed to create budget:', error)
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return
    try {
      await api.delete(`/finance/budgets/${id}`)
      fetchBudgets()
    } catch (error) {
      console.error('Failed to delete budget:', error)
    }
  }
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Budgets</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {showForm ? 'Cancel' : '+ Create Budget'}
          </button>
        </div>
        
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Food, Entertainment"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Budget
            </button>
          </form>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.length === 0 ? (
            <div className="col-span-2 bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-500 py-8">No budgets created yet</p>
            </div>
          ) : (
            budgets.map((budget) => (
              <div key={budget.id} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{budget.category}</h3>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Delete"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth="2" d="M3 6h18M8 6v12m8-12v12M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-semibold">{formatCurrency(budget.amount)}</span>
                  </div>
                  {budget.utilization && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Spent:</span>
                        <span className="font-semibold text-red-600">
                          {formatCurrency(budget.utilization.totalSpent)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(budget.utilization.remaining)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            budget.utilization.percentage > 100
                              ? 'bg-red-600'
                              : budget.utilization.percentage > 80
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budget.utilization.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        {budget.utilization.percentage.toFixed(1)}% used
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}

