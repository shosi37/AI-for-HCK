import React, { useEffect, useRef, useState } from 'react'
import { ChatSidebar } from '../components/ui' 
import { getChatbotConfig, getFAQ, addAIFeedback } from '../firebase'

function timeNow() {
  return new Date().toISOString()
}

export default function AIChat({ user, onClose }) {

  function FeedbackButtons({ message, index, history, user, onFeedbackSubmitted }) {
    const storageKey = 'ai-feedback-' + message.id
    const [submitted, setSubmitted] = useState(() => { try { return localStorage.getItem(storageKey) } catch (e) { return null } })
    const [loadingFb, setLoadingFb] = useState(false)

    function findQuestion() {
      for (let i = index - 1; i >= 0; i--) {
        if (history[i] && history[i].role === 'user') return history[i].text
      }
      return null
    }

    async function submit(choice) {
      if (submitted || loadingFb) return
      setLoadingFb(true)
      const q = findQuestion()
      try {
        await addAIFeedback({ uid: user?.uid, email: user?.email, question: q, answer: message.text, accurate: choice === 'accurate' })
        try { localStorage.setItem(storageKey, choice) } catch (e) {}
        setSubmitted(choice)
        onFeedbackSubmitted && onFeedbackSubmitted(choice)
      } catch (e) {
        console.error('Failed to submit AI feedback', e)
        alert('Failed to send feedback')
      } finally {
        setLoadingFb(false)
      }
    }

    return (
      <div className="flex items-center gap-2">
        {submitted ? (
          <div className="text-xs text-green-600">Thanks for your feedback ({submitted})</div>
        ) : (
          <>
            <button onClick={() => submit('accurate')} disabled={loadingFb} className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">Helpful</button>
            <button onClick={() => submit('inaccurate')} disabled={loadingFb} className="px-2 py-1 rounded bg-rose-100 text-rose-700 text-xs">Not helpful</button>
          </>
        )}
      </div>
    )
  }
  const storageKey = `ai-chat-history-${user.uid}`
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedThread, setSelectedThread] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) setHistory(JSON.parse(raw))
    } catch (e) {
      console.warn('Failed to load chat history', e)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history))
    } catch (e) {
      // ignore
    }
  }, [history])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [history, selectedThread])

  const suggestions = [
    'When is the semester deadline?',
    'How do I apply for scholarships?',
    'Where can I find the timetable?',
    'How to contact IT support?'
  ]

  const [chatbotConfig, setChatbotConfig] = useState(null)
  const [faq, setFaq] = useState([])

  useEffect(() => {
    async function load() {
      const c = await getChatbotConfig()
      if (c) setChatbotConfig(c)
      const f = await getFAQ()
      if (f) setFaq(f)
    }
    load()
  }, [])

  function saveMessage(role, text) {
    const msg = { id: Date.now(), role, text, time: timeNow() }
    setHistory((h) => [...h, msg])
    return msg
  }

  function generateAIResponse(userText) {
    const t = userText.toLowerCase()

    // first consult configured rules
    const rules = chatbotConfig?.rules || []
    for (const r of rules) {
      const keys = Array.isArray(r.keywords) ? r.keywords : []
      for (const k of keys) {
        if (t.includes(k.toLowerCase())) return r.response
      }
    }

    // builtin short-circuit rules (fallback for now)
    if (t.includes('deadline') || t.includes('semester')) {
      return 'Semester deadlines vary by department — check the academic calendar on the college portal or ask the registrar for exact dates.'
    }

    // suggestions from config or fallback
    const fallbacks = chatbotConfig?.fallbacks || [
      'Good question — I recommend checking the official student portal for the most up-to-date info.',
      'I can help with that. Could you give a bit more detail?',
      'That sounds important — would you like me to show related resources or contacts?'
    ]
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }

  function handleSend(text) {
    if (!text || loading) return
    setLoading(true)
    saveMessage('user', text)

    // simulate AI thinking
    setTimeout(() => {
      const aiText = generateAIResponse(text)
      saveMessage('ai', aiText)
      setLoading(false)
      setInput('')
      setSelectedThread(null)
    }, 700 + Math.random() * 800)
  }

  function handleSuggestionClick(text) {
    setInput(text)
    handleSend(text)
  }

  function clearHistory() {
    setHistory([])
    try { localStorage.removeItem(storageKey) } catch (e) {}
  }

  // derive simple threads: pair user->ai when consecutive
  const threads = []
  for (let i = 0; i < history.length; i++) {
    const a = history[i]
    const b = history[i + 1]
    if (a && a.role === 'user' && b && b.role === 'ai') {
      threads.push({ user: a, ai: b })
      i++
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-black/40 items-stretch">
      <div className="m-auto w-full max-w-5xl h-[80vh] bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex transition-colors duration-200">
        <ChatSidebar
          threads={threads}
          suggestions={chatbotConfig?.suggestions || suggestions}
          faq={faq}
          onSuggestionClick={handleSuggestionClick}
          onSelectThread={(i) => setSelectedThread(i)}
          onClear={clearHistory}
        />

        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">AI</div>
              <div>
                <div className="font-semibold text-gray-700 dark:text-gray-100 transition-colors duration-150">College AI Assistant</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-150">Helpful answers for students</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-colors duration-150">Close</button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-auto p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
            {selectedThread !== null ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-500">Conversation</div>
                <div className="mt-2">
                  <div className="mb-3">
                    <div className="text-sm font-medium text-indigo-700">You</div>
                    <div className="mt-1 text-gray-800">{threads[selectedThread]?.user?.text}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-100 transition-colors duration-150">AI</div>
                    <div className="mt-1 text-gray-800">{threads[selectedThread]?.ai?.text}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {history.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">No messages yet — try a suggestion or ask a question.</div>
                )}
                {history.map((m, idx) => (
                  <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                    <div className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'}`}>
                      {m.text}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">{new Date(m.time).toLocaleString()}
                      {m.role === 'ai' && (
                        <span className="ml-2 text-xs text-gray-500">— Was this answer helpful?</span>
                      )}
                    </div>

                    {/* feedback buttons for AI messages */}
                    {m.role === 'ai' && (
                      <div className="mt-2 flex items-center gap-2">
                        <FeedbackButtons
                          message={m}
                          index={idx}
                          history={history}
                          user={user}
                          onFeedbackSubmitted={(choice) => {
                            // optimistic: add a small confirmation message
                            saveMessage('user', choice === 'accurate' ? 'Marked the previous answer as accurate.' : 'Marked the previous answer as inaccurate.')
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(input) }}
                className="flex-1 px-4 py-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-700"
                placeholder="Ask a question about college, deadlines, or services..."
              />
              <button onClick={() => handleSend(input)} disabled={loading} className="px-4 py-2 rounded-md bg-indigo-600 text-white">
                {loading ? 'Thinking…' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
