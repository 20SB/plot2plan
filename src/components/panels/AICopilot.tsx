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
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-premium">
                  <Robot size={18} weight="bold" className="text-white" />
                </div>
              )}
              <div className={`max-w-[85%] text-sm leading-relaxed p-4 shadow-sm border ${
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-2xl rounded-tr-none border-primary shadow-premium'
                  : 'bg-card text-foreground rounded-2xl rounded-tl-none border-border'
              }`}>
                <p className="font-medium">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 bg-muted rounded-xl flex items-center justify-center border shadow-sm">
                  <User size={18} weight="bold" className="text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
                <Robot size={18} weight="bold" className="text-primary" />
              </div>
              <div className="bg-card border rounded-2xl rounded-tl-none p-4 text-sm text-muted-foreground font-semibold tracking-tight italic">
                Architectural AI is analyzing...
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
