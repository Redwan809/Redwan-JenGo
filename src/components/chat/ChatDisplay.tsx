
"use client";

import React, { useEffect, useRef, useState } from 'react';
import type { Message } from './ChatLayout';
import ChatMessage from './ChatMessage';
import AILoader from './AILoader';
import { Button } from '../ui/button';
import { ArrowDown } from 'lucide-react';

type ChatDisplayProps = {
  messages: Message[];
  isLoading: boolean;
};

const ChatDisplay = ({ messages, isLoading }: ChatDisplayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setShowScrollButton(false);
  };

  const handleScroll = () => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      if (isNearBottom) {
        setShowScrollButton(false);
      }
    }
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    scrollContainer?.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      scrollContainer?.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 1; // +1 for precision
      
      // If we are already at the bottom OR this is the initial load (isLoading is false), scroll smoothly
      if (isScrolledToBottom || !isLoading) {
        scrollToBottom();
      } else {
        // If user is scrolled up and a new message comes in, show the button
        setShowScrollButton(true);
      }
    }
  }, [messages, isLoading]);


  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 md:px-[10%] relative">
      <div className="flex flex-col gap-5">
        {messages.map((msg, index) => (
          <ChatMessage key={msg.id} message={msg} isLastMessage={index === messages.length - 1} />
        ))}
        {isLoading && <AILoader />}
        <div ref={messagesEndRef} />
      </div>
       {showScrollButton && (
        <Button
          onClick={() => scrollToBottom()}
          size="icon"
          className="absolute bottom-4 right-4 z-10 h-10 w-10 rounded-full shadow-lg"
        >
          <ArrowDown className="h-5 w-5" />
          <span className="sr-only">Scroll to new message</span>
        </Button>
      )}
    </div>
  );
};

export default ChatDisplay;
