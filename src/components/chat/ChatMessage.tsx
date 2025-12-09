
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
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setDisplayedText(''); // Reset on new message
    setIsTyping(true);
    let i = 0;
    const intervalId = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 20); // Adjust typing speed here (milliseconds)

    return () => clearInterval(intervalId);
  }, [text]);

  return (
    <>
      {displayedText}
      {isTyping && <span className="animate-pulse">|</span>}
    </>
  );
};


const ChatMessage = ({ message, isLastMessage }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  const showTypewriter = !isUser && isLastMessage;

  return (
    <div
      className={cn(
        'flex max-w-[80%] items-start gap-4',
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
