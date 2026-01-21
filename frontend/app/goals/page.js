'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import api from '@/utils/api'
import { formatCurrency, formatDate } from '@/utils/formatters'

export default function GoalsPage() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ title: '', description: '', targetAmount: '', targetDate: '' })
  const [showForm, setShowForm] = useState(false)
  
  useEffect(() => {
    fetchGoals()
  }, [])
  
  const fetchGoals = async () => {
    try {
      const response = await api.get('/finance/goals')
      setGoals(response.data.goals)
    } catch (error) {
      console.error('Failed to fetch goals:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/finance/goals', {
        title: formData.title,
        description: formData.description,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate
      })
      setFormData({ title: '', description: '', targetAmount: '', targetDate: '' })
      setShowForm(false)
      fetchGoals()
    } catch (error) {
      console.error('Failed to create goal:', error)
    }
  }
  
  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return
    try {
      await api.delete(`/finance/goals/${id}`)
      fetchGoals()
    } catch (error) {
      console.error('Failed to delete goal:', error)
    }
  }
  
  const handleProgressUpdate = async (id, currentAmount) => {
    try {
      await api.patch(`/finance/goals/${id}/progress`, { currentAmount: parseFloat(currentAmount) })
      fetchGoals()
    } catch (error) {
      console.error('Failed to update progress:', error)
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
          <h1 className="text-3xl font-bold text-gray-800">Financial Goals</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            {showForm ? 'Cancel' : '+ New Goal'}
          </button>
        </div>
        
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Buy a car"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Optional description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
              <input
                type="number"
                required
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
              <input
                type="date"
                required
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Goal
            </button>
          </form>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.length === 0 ? (
            <div className="col-span-2 bg-white p-6 rounded-lg shadow-md text-center">
              <p className="text-gray-500 py-8">No goals set yet</p>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              return (
                <div
                  key={goal.id}
                  className={`bg-white p-6 rounded-lg shadow-md ${
                    goal.isCompleted ? 'border-2 border-green-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Delete"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeWidth="2" d="M3 6h18M8 6v12m8-12v12M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-green-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-semibold">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-semibold">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold">{formatDate(goal.targetDate)}</span>
                    </div>
                    {!goal.isCompleted && (
                      <div className="flex space-x-2 mt-4">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Add amount"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const amount = parseFloat(e.target.value)
                              if (amount > 0) {
                                handleProgressUpdate(goal.id, goal.currentAmount + amount)
                                e.target.value = ''
                              }
                            }
                          }}
                        />
                      </div>
                    )}
                    {goal.isCompleted && (
                      <div className="mt-2 text-center text-green-600 font-semibold flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeWidth="2" d="M20 6L9 17l-5-5"/>
                        </svg>
                        <span>Goal Achieved!</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Layout>
  )
}

