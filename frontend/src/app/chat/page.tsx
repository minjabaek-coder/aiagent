'use client';

import { useState, useRef, useEffect } from 'react';
import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">AI 도슨트</h1>
        <p className="text-gray-600">
          문화예술에 관한 질문을 자유롭게 해주세요
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
