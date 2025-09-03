import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type ChatMessageWithUser } from "@/types/api";
import { format, isValid } from "date-fns";

// Safe date formatting utility
const safeFormatDate = (dateString: string, formatStr: string) => {
  try {
    const date = new Date(dateString);
    if (isValid(date)) {
      return format(date, formatStr);
    }
    return '';
  } catch {
    return '';
  }
};

export function ChatInterface() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<ChatMessageWithUser[]>({
    queryKey: ["/api/chat/messages"],
    enabled: !!user,
    refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    refetchIntervalInBackground: true, // Continue polling even when window is not focused
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/chat/messages", { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] md:h-[85vh] border border-gray-300 overflow-hidden rounded-none sm:rounded-lg mx-0 sm:mx-2 lg:mx-0">
      {/* Updated Header with Title and Subtitle */}
      <div className="border-b border-gray-200 px-3 sm:px-4 py-4 sm:py-6 text-center">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-orange-500 mb-1 sm:mb-2">
          Chat with Saarthi
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm">
          Your AI friend for guidance and reflection.
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-6 space-y-3 sm:space-y-4 md:space-y-6" data-testid="chat-messages">
        {!user ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-600 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-2xl sm:text-3xl">🕉️</span>
              </div>
              <p className="text-base sm:text-lg font-medium mb-2">Welcome to Spiritual Guidance</p>
              <p className="text-gray-500 text-sm sm:text-base">Please sign in to start your journey with our AI spiritual guide</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-orange-500" />
              <p className="text-gray-500 text-sm sm:text-base">Loading your conversations...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <div className="text-left">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Saarthi</h3>
              <div className="bg-gray-100 border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 break-words">
                <p className="text-gray-900 leading-relaxed text-sm sm:text-base">
                  Hello! I am Saarthi, your friend and guide. How are you feeling today? Let's talk.
                </p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg: ChatMessageWithUser, index) => (
            <div
              key={msg.id}
              className={`flex flex-col space-y-1 sm:space-y-2 mb-4 sm:mb-6 ${
                msg.is_ai_response ? 'items-start' : 'items-start'
              }`}
            >
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 ml-1">
                {msg.is_ai_response ? 'Saarthi' : 'You'}
              </h3>
              <div className={`rounded-lg px-3 sm:px-4 py-2 sm:py-3 break-words max-w-[90%] sm:max-w-[85%] ${
                msg.is_ai_response 
                  ? 'bg-gray-100 border border-gray-200' 
                  : 'bg-blue-500 text-white border border-blue-500'
              }`}>
                <p className={`leading-relaxed text-sm sm:text-base ${
                  msg.is_ai_response ? 'text-gray-900' : 'text-white'
                }`}>
                  {msg.content}
                </p>
              </div>
            </div>
          ))
        )}
        {sendMessageMutation.isPending && (
          <div className="flex flex-col space-y-1 sm:space-y-2 mb-4 sm:mb-6 items-start">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 ml-1">Saarthi</h3>
            <div className="rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-gray-100 border border-gray-200 max-w-[90%] sm:max-w-[85%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="text-gray-600 text-sm sm:text-base">Saarthi is typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-2 sm:p-3 md:p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2 sm:space-x-3">
          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                user
                  ? "Type your message..."
                  : "Please sign in to chat..."
              }
              disabled={!user || sendMessageMutation.isPending}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:border-orange-400 focus:outline-none text-gray-900 placeholder-gray-500 text-sm sm:text-base"
              data-testid="input-chat-message"
            />
          </div>
          <Button
            type="submit"
            disabled={!user || !message.trim() || sendMessageMutation.isPending}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300 disabled:text-gray-500 transition-colors duration-200 rounded-lg flex-shrink-0"
            data-testid="button-send-message"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            ) : (
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>
        </form>
        <p className="text-xs text-gray-400 mt-2 sm:mt-3 text-center px-2">
          Saarthi may display inaccurate info. Consider checking important information.
        </p>
      </div>
    </div>
  );
}
