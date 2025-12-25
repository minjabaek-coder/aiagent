'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessageStream, ChatMessage } from '@/lib/api';

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setStreamingContent('');

    try {
      await sendChatMessageStream(
        sessionId,
        userMessage,
        (delta) => {
          setStreamingContent((prev) => prev + delta);
        },
        () => {
          setStreamingContent((prev) => {
            if (prev) {
              setMessages((msgs) => [...msgs, { role: 'assistant', content: prev }]);
            }
            return '';
          });
          setIsLoading(false);
        },
        (error) => {
          console.error('Chat error:', error);
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.' },
          ]);
          setStreamingContent('');
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.' },
      ]);
      setStreamingContent('');
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    '오페라 라보엠에 대해 알려주세요',
    '베토벤 교향곡 9번의 의미는?',
    '인상주의 미술의 특징은?',
    '발레 백조의 호수 감상 포인트',
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-primary mb-2">
              안녕하세요! AI 도슨트입니다
            </h3>
            <p className="text-gray-600 mb-6">
              문화예술에 관한 질문을 해주세요
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(question)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] bg-gray-100 p-4 rounded-2xl rounded-bl-md">
              {streamingContent ? (
                <p className="whitespace-pre-wrap text-gray-800">{streamingContent}<span className="animate-pulse">▊</span></p>
              ) : (
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요..."
            className="flex-grow px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}
