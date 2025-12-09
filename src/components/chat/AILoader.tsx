import React from 'react';

const AILoader = () => {
  return (
    <div className="flex items-start gap-4 self-start">
      <div 
        className="size-[30px] flex-shrink-0 rounded-full animate-spin-slow shadow-lg"
        style={{
          background: 'conic-gradient(#2ecc71, #f1c40f, #e67e22, #2ecc71)',
          boxShadow: '0 0 10px rgba(241, 196, 15, 0.4)',
        }}
      ></div>
      <div className="pt-1 text-muted-foreground italic animate-pulse-opacity">
        Thinking...
      </div>
    </div>
  );
};

export default AILoader;
