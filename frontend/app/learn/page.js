'use client'

import { useState, useEffect, useMemo } from 'react'
import useAuthStore from '@/store/authStore'
import Layout from '@/components/Layout'
import api from '@/utils/api'

export default function LearnPage() {
  const { user } = useAuthStore()
  const [topic, setTopic] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  // const [videoUrl, setVideoUrl] = useState('') // disabled: manual adding via links
  const [videos, setVideos] = useState([])
  const [playingId, setPlayingId] = useState(null)
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [notes, setNotes] = useState(null)

  // const extractYouTubeId = (url) => {
  //   try {
  //     // Supports youtu.be/<id>, youtube.com/watch?v=<id>, youtube.com/shorts/<id>
  //     const u = new URL(url)
  //     if (u.hostname === 'youtu.be') return u.pathname.slice(1)
  //     if (u.searchParams.get('v')) return u.searchParams.get('v')
  //     const parts = u.pathname.split('/')
  //     const idx = parts.findIndex((p) => p === 'shorts')
  //     if (idx !== -1 && parts[idx + 1]) return parts[idx + 1]
  //     // Fallback: last path segment
  //     return parts.pop()
  //   } catch {
  //     return ''
  //   }
  // }

  const storageKey = useMemo(() => {
    const id = user?.id || user?.email || 'guest'
    return `learn-videos:${id}`
  }, [user])

  // const addVideo = (e) => {
  //   e.preventDefault()
  //   const id = extractYouTubeId(videoUrl)
  //   if (!id) return alert('Please enter a valid YouTube URL')
  //   const newItem = { id, url: videoUrl, addedAt: Date.now() }
  //   setVideos((prev) => {
  //     const next = [newItem, ...prev.filter((v) => v.id !== id)]
  //     try {
  //       if (typeof window !== 'undefined') {
  //         localStorage.setItem(storageKey, JSON.stringify(next))
  //         localStorage.setItem('learn-videos:guest', JSON.stringify(next))
  //       }
  //     } catch {}
  //     return next
  //   })
  //   setVideoUrl('')
  // }

  // Persist videos to localStorage
  // Initial load - try user key, then guest key; do not overwrite if already populated
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (videos && videos.length > 0) return
        let parsed = []
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          try { parsed = JSON.parse(saved) } catch {}
        }
        if ((!parsed || !Array.isArray(parsed) || parsed.length === 0)) {
          const guest = localStorage.getItem('learn-videos:guest')
          if (guest) {
            try {
              const gp = JSON.parse(guest)
              if (Array.isArray(gp)) parsed = gp
            } catch {}
          }
        }
        if (Array.isArray(parsed) && parsed.length > 0) setVideos(parsed)
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // If user logs in after load, migrate guest videos to user key
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (!user) return
        const current = localStorage.getItem(storageKey)
        if (!current || current === '[]') {
          const guest = localStorage.getItem('learn-videos:guest')
          if (guest && guest !== '[]') {
            localStorage.setItem(storageKey, guest)
            try {
              const gp = JSON.parse(guest)
              if (Array.isArray(gp) && gp.length > 0 && (!videos || videos.length === 0)) {
                setVideos(gp)
              }
            } catch {}
          }
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, storageKey])

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, JSON.stringify(videos))
      }
    } catch {}
  }, [videos, storageKey])
  
  // Generate quiz based on current module notes
  const generateQuizFromNotes = async () => {
    if (!session || !notes) {
      alert('Please select a learning module first to generate quiz')
      return
    }
    
    setLoading(true)
    setQuestions([])
    setAnswers({})
    setShowResults(false)
    
    try {
      // Get module information for unique quiz generation
      const moduleId = session.module || 'budgeting-101'
      const moduleTopic = session.module ? session.module.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Financial Literacy'
      
      const response = await api.post('/ai/quiz/generate', { 
        topic: moduleTopic,
        module: moduleId, // Send module ID for unique quiz generation
        notes: notes // Send notes content to generate quiz from it
      })
      setQuestions(response.data.questions)
      setTopic(moduleTopic)
    } catch (error) {
      console.error('Failed to generate quiz:', error)
      alert(error.response?.data?.error || 'Failed to generate quiz')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAnswer = (questionIdx, answerIdx) => {
    setAnswers({ ...answers, [questionIdx]: answerIdx })
  }
  
  const submitQuiz = async () => {
    let score = 0
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score++
    })
    
    try {
      await api.post('/ai/quiz/save', {
        topic,
        score,
        totalQuestions: questions.length,
        answers
      })
    } catch (error) {
      console.error('Failed to save quiz:', error)
    }
    
    setShowResults(true)
  }
  
  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  // Start session for a module
  const startModuleSession = async (module) => {
    setSessionLoading(true)
    setNotes(null)
    setQuestions([])
    setAnswers({})
    setShowResults(false)
    
    try {
      const response = await api.post('/ai/start-session', {
        userId: user?.id || user?.email,
        startModule: module
      })
      const data = response.data
      
      // Set session info
      setSession(data)
      
      // Set notes if provided
      if (data.notes) {
        setNotes(data.notes)
      }
      
      // Clear any existing quiz when starting new session
      setQuestions([])
      setAnswers({})
      setShowResults(false)
    } catch (error) {
      console.error('Failed to start session:', error)
      alert(error.response?.data?.error || 'Failed to start session')
    } finally {
      setSessionLoading(false)
    }
  }

  // Check for session in URL params
  useEffect(() => {
    const loadSessionFromUrl = async () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const sessionId = params.get('session')
        const token = params.get('token')
        const module = params.get('module')
        
        if (sessionId && token && module) {
          // Load session content
          await startModuleSession(module)
        }
      }
    }
    
    loadSessionFromUrl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Financial Literacy</h1>

        {/* Module Selection Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Learning Modules</h2>
          <p className="text-gray-600 mb-4">Select a module to start learning with notes and quiz</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                id: 'budgeting-101', 
                name: 'Budgeting Fundamentals', 
                icon: (
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                )
              },
              { 
                id: 'investing-basics', 
                name: 'Investing Basics', 
                icon: (
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              },
              { 
                id: 'credit-management', 
                name: 'Credit Management', 
                icon: (
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )
              },
              { 
                id: 'savings-strategies', 
                name: 'Savings Strategies', 
                icon: (
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              { 
                id: 'debt-management', 
                name: 'Debt Management', 
                icon: (
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              { 
                id: 'financial-planning', 
                name: 'Financial Planning', 
                icon: (
                  <svg className="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((module) => (
              <button
                key={module.id}
                onClick={() => startModuleSession(module.id)}
                disabled={sessionLoading}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {module.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{module.name}</h3>
                    <p className="text-sm text-gray-500">Start learning</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {sessionLoading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600">Generating notes and quiz...</p>
            </div>
          )}
        </div>

        {/* Session Info */}
        {session && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Active Session</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Session ID:</span>
                <span className="ml-2 text-gray-600 font-mono">{session.sessionId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Module:</span>
                <span className="ml-2 text-gray-600 capitalize">{session.module?.replace('-', ' ')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes Display */}
        {notes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" d="M12 3l9 4-9 4-9-4 9-4zm0 8l9-4v10l-9 4-9-4V7l9 4z"/>
                </svg>
                <span>Learning Notes</span>
              </h3>
              <button
                onClick={generateQuizFromNotes}
                disabled={loading || !session}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {notes.split('\n').map((line, idx) => {
                if (line.startsWith('# ')) {
                  return <h1 key={idx} className="text-2xl font-bold mt-4 mb-2 text-gray-900">{line.replace('# ', '')}</h1>
                } else if (line.startsWith('## ')) {
                  return <h2 key={idx} className="text-xl font-bold mt-4 mb-2 text-gray-900">{line.replace('## ', '')}</h2>
                } else if (line.startsWith('### ')) {
                  return <h3 key={idx} className="text-lg font-semibold mt-3 mb-2 text-gray-900">{line.replace('### ', '')}</h3>
                } else if (line.startsWith('- ')) {
                  return <li key={idx} className="ml-4 mb-1">{line.replace('- ', '')}</li>
                } else if (line.match(/^\d+\.\s/)) {
                  return <li key={idx} className="ml-4 mb-1 list-decimal">{line.replace(/^\d+\.\s/, '')}</li>
                } else if (line.trim() === '') {
                  return <br key={idx} />
                } else {
                  return <p key={idx} className="mb-2">{line}</p>
                }
              })}
            </div>
          </div>
        )}

        {/* Videos Section */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Videos</h2>
          </div>

          {/**
           * Link adding UI is disabled per request. Keeping the code commented
           * here for future use if needed.
           *
           * <form onSubmit={addVideo} className="flex space-x-2">
           *   <input
           *     type="url"
           *     value={videoUrl}
           *     onChange={(e) => setVideoUrl(e.target.value)}
           *     className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
           *     placeholder="Paste YouTube URL (watch, share, or shorts)"
           *     required
           *   />
           *   <button
           *     type="submit"
           *     className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
           *   >
           *     Add
           *   </button>
           * </form>
           */}

          {videos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Add your first learning video from YouTube</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((v) => (
                <div key={v.id} className="cursor-pointer group" onClick={() => setPlayingId(v.id)}>
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-200">
                    <img
                      alt="video thumbnail"
                      src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                      className="w-full h-full object-cover group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="bg-black/50 rounded-full p-3">
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-700 truncate">{v.url}</p>
                    <p className="text-xs text-gray-400">Added {new Date(v.addedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Player Modal */}
        {playingId && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPlayingId(null)}>
            <div className="bg-black rounded-lg w-full max-w-4xl aspect-video" onClick={(e) => e.stopPropagation()}>
              <iframe
                className="w-full h-full rounded-lg"
                src={`https://www.youtube.com/embed/${playingId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}
        
        {questions.length > 0 && !showResults && (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            {questions.map((question, qIdx) => (
              <div key={qIdx} className="border-b pb-6 last:border-0">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {qIdx + 1}. {question.question}
                </h3>
                <div className="space-y-2">
                  {question.options.map((option, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleAnswer(qIdx, oIdx)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                        answers[qIdx] === oIdx
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <button
              onClick={submitQuiz}
              disabled={Object.keys(answers).length !== questions.length}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz
            </button>
          </div>
        )}
        
        {showResults && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">
                {answers && questions.length > 0 ? (
                  <>
                    <span className={getScoreColor(
                      questions.filter((q, idx) => answers[idx] === q.correct).length,
                      questions.length
                    )}>
                      {questions.filter((q, idx) => answers[idx] === q.correct).length} / {questions.length}
                    </span>
                  </>
                ) : null}
              </h2>
              
              <div className="space-y-4 mt-6">
                {questions.map((question, qIdx) => (
                  <div key={qIdx} className="text-left p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold mb-2">{question.question}</p>
                    <div className="space-y-1">
                      {question.options.map((option, oIdx) => {
                        const isCorrect = oIdx === question.correct
                        const isSelected = answers[qIdx] === oIdx
                        return (
                          <p
                            key={oIdx}
                            className={`px-3 py-2 rounded ${
                              isCorrect
                                ? 'bg-green-100 text-green-800 font-semibold'
                                : isSelected
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100'
                            }`}
                          >
                            {isCorrect && '✓ '}
                            {isSelected && !isCorrect && '✗ '}
                            {option}
                          </p>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => {
                  setQuestions([])
                  setAnswers({})
                  setShowResults(false)
                }}
                className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Try Another Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

