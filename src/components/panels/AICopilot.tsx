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
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
      <ScrollArea className="flex-1 p-6 h-full">
        <div className="space-y-6 pr-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-10 h-10 bg-white border rounded-2xl flex items-center justify-center shadow-sm">
                  <Robot size={22} weight="duotone" className="text-primary" />
                </div>
              )}
              <div className={`max-w-[85%] text-[13px] leading-relaxed p-5 shadow-sm border ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-[2rem] rounded-tr-none border-primary shadow-premium font-medium'
                  : 'bg-white text-slate-700 rounded-[2rem] rounded-tl-none border-slate-100 shadow-sm font-semibold'
              }`}>
                <p>{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center border shadow-sm">
                  <User size={22} weight="bold" className="text-slate-500" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-white border rounded-2xl flex items-center justify-center shadow-sm">
                <Robot size={22} weight="duotone" className="text-primary" />
              </div>
              <div className="bg-white border border-slate-100 rounded-[2rem] rounded-tl-none p-5 text-[11px] text-muted-foreground font-black tracking-widest uppercase italic">
                Architectural AI is synthesizing...
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>
      </ScrollArea>

      <div className="p-6 pt-2 bg-muted/10 border-t">
        <div className="flex gap-3 bg-background border rounded-2xl p-2 shadow-premium focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your Vastu Architect..."
            className="flex-1 bg-transparent border-none text-sm placeholder:text-muted-foreground resize-none focus-visible:ring-0 min-h-[44px] max-h-[200px] py-3 px-3"
            rows={1}
          />
          <Button onClick={send} disabled={loading || !input.trim()}
            className="rounded-xl h-12 w-12 p-0 flex items-center justify-center flex-shrink-0 self-end shadow-premium active:scale-95 transition-all">
            <PaperPlaneTilt size={20} weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  )
}
