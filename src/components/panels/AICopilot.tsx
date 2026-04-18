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
      {/* Panel header */}
      <div className="flex items-center gap-2 p-4 border-b border-white/6 flex-shrink-0">
        <div className="w-7 h-7 bg-app-accent/15 rounded-lg flex items-center justify-center">
          <Robot className="w-4 h-4 text-app-accent" />
        </div>
        <span className="text-app-text text-sm font-medium">AI Copilot</span>
      </div>

      <ScrollArea className="flex-1 mb-0 p-4">
        <div className="space-y-3 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-6 h-6 bg-app-accent/20 border border-app-accent/30 rounded-lg flex items-center justify-center mt-0.5">
                  <Robot size={12} className="text-app-accent" />
                </div>
              )}
              <div className={`max-w-[85%] text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-app-accent text-white rounded-2xl rounded-tr-sm px-3 py-2'
                  : 'bg-app-card border border-white/8 text-app-text rounded-2xl rounded-tl-sm px-3 py-2'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-6 h-6 bg-app-input border border-white/10 rounded-lg flex items-center justify-center mt-0.5">
                  <User size={12} className="text-app-soft" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-app-accent/20 border border-app-accent/30 rounded-lg flex items-center justify-center">
                <Robot size={12} className="text-app-accent" />
              </div>
              <div className="bg-app-card border border-white/8 rounded-2xl rounded-tl-sm px-3 py-2 text-xs text-app-faint">
                <span className="animate-pulse">Analyzing...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="flex gap-2 flex-shrink-0 p-4 border-t border-white/6">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Vastu placement..."
          className="bg-app-input border-white/10 text-app-text placeholder:text-app-faint text-xs resize-none rounded-xl focus:border-app-accent focus:ring-1 focus:ring-app-accent/20 min-h-[60px]"
          rows={2}
        />
        <Button onClick={send} disabled={loading || !input.trim()}
          className="bg-app-accent hover:bg-app-accent-dim text-white rounded-xl h-8 w-8 p-0 flex items-center justify-center flex-shrink-0 self-end">
          <PaperPlaneTilt size={14} />
        </Button>
      </div>
    </div>
  )
}
