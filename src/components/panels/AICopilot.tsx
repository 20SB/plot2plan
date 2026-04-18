'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PaperPlaneTilt, Robot, User } from '@phosphor-icons/react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  projectId: string
}

export function AICopilot({ projectId }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your Vastu AI assistant. Ask me about room placement, Vastu compliance, or layout optimization.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.slice(-10) // last 10 messages for context
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, projectId, history }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'No response' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[400px]">
      <ScrollArea className="flex-1 mb-3">
        <div className="space-y-3 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-6 h-6 bg-cyan-800 rounded-full flex items-center justify-center mt-0.5">
                  <Robot size={12} className="text-cyan-200" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-800 text-white'
                  : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center mt-0.5">
                  <User size={12} className="text-slate-300" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-cyan-800 rounded-full flex items-center justify-center">
                <Robot size={12} className="text-cyan-200" />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400">
                <span className="animate-pulse">Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <div className="flex gap-2 flex-shrink-0">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Vastu placement..."
          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 text-xs resize-none min-h-[60px]"
          rows={2}
        />
        <Button onClick={send} disabled={loading || !input.trim()}
          className="bg-cyan-700 hover:bg-cyan-600 h-auto px-3">
          <PaperPlaneTilt size={16} />
        </Button>
      </div>
    </div>
  )
}
