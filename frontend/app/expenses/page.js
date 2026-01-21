'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import api from '@/utils/api'
import { formatCurrency, formatDate } from '@/utils/formatters'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ category: '', amount: '', description: '' })
  const [showForm, setShowForm] = useState(false)
  
  useEffect(() => {
    fetchExpenses()
  }, [])
  
  const fetchExpenses = async () => {
    try {
      const response = await api.get('/finance/expenses')
      setExpenses(response.data.expenses)
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/finance/expenses', {
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description
      })
      setFormData({ category: '', amount: '', description: '' })
      setShowForm(false)
      fetchExpenses()
    } catch (error) {
      console.error('Failed to create expense:', error)
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('Delete this expense?')) return
    try {
      await api.delete(`/finance/expenses/${id}`)
      fetchExpenses()
    } catch (error) {
      console.error('Failed to delete expense:', error)
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
          <h1 className="text-3xl font-bold text-gray-800">Expenses</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {showForm ? 'Cancel' : '+ Add Expense'}
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
                placeholder="e.g., Food, Transport"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="What did you spend on?"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add Expense
            </button>
          </form>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{expense.description}</p>
                    <p className="text-sm text-gray-500">{expense.category} • {formatDate(expense.date)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeWidth="2" d="M3 6h18M8 6v12m8-12v12M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

