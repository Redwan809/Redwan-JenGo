
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
  const isAtBottomRef = useRef(true);

  // Function to check if user is near the bottom
  const handleScroll = () => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px buffer
      isAtBottomRef.current = isNearBottom;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Attach scroll listener
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    scrollContainer?.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer?.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Auto-scroll logic
  useEffect(() => {
    // Only scroll if the user was already at the bottom
    if (isAtBottomRef.current) {
      scrollToBottom();
    }
  }, [messages, isLoading]);


  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 md:px-[10%]">
      <div className="flex flex-col gap-5">
        {messages.map((msg, index) => (
          <ChatMessage key={msg.id} message={msg} isLastMessage={index === messages.length - 1} />
        ))}
        {isLoading && <AILoader />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatDisplay;
