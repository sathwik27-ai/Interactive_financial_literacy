'use client'

import { useEffect, useState, useMemo } from 'react'
import Layout from '@/components/Layout'
import api from '@/utils/api'
import { formatCurrency } from '@/utils/formatters'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend
} from 'recharts'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalBudgets: 0,
    totalGoals: 0,
    recentExpenses: [],
    expenses: [],
    goals: []
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchDashboardData()
    const id = setInterval(fetchDashboardData, 10000)
    return () => clearInterval(id)
  }, [])
  
  const fetchDashboardData = async () => {
    try {
      const [expensesRes, budgetsRes, goalsRes] = await Promise.all([
        api.get('/finance/expenses'),
        api.get('/finance/budgets'),
        api.get('/finance/goals')
      ])
      
      const expenses = expensesRes.data.expenses
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
      const totalBudgets = budgetsRes.data.budgets.reduce((sum, b) => sum + b.amount, 0)
      const totalGoals = goalsRes.data.goals.reduce((sum, g) => sum + g.targetAmount, 0)
      
      setStats({
        totalExpenses,
        totalBudgets,
        totalGoals,
        recentExpenses: expenses.slice(0, 5),
        expenses,
        goals: goalsRes.data.goals
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data
  const { expensesLow, expensesHigh } = useMemo(() => {
    const low = new Map()
    const high = new Map()
    stats.expenses.forEach((e) => {
      const bucket = e.amount < 10000 ? low : high
      bucket.set(e.category, (bucket.get(e.category) || 0) + e.amount)
    })
    return {
      expensesLow: Array.from(low.entries()).map(([category, amount]) => ({ category, amount })),
      expensesHigh: Array.from(high.entries()).map(([category, amount]) => ({ category, amount })),
    }
  }, [stats.expenses])

  const makeYAxisTicks = (data) => {
    const max = data.reduce((m, d) => Math.max(m, d.amount), 0)
    const step = max <= 200 ? 100 : 1000
    const upper = Math.ceil(max / step) * step || step
    const ticks = []
    for (let v = 0; v <= upper; v += step) ticks.push(v)
    return ticks
  }

  const goalsProgress = useMemo(() => {
    return (stats.goals || [])
      .map((g) => ({ name: g.title, progress: Math.min(100, (g.currentAmount / (g.targetAmount || 1)) * 100) }))
      .slice(0, 6)
  }, [stats.goals])
  
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
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {formatCurrency(stats.totalExpenses)}
                </p>
              </div>
              <svg className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" d="M12 8c-3.866 0-7 1.79-7 4s3.134 4 7 4 7-1.79 7-4-3.134-4-7-4zm0-5v3m0 10v3"/>
              </svg>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Budgets</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {formatCurrency(stats.totalBudgets)}
                </p>
              </div>
              <svg className="w-10 h-10 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="4" y="3" width="16" height="18" rx="2"/>
                <path d="M8 7h8M8 11h8M8 15h8"/>
              </svg>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Goals</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatCurrency(stats.totalGoals)}
                </p>
              </div>
              <svg className="w-10 h-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 3"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Recent Expenses */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Expenses</h2>
          {stats.recentExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No expenses yet. Start tracking your spending!</p>
          ) : (
            <div className="space-y-3">
              {stats.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{expense.description}</p>
                    <p className="text-sm text-gray-500">{expense.category}</p>
                  </div>
                  <p className="font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Expenses by Category</h2>
          {(expensesLow.length === 0 && expensesHigh.length === 0) ? (
            <p className="text-gray-500 text-center py-8">No expense data</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Below ₹10,000</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expensesLow} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={50} />
                      <YAxis ticks={makeYAxisTicks(expensesLow)} tickFormatter={(v) => formatCurrency(v)} width={70} />
                      <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                      <Bar dataKey="amount" name="Amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">₹10,000 and Above</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expensesHigh} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={50} />
                      <YAxis ticks={makeYAxisTicks(expensesHigh)} tickFormatter={(v) => formatCurrency(v)} width={70} />
                      <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                      <Bar dataKey="amount" name="Amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Goal Progress (%)</h2>
          {goalsProgress.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No goals yet</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={goalsProgress} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} width={50} />
                  <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
                  <Area type="monotone" dataKey="progress" stroke="#10b981" fillOpacity={1} fill="url(#colorProgress)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

