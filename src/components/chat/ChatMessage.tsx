
"use client";
import React, { useState, useEffect } from 'react';
import type { Message } from './ChatLayout';
import { cn } from '@/lib/utils';

type ChatMessageProps = {
  message: Message;
  isLastMessage: boolean;
};

const AIAvatar = () => (
  <div 
    className="size-[30px] flex-shrink-0 rounded-full"
    style={{
      background: 'linear-gradient(135deg, #2ecc71, #f1c40f, #e67e22)'
    }}
  ></div>
);

const Typewriter = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // Set a small delay to simulate thinking before showing the whole message
    const timeoutId = setTimeout(() => {
      setDisplayedText(text);
    }, 50); // A very short delay

    return () => clearTimeout(timeoutId);
  }, [text]);

  // Show a blinking cursor while waiting for the text to appear
  if (!displayedText) {
    return <span className="animate-pulse">|</span>;
  }

  return <>{displayedText}</>;
};


const ChatMessage = ({ message, isLastMessage }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  const showTypewriter = !isUser && isLastMessage;

  return (
    <div
      className={cn(
        'flex max-w-[80%] items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500',
        isUser ? 'self-end' : 'self-start'
      )}
    >
      {!isUser && <AIAvatar />}
      <div
        className={cn(
          'rounded-[20px] px-5 py-3 text-left leading-relaxed',
          isUser
            ? 'rounded-br-sm bg-secondary'
            : 'rounded-bl-sm bg-card'
        )}
      >
        {showTypewriter ? <Typewriter text={message.text} /> : message.text}
      </div>
    </div>
  );
};

export default ChatMessage;
