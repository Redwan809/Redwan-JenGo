"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';

type ChatInputProps = {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
};

const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="p-4 sm:p-5 bg-background">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-3xl items-center space-x-2 rounded-full border bg-input p-2 pr-3"
      >
        <Input
          type="text"
          placeholder="Ask Redwan-Intel anything..."
          autoComplete="off"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
          className="flex-1 border-none bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !inputValue.trim()}
          className="size-9 rounded-full bg-primary text-primary-foreground shrink-0"
        >
          <SendHorizonal className="size-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
