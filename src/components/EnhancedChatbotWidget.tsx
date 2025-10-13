import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface EnhancedChatbotWidgetProps {
  lat?: number;
  lng?: number;
  isFloating?: boolean;
}
const API_URL = import.meta.env.VITE_API_URL;
const KAPI_URL = `${API_URL}/api/api-assistant-stream`; // 👈 change to deployed backend URL

const EnhancedChatbotWidget: React.FC<EnhancedChatbotWidgetProps> = ({
  lat,
  lng,
  isFloating = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "🌟 Hello! I'm your AI-powered travel assistant. I can help you with local insights, safety tips, weather updates, and personalized recommendations based on your current location. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { token } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: "typing",
      type: "bot",
      content: "",
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      const res = await fetch(KAPI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 👈 auth if needed
        },
        body: JSON.stringify({
          message: inputMessage,
          latitude: lat,
          longitude: lng,
          context: "travel_assistance",
        }),
      });

      // Remove typing indicator
      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"));

      let botResponse =
        "⚠️ Sorry, I'm having trouble fetching details. Here's some general travel advice: stay safe, check local maps, and trust your instincts.";

      if (res.ok) {
        const data = await res.json();
        if (data.response) {
          botResponse = data.response;
        }
      } else {
        toast({
          title: "AI Assistant Notice",
          description: "Using fallback mode. Some features may be limited.",
          variant: "default",
        });
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: botResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);

      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"));

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          "🔧 I'm experiencing technical issues. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Connection Issue",
        description: "Unable to reach AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "🌤️ What's the weather like?",
    "🛡️ Is this area safe?",
    "👥 How crowded is it here?",
    "🎯 Any nearby attractions?",
    "🕐 Best time to visit?",
    "🍽️ Good restaurants nearby?",
  ];

  const containerClass = isFloating
    ? `fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isExpanded
          ? "w-96 h-[600px]"
          : isMinimized
          ? "w-16 h-16"
          : "w-80 h-96"
      }`
    : "w-full h-full";

  if (isFloating && isMinimized) {
    return (
      <div className={containerClass}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 rounded-full glass-floating hover-bounce shadow-primary bg-gradient-primary text-white"
          size="sm"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Card
        className={`${
          isFloating ? "glass-floating shadow-elegant" : "glass-strong"
        } h-full flex flex-col hover-lift`}
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="relative">
                <Bot className="h-5 w-5 text-primary" />
                <Sparkles className="h-2 w-2 text-primary absolute -top-0.5 -right-0.5 animate-pulse" />
              </div>
              AI Travel Assistant
              <Badge
                variant="outline"
                className="text-xs bg-gradient-primary text-white border-none"
              >
                AI Powered
              </Badge>
            </CardTitle>
            {isFloating && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0 rounded-full hover-scale"
                >
                  {isExpanded ? (
                    <Minimize2 className="h-3 w-3" />
                  ) : (
                    <Maximize2 className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(true)}
                  className="h-6 w-6 p-0 rounded-full hover-scale"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "bot" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center shadow-primary">
                    {message.isTyping ? (
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm transition-all duration-200 ${
                    message.type === "user"
                      ? "bg-gradient-primary text-white shadow-primary"
                      : "glass border border-border hover:shadow-soft"
                  }`}
                >
                  {message.isTyping ? (
                    <div className="flex gap-1 py-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-primary rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.type === "user"
                            ? "text-white/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </>
                  )}
                </div>

                {message.type === "user" && (
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.filter((m) => !m.isTyping).length <= 2 && (
            <div className="mb-3">
              <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Quick questions:
              </div>
              <div className="flex flex-wrap gap-1">
                {quickQuestions
                  .slice(0, isExpanded ? 6 : 4)
                  .map((question, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover-scale text-xs py-1 hover:bg-primary/10 transition-colors"
                      onClick={() => setInputMessage(question)}
                    >
                      {question}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 flex-shrink-0">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about location, safety, weather, attractions..."
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 rounded-full border-border focus:border-primary transition-colors"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="rounded-full hover-scale bg-gradient-primary text-white border-none px-3"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedChatbotWidget;
