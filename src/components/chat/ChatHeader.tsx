import React from 'react';
import { Button } from '../ui/button';
import { Brush } from 'lucide-react';

type ChatHeaderProps = {
  onClearChat: () => void;
};

const ChatHeader = ({ onClearChat }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-5 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center">
        <span 
          className="font-headline tracking-wide uppercase bg-gradient-to-r from-[#2ecc71] via-[#f1c40f] to-[#e67e22] bg-clip-text text-transparent text-xl font-bold"
        >
          Redwan-Intel
        </span>
        <span className="ml-2 text-foreground/80">v1.1</span>
      </div>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onClearChat}
        aria-label="Clear chat history"
        className="text-muted-foreground hover:text-foreground"
      >
        <Brush className="size-5" />
      </Button>
    </div>
  );
};

export default ChatHeader;
