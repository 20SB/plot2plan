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
    { role: 'assistant', content: 'Hello! I\'m your Vastu AI assistant. How can I help refine your architectural energy today?' }
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
      const history = messages.slice(-10)
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
    <div className="flex flex-col h-full bg-transparent animate-in fade-in duration-500 overflow-hidden">
      <ScrollArea className="flex-1 p-6 h-full">
        <div className="space-y-6 pr-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 size-10 bg-white/[0.05] border border-white/[0.1] rounded-xl flex items-center justify-center shadow-linear">
                  <Robot size={22} weight="duotone" className="text-accent" />
                </div>
              )}
              <div className={`max-w-[85%] text-[13px] leading-relaxed p-3.5 border transition-all ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-xl rounded-tr-none border-white/10 shadow-accent-glow font-medium'
                  : 'bg-white/[0.02] text-foreground rounded-xl rounded-tl-none border-white/[0.06] backdrop-blur-md shadow-linear font-medium'
              }`}>
                <p>{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 size-8 bg-white/[0.05] border border-white/[0.1] rounded-lg flex items-center justify-center shadow-linear">
                  <User size={18} weight="bold" className="text-foreground-subtle" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 animate-pulse">
              <div className="size-8 bg-white/[0.05] border border-white/[0.1] rounded-lg flex items-center justify-center">
                <Robot size={18} weight="duotone" className="text-accent" />
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl rounded-tl-none p-3 text-[11px] text-accent font-mono tracking-widest uppercase italic bg-accent/5">
                Architectural AI is synthesizing...
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-2" />
        </div>
      </ScrollArea>

      <div className="p-4 pt-2 border-t border-white/[0.06] bg-white/[0.01]">
        <div className="flex gap-2 bg-white/[0.02] border border-white/[0.1] rounded-xl p-1.5 shadow-linear focus-within:ring-2 focus-within:ring-accent/20 transition-all backdrop-blur-xl">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your Vastu Architect..."
            className="flex-1 bg-transparent border-none text-sm placeholder:text-foreground-subtle resize-none focus-visible:ring-0 min-h-[40px] max-h-[150px] py-2 px-2 scrollbar-hide"
            rows={1}
          />
          <Button onClick={send} disabled={loading || !input.trim()}
            className="rounded-lg size-9 p-0 flex items-center justify-center flex-shrink-0 self-end shadow-accent-glow active:scale-95 transition-all">
            <PaperPlaneTilt size={18} weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  )
}
