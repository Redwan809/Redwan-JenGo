import React from 'react';

const ChatHeader = () => {
  return (
    <div className="flex items-center p-5 text-xl font-bold">
      <span 
        className="font-headline tracking-wide uppercase bg-gradient-to-r from-[#2ecc71] via-[#f1c40f] to-[#e67e22] bg-clip-text text-transparent"
      >
        Redwan-Intel
      </span>
      <span className="ml-2 text-foreground/80">v1.1</span>
    </div>
  );
};

export default ChatHeader;
