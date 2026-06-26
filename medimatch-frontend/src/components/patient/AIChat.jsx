import React, { useState, useRef, useEffect } from 'react';

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: '👋 Hi! I am MediMatch AI Assistant!\n\nI can help you with:\n• Understanding your symptoms\n• Explaining medical reports\n• Finding the right specialist\n• Health tips and advice\n\nHow can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    const updatedMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      // ── Calls our own backend, which talks to Gemini 2.5 Flash ──
      // (previously this called Anthropic's API directly from the
      // browser with no API key, which can never work — browsers
      // can't safely hold secret API keys, and the request was
      // missing auth entirely)
      const response = await fetch('https://medimatch-backend-4t7f.onrender.com/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            text: m.text
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Chat request failed');

      const aiReply = data.reply || 'Sorry, I could not understand. Please try again!';

      setMessages(prev => [...prev, { role: 'assistant', text: aiReply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: '⚠️ Sorry, I am having trouble connecting. Please check your connection and try again!'
      }]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    '🤒 I have fever and headache',
    '🩸 Explain my blood report',
    '💊 Which doctor for diabetes?',
    '🫀 Chest pain — is it serious?',
  ];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-50 transition-all hover:scale-110"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50">

          {/* Header */}
          <div className="bg-teal-600 rounded-t-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-lg">
              🤖
            </div>
            <div>
              <div className="text-white font-bold text-sm">MediMatch AI</div>
              <div className="text-teal-100 text-xs">● Online — Health Assistant</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto text-white text-lg hover:text-teal-200"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm whitespace-pre-line leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => sendMessage(), 100);
                  }}
                  className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything about health..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-teal-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-xl flex items-center justify-center transition-all"
            >
              ➤
            </button>
          </div>

        </div>
      )}
    </>
  );
}