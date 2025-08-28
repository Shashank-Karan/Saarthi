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
    <div className="flex flex-col h-[calc(100vh-5rem)] sm:h-[85vh] bg-white border border-gray-300 overflow-hidden rounded-lg mx-2 sm:mx-0">
      {/* Clean Header */}
      <div className="border-b border-gray-200 px-4 py-3 bg-white">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
            <span className="text-sm">🕉️</span>
          </div>
          <h3 className="ml-3 font-medium text-gray-900">SaarthiAI</h3>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-white space-y-4 sm:space-y-6" data-testid="chat-messages">
        {!user ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-600">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🕉️</span>
              </div>
              <p className="text-lg font-medium mb-2">Welcome to Spiritual Guidance</p>
              <p className="text-gray-500">Please sign in to start your journey with our AI spiritual guide</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-gray-500">Loading your conversations...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-start mb-6">
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🕉️</span>
              </div>
              <div className="rounded-lg px-4 py-3 bg-gray-100 border border-gray-200 break-words">
                <p className="text-gray-900 leading-relaxed">
                  🙏 Namaste! I'm here to help you explore the profound wisdom of Hindu scriptures. 
                  What would you like to learn about today?
                </p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg: ChatMessageWithUser, index) => (
            <div
              key={msg.id}
              className={`flex mb-6 ${
                msg.is_ai_response ? 'justify-start' : 'justify-end'
              }`}
            >
              <div className={`flex items-start space-x-3 max-w-[85%] ${
                msg.is_ai_response ? '' : 'flex-row-reverse space-x-reverse'
              }`}>
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  msg.is_ai_response ? 'border-gray-300' : 'border-blue-300 bg-blue-50'
                }`}>
                  {msg.is_ai_response ? (
                    <span className="text-sm">🕉️</span>
                  ) : (
                    <span className="text-sm text-blue-600">👤</span>
                  )}
                </div>
                <div className={`rounded-lg px-4 py-3 break-words ${
                  msg.is_ai_response 
                    ? 'bg-gray-100 border border-gray-200' 
                    : 'bg-blue-500 text-white border border-blue-500'
                }`}>
                  <p className={`leading-relaxed ${
                    msg.is_ai_response ? 'text-gray-900' : 'text-white'
                  }`}>
                    {msg.content}
                  </p>
                  <p className={`text-xs mt-2 ${
                    msg.is_ai_response ? 'text-gray-500' : 'text-blue-100'
                  }`}>
                    {safeFormatDate(msg.createdAt, 'h:mm a')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
        {sendMessageMutation.isPending && (
          <div className="flex justify-start mb-6">
            <div className="flex items-start space-x-3 max-w-[85%]">
              <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">🕉️</span>
              </div>
              <div className="rounded-lg px-4 py-3 bg-gray-100 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-gray-600">SaarthiAI is typing...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Clean Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
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
              className="w-full border-2 border-gray-300 rounded-none px-4 py-3 focus:border-blue-400 focus:outline-none text-gray-900 placeholder-gray-500 bg-white"
              data-testid="input-chat-message"
            />
          </div>
          <Button
            type="submit"
            disabled={!user || !message.trim() || sendMessageMutation.isPending}
            className="px-4 py-3 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-600 disabled:bg-gray-100 disabled:text-gray-400 transition-colors duration-200"
            data-testid="button-send-message"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
