import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CloseIcon, SendIcon, UserIcon, BotIcon } from './icons';

interface ChatbotProps {
  webhookUrl: string;
  sessionId: string;
}

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const Chatbot: React.FC<ChatbotProps> = ({ webhookUrl, sessionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: Message = { text: inputValue.trim(), sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Required for Google Apps Script doPost
        },
        body: JSON.stringify({
          message: userMessage.text,
          sessionId: sessionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Network response was not ok, status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: Message = { text: data.reply, sender: 'bot' };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = { 
        text: `Sorry, something went wrong. ${error instanceof Error ? error.message : 'Please try again.'}`, 
        sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, webhookUrl, sessionId]);

  const toggleOpen = () => setIsOpen(!isOpen);

  if (!isOpen) {
    return (
      <button
        onClick={toggleOpen}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 z-50 animate-fade-in"
        aria-label="Open chat"
      >
        <BotIcon className="h-8 w-8" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-[90vw] max-w-md h-[70vh] max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-xl">
        <h3 className="font-bold text-lg">AI Assistant</h3>
        <button onClick={toggleOpen} aria-label="Close chat">
          <CloseIcon className="h-6 w-6" />
        </button>
      </header>
      
      <div className="flex-grow p-4 overflow-y-auto bg-slate-50">
        <div className="space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender === 'bot' && <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center"><BotIcon className="w-5 h-5 text-slate-600"/></div>}
                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                        <p className="text-sm">{msg.text}</p>
                    </div>
                    {msg.sender === 'user' && <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center"><UserIcon className="w-5 h-5 text-slate-600"/></div>}
                </div>
            ))}
            {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center"><BotIcon className="w-5 h-5 text-slate-600"/></div>
                    <div className="max-w-[80%] p-3 rounded-2xl bg-slate-200 text-slate-800 rounded-bl-none">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
            )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="w-full pl-4 pr-12 py-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
            aria-label="Send message"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
