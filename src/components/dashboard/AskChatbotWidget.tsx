'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/lib/i18n/context';
import { UserProfile, ChatMessage } from '@/types';
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  Wrench, 
  Compass, 
  CloudSun, 
  Phone, 
  FileText,
  CornerDownLeft,
  RefreshCw
} from 'lucide-react';

interface AskChatbotWidgetProps {
  user: UserProfile | null;
  initialQuery?: string;
}

export const AskChatbotWidget: React.FC<AskChatbotWidgetProps> = ({ user, initialQuery }) => {
  const { t, language } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState(initialQuery || '');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: language === 'hi' 
        ? 'राम-राम किसान भाई! मैं कृषिमित्र एआई हूं—भारतीय कृषि अनुसंधान परिषद (ICAR) व केवीके दिशानिर्देशों पर आधारित आपका निजी कृषि सलाहकार। आप फसल सुरक्षा, खाद मात्रा, मौसम या नजदीकी कृषि केंद्र के बारे में कुछ भी पूछ सकते हैं।'
        : 'Welcome Farmer! I am KrishiMitra AI, your ICAR and KVK-grounded agricultural advisor. Ask me anything about crop diseases, balanced fertilizer doses, agro-weather, or nearby research centers.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [toolExecuting, setToolExecuting] = useState<string | null>(null);

  // Sync initial query if passed
  useEffect(() => {
    if (initialQuery) {
      setInput(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, toolExecuting]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Anticipate tool execution for visual feedback
    const lower = textToSend.toLowerCase();
    if (lower.includes('weather') || lower.includes('मौसम') || lower.includes('बारिश')) {
      setToolExecuting('get_weather');
    } else if (lower.includes('kvk') || lower.includes('केंद्र') || lower.includes('phone') || lower.includes('नंबर')) {
      setToolExecuting('get_nearby_kvk');
    } else if (lower.includes('plant') || lower.includes('फसल') || lower.includes('किस्म')) {
      setToolExecuting('get_crop_recommendation');
    }

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('krishi_token') || ''}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get answer');

      const botMessage: ChatMessage = {
        id: 'msg_bot_' + Date.now(),
        role: 'assistant',
        content: data.response.message,
        timestamp: new Date().toISOString(),
        toolCalls: data.response.toolCalls,
      };

      setMessages([...newMessages, botMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        role: 'assistant',
        content: 'सॉरी किसान भाई, संपर्क में क्षणिक बाधा आई। कृपया दोबारा प्रयास करें। (' + err.message + ')',
        timestamp: new Date().toISOString(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setLoading(false);
      setToolExecuting(null);
    }
  };

  const quickQuestions = [
    t('q1'),
    t('q2'),
    t('q3'),
    t('q4'),
  ];

  return (
    <div className="glass-panel rounded-3xl shadow-card border border-green-100 flex flex-col h-[650px] overflow-hidden">
      
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 text-white flex items-center justify-center shadow-inner">
            <Bot className="w-6 h-6 text-green-200" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <span>{t('chatTitle')}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                ICAR Grounded
              </span>
            </h3>
            <p className="text-xs text-green-100/80">
              {t('chatSubtitle')}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([messages[0]]);
          }}
          className="p-2 text-green-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-xs flex items-center gap-1"
          title="Clear Chat"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">नई बातचीत</span>
        </button>
      </div>

      {/* Suggested Quick Questions Chips */}
      <div className="bg-green-50/90 border-b border-green-100 px-4 py-2.5 overflow-x-auto flex items-center gap-2 no-scrollbar">
        <span className="text-[11px] font-bold text-green-800 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          सुझाव:
        </span>
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            className="text-xs shrink-0 px-3 py-1.5 rounded-xl bg-white border border-green-200 hover:border-green-400 text-gray-700 hover:text-green-800 hover:bg-green-100/60 font-medium transition-colors shadow-2xs truncate max-w-xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-green-600 to-emerald-700'
                  : 'bg-gradient-to-br from-slate-800 to-green-950'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-tr-none'
                  : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
              }`}
            >
              {/* Tool Execution Badges (if tools were called) */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="mb-2.5 pb-2 border-b border-gray-100 flex flex-wrap gap-1.5">
                  {msg.toolCalls.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-green-50 text-green-800 border border-green-200 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Wrench className="w-2.5 h-2.5 text-green-600" />
                      <span>टूल: {t.name || t.toolName || 'Tool'}()</span>
                    </span>
                  ))}
                </div>
              )}

              <div className="whitespace-pre-wrap">
                {msg.content}
              </div>

              <div
                className={`text-[10px] mt-2 ${
                  msg.role === 'user' ? 'text-green-100 text-right' : 'text-gray-400 text-left'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Dynamic Tool Execution Indicator */}
        {toolExecuting && (
          <div className="flex items-center gap-2 p-3 bg-green-50/80 border border-green-200 rounded-2xl text-xs text-green-800 animate-pulse">
            <Wrench className="w-4 h-4 animate-spin text-green-700" />
            <span>कृषिमित्र डेटा टूल सक्रिय: {toolExecuting}() से लाइव जानकारी प्राप्त की जा रही है...</span>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && !toolExecuting && (
          <div className="flex items-center gap-2 text-xs text-gray-500 italic pl-11">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce [animation-delay:0.4s]"></span>
            <span>कृषिमित्र सलाह तैयार कर रहा है...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white/95 border-t border-gray-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatPlaceholder')}
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-xs sm:text-sm outline-none bg-gray-50/50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-md shadow-green-600/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

    </div>
  );
};
