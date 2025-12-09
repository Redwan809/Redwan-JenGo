import React from 'react';
import type { Message } from './ChatLayout';
import { cn } from '@/lib/utils';

type ChatMessageProps = {
  message: Message;
};

const AIAvatar = () => (
  <div 
    className="size-[30px] flex-shrink-0 rounded-full"
    style={{
      background: 'linear-gradient(135deg, #2ecc71, #f1c40f, #e67e22)'
    }}
  ></div>
);

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';

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
            : 'bg-transparent'
        )}
      >
        {message.text}
      </div>
    </div>
  );
};

export default ChatMessage;
