'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import useAuthStore from '@/store/authStore'

const icons = {
  dashboard: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M3 13h8V3H3v10zm10 8h8v-6h-8v6zM3 21h8v-6H3v6zm10-8h8V3h-8v10z"/>
    </svg>
  ),
  expenses: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M12 8c-3.866 0-7 1.79-7 4s3.134 4 7 4 7-1.79 7-4-3.134-4-7-4zm0-5v3m0 10v3"/>
    </svg>
  ),
  budgets: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M4 19h16M4 15h16M4 11h10M4 7h10"/>
    </svg>
  ),
  goals: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M12 22s8-4 8-10a8 8 0 10-16 0c0 6 8 10 8 10z"/>
      <path strokeWidth="2" d="M12 8v4l3 3"/>
    </svg>
  ),
  groups: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5 1.343 3.5 3 3.5zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11zm0 2c-2.21 0-4 1.567-4 3.5V20h8v-3.5c0-1.933-1.79-3.5-4-3.5zm8 0c-.46 0-.9.07-1.31.2 1.54.64 2.31 1.86 2.31 3.3V20h6v-3.5c0-1.933-1.79-3.5-4-3.5h-3z"/>
    </svg>
  ),
  learn: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M12 3l9 4-9 4-9-4 9-4zm0 8l9-4v10l-9 4-9-4V7l9 4z"/>
    </svg>
  ),
  mentor: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M12 3a9 9 0 00-9 9 9 9 0 0014.25 7.5L21 21l-1.5-3.75A9 9 0 0012 3z"/>
    </svg>
  ),
  scam: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M12 2L2 22h20L12 2zm0 8v4m0 4h.01"/>
    </svg>
  ),
  calc: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="4" y="3" width="16" height="18" rx="2"/>
      <path d="M8 7h8M8 11h2m4 0h2M8 15h2m4 0h2"/>
    </svg>
  ),
  logo: (
    <svg className="w-6 h-6 text-primary-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  )
}

export default function Layout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, initAuth } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  useEffect(() => {
    initAuth()
  }, [initAuth])
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { href: '/expenses', label: 'Expenses', icon: icons.expenses },
    { href: '/budgets', label: 'Budgets', icon: icons.budgets },
    { href: '/goals', label: 'Goals', icon: icons.goals },
    { href: '/group-expenses', label: 'Groups', icon: icons.groups },
    { href: '/learn', label: 'Learn', icon: icons.learn },
    { href: '/scam-detector', label: 'Scam Detector', icon: icons.scam },
    { href: '/calculators', label: 'Calculators', icon: icons.calc },
  ]
  
  const handleLogout = () => {
    logout()
    router.push('/login')
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 bg-white shadow-lg z-40 transform transition-transform duration-200 w-64 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            {icons.logo}
            <h2 className="text-2xl font-bold text-primary-700">Finance AI</h2>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-primary-100 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-8">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow hover:bg-gray-100"
        aria-label="Toggle navigation"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Main Content */}
      <div className={`transition-all duration-200 md:ml-64 ml-0`}>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
