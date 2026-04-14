import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaperPlaneRight, Sparkle } from "@phosphor-icons/react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AICopilot = ({ projectId }) => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: 'Hello! I\'m your Vastu architecture assistant. You can ask me to optimize the layout, explain Vastu principles, or suggest improvements. Try: "Move kitchen to southeast" or "Optimize for better ventilation"'
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/copilot`, {
        project_id: projectId,
        message: userMessage
      }, { withCredentials: true });

      setMessages(prev => [...prev, { type: 'ai', text: response.data.response }]);
    } catch (error) {
      console.error("Copilot error:", error);
      toast.error("Failed to get AI response");
      setMessages(prev => [...prev, { 
        type: 'ai', 
        text: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "Optimize for sun",
    "Check Vastu compliance",
    "Suggest improvements"
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Sparkle size={20} weight="fill" className="text-blue-600" />
          <h3 className="text-sm font-semibold" style={{fontFamily: 'Cabinet Grotesk, sans-serif'}}>AI Copilot</h3>
        </div>
        <p className="text-xs text-stone-500 font-mono mt-1">Ask for design assistance</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '400px' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            data-testid={msg.type === 'user' ? 'user-message' : 'ai-message'}
            className={`chat-message ${msg.type}`}
          >
            <div className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-1">
              {msg.type === 'user' ? 'You' : 'AI Assistant'}
            </div>
            <div className="text-sm leading-relaxed">
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message ai">
            <div className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-1">AI Assistant</div>
            <div className="text-sm text-stone-400 font-mono">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              data-testid={`quick-action-${idx}`}
              onClick={() => setInput(action)}
              className="text-xs px-2 py-1 border border-stone-300 hover:border-stone-900 hover:bg-stone-50 transition-colors font-mono"
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-stone-200">
        <div className="flex gap-2">
          <Input
            data-testid="ai-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your request..."
            className="rounded-none border-stone-300 font-mono text-sm"
            disabled={loading}
          />
          <Button
            data-testid="send-message-button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-none bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PaperPlaneRight size={18} weight="fill" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;