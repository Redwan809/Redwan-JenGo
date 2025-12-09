
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';

type QuickRepliesProps = {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
};

const quickReplyOptions = [
  "তোমার পরিচয় কি?",
  "একটি জোকস বলো",
  "কেমন আছো?",
  "Love মানে কি?",
];

const QuickReplies = ({ onSendMessage, isLoading }: QuickRepliesProps) => {

  const handleQuickReply = (text: string) => {
    if (!isLoading) {
      onSendMessage(text);
    }
  };
  
  // Don't show quick replies while the AI is thinking
  if (isLoading) {
    return null;
  }

  return (
    <div className="px-4 sm:px-5 pb-2 md:px-[10%]">
        <div className="mx-auto max-w-3xl flex flex-wrap items-center gap-2">
            {quickReplyOptions.map((text, index) => (
            <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto rounded-full px-3 py-1 text-sm font-normal"
                onClick={() => handleQuickReply(text)}
                disabled={isLoading}
            >
                {text}
            </Button>
            ))}
        </div>
    </div>
  );
};

export default QuickReplies;
