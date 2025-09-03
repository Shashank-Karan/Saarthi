import React from "react";
import { Navigation } from "@/components/navigation";
import { ChatInterface } from "@/components/chat-interface";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <ChatInterface />
      </div>
    </div>
  );
}