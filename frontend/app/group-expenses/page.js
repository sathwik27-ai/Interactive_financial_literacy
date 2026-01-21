'use client'

import Layout from '@/components/Layout'

export default function GroupExpensesPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
          <svg className="w-7 h-7 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5 1.343 3.5 3 3.5zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11zm0 2c-2.21 0-4 1.567-4 3.5V20h8v-3.5c0-1.933-1.79-3.5-4-3.5zm8 0c-.46 0-.9.07-1.31.2 1.54.64 2.31 1.86 2.31 3.3V20h6v-3.5c0-1.933-1.79-3.5-4-3.5h-3z"/>
          </svg>
          <span>Group Expenses</span>
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-gray-500 text-center py-8 flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4m0 4h.01"/>
            </svg>
            <span>Group expense splitting feature coming soon...</span>
          </div>
        </div>
      </div>
    </Layout>
  )
}

