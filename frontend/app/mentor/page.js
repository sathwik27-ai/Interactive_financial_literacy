'use client'

import { useEffect, useState, useRef } from 'react'
import Layout from '@/components/Layout'
import api from '@/utils/api'

export default function MentorPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  
  useEffect(() => {
    fetchChatHistory()
  }, [])
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const fetchChatHistory = async () => {
    try {
      const response = await api.get('/ai/mentor/history')
      setMessages(response.data.messages)
    } catch (error) {
      console.error('Failed to fetch chat history:', error)
    }
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    
    try {
      const response = await api.post('/ai/mentor/chat', { message: input })
      setMessages((prev) => [...prev, ...response.data.messages])
    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: error.response?.data?.error || 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-150px)]">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">AI Finance Mentor</h1>
        
        <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <p className="text-xl mb-2">👋 Hi there!</p>
                <p>Start a conversation with your AI finance mentor</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Ask your financial mentor..."
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

