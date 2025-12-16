
import React, { useState, useRef, useEffect } from 'react';
import { getAIChatResponse } from '../services/geminiService';
import { ChatMessage, KnowledgeItem } from '../types';

interface AIChatBotProps {
  knowledgeBase?: KnowledgeItem[];
}

const AIChatBot: React.FC<AIChatBotProps> = ({ knowledgeBase = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: '您好！我是您的 AI 房产助手。有什么可以帮您的吗？可以问我关于租房、买房、贷款计算等问题。', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Simple "RAG" (Retrieval Augmented Generation) Logic
  // In a real app, this would use vector embeddings and a database
  const retrieveContext = (query: string): string => {
    if (!knowledgeBase || knowledgeBase.length === 0) return '';

    const keywords = query.split(/[\s,，?？!！]+/).filter(k => k.length > 1);
    if (keywords.length === 0) return '';

    // Score entries by keyword matches
    const scoredEntries = knowledgeBase.map(item => {
        let score = 0;
        keywords.forEach(keyword => {
            if (item.title.includes(keyword)) score += 3;
            if (item.content.includes(keyword)) score += 1;
        });
        return { item, score };
    });

    // Filter relevant entries
    const relevant = scoredEntries
        .filter(e => e.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) // Take top 3
        .map(e => `【标题】${e.item.title}\n【内容】${e.item.content}`);

    if (relevant.length > 0) {
        return relevant.join('\n\n');
    }
    return '';
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // 1. Retrieve Context
    const context = retrieveContext(userMsg.text);
    if (context) {
        console.log("Using Knowledge Context:", context);
    }

    // 2. Call AI Service
    const responseText = await getAIChatResponse(userMsg.text, context);
    
    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-transform hover:scale-110 z-50 flex items-center justify-center ${isOpen ? 'bg-red-500 rotate-90' : 'bg-indigo-600'}`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[90vw] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-slate-200 overflow-hidden">
          <div className="bg-indigo-600 p-4">
            <h3 className="text-white font-bold flex items-center">
              <span className="mr-2 text-xl">🤖</span> 智居 AI 助手
            </h3>
            <p className="text-indigo-100 text-xs mt-1">内置知识库 + 智能联网搜索</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-800 shadow-sm rounded-bl-none border border-slate-100'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                 <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 text-sm text-slate-500">
                    AI 正在思考...
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="请输入问题 (优先匹配内部知识)"
                className="flex-1 bg-transparent border-none focus:outline-none text-sm"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="ml-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatBot;
