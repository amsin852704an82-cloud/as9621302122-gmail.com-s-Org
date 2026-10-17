import React, { useState } from "react";
import { X, Sparkles, Send, Bot, User, RefreshCw } from "lucide-react";

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Namaste! I am your MasalaSetu AI Trade Advisor. I can assist you with spice mandi benchmarks (Unjha Jeera, Guntur Mirchi, Salem Haldi), FSSAI food safety regulations, GST compliance (5%), bulk order logistics, and private-label packaging formulas. How can I help your spice trade today?",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    "What are mandatory FSSAI moisture and volatile oil limits for spices?",
    "How does 5% GST apply to bulk spice orders and private label?",
    "Explain difference between Unjha Bold Jeera and Ordinary Cumin",
    "What packaging is best for export-grade Salem Turmeric Powder?",
  ];

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          context:
            "MasalaSetu B2B wholesale spice marketplace in India. Buyer: Kirana/Retailers; Sellers: APMC Mandi Processors.",
        }),
      });

      const data = await response.json();
      const reply = data.reply || "Sorry, I could not complete the trade inquiry at this moment.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("AI assistant call failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Trade Advisor: For bulk shipments, ensure moisture content is below 10% and verify supplier Agmark batch code.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-amber-950/10 flex flex-col h-[600px] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#FAF7F2] border-b border-amber-950/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-700 text-amber-50 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-slate-900">
                MasalaSetu AI Trade Advisor
              </h3>
              <p className="text-[11px] text-slate-500">
                Mandi intelligence · FSSAI regulations · Pricing strategies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-slate-900 text-white rounded-tr-xs"
                    : "bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-xs whitespace-pre-wrap"
                }`}
              >
                {msg.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    msg.sender === "user" ? "text-slate-400" : "text-slate-400"
                  }`}
                >
                  {msg.time}
                </div>
              </div>
              {msg.sender === "user" && (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-xs text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200/60 max-w-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
              <span>Analyzing commodity databases & regulations...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-2.5 bg-[#FAF7F2] border-t border-slate-200/60">
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 hover:text-amber-900 hover:border-amber-300 transition-colors shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            placeholder="Ask about spice grades, mandi rates, GST, or packaging..."
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 bg-slate-50"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="p-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
