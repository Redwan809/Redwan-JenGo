"use client";

import React, { useEffect, useRef } from 'react';
import type { Message } from './ChatLayout';
import ChatMessage from './ChatMessage';
import AILoader from './AILoader';

type ChatDisplayProps = {
  messages: Message[];
  isLoading: boolean;
};

const ChatDisplay = ({ messages, isLoading }: ChatDisplayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 md:px-[10%]">
      <div className="flex flex-col gap-5">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <AILoader />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatDisplay;
