
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
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
  const lenis = useLenis();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    lenis?.scrollTo(messagesEndRef.current, { lerp: 0.1, duration: 1.5 });
    setShowScrollButton(false);
  };
  
  useEffect(() => {
    if (lenis) {
      const handleScroll = (e: any) => {
          const { scroll, limit } = e;
          const isNearBottom = limit - scroll < 150;
           if (isNearBottom) {
             setShowScrollButton(false);
           }
      };
      lenis.on('scroll', handleScroll);
      return () => {
        lenis.off('scroll', handleScroll);
      };
    }
  }, [lenis]);

  useEffect(() => {
    if (lenis) {
        // A new message has been added, check if we should scroll
        const { scroll, limit } = lenis;
        const isScrolledToBottom = limit - scroll <= lenis.dimensions.height + 1;

        if (isScrolledToBottom || !isLoading) {
            scrollToBottom();
        } else {
            // User is scrolled up
            setShowScrollButton(true);
        }
    }
  }, [messages, isLoading, lenis]);


  return (
    <ReactLenis root>
      <div ref={scrollRef} className="flex-1 p-4 sm:p-6 md:px-[10%] relative">
        <div className="flex flex-col gap-5">
          {messages.map((msg, index) => (
            <ChatMessage key={msg.id} message={msg} isLastMessage={index === messages.length - 1} />
          ))}
          {isLoading && <AILoader />}
          <div ref={messagesEndRef} />
        </div>
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            size="icon"
            className="absolute bottom-4 right-4 z-10 h-10 w-10 rounded-full shadow-lg"
          >
            <ArrowDown className="h-5 w-5" />
            <span className="sr-only">Scroll to new message</span>
          </Button>
        )}
      </div>
    </ReactLenis>
  );
};

export default ChatDisplay;
