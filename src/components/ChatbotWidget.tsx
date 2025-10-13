import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Bot, X, Minimize2, Maximize2 } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

interface ChatbotWidgetProps {
  lat?: number;
  lng?: number;
  isFloating?: boolean;
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  lat,
  lng,
  isFloating = true,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hello 👋 I'm your AI travel assistant. Ask me anything about your location, safety tips, weather, or local attractions!",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- STREAM HANDLER ---
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

    const botMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: botMessageId, type: "bot", content: "", timestamp: new Date() },
    ]);
const API_URL = import.meta.env.VITE_API_URL;
 
    try {
      const token = localStorage.getItem("token"); // 🔑 fetch token saved at login

      const res = await fetch(`${API_URL}/api/ai-assistant-stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          messages: messages
            .map((m) => ({
              role: m.type === "user" ? "user" : "assistant",
              content: m.content,
            }))
            .concat({ role: "user", content: userMessage.content }),
          latitude: lat,
          longitude: lng,
        }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let botContent = "";
      const updateBotMessage = (newText: string) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMessageId ? { ...m, content: newText } : m
          )
        );
      };

      let buffer = "";
      const flushInterval = 50;
      let lastFlush = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        chunk.split("\n").forEach((line) => {
          line = line.trim();
          if (!line || !line.startsWith("data:")) return;

          const jsonStr = line.replace(/^data: /, "").trim();
          if (jsonStr === "[DONE]") return;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              buffer += delta;
              const now = Date.now();
              if (now - lastFlush > flushInterval) {
                botContent += buffer;
                updateBotMessage(botContent);
                buffer = "";
                lastFlush = now;
              }
            }
          } catch (err) {
            console.error("Failed to parse chunk:", err);
          }
        });
      }

      if (buffer) {
        botContent += buffer;
        updateBotMessage(botContent);
      }
    } catch (err) {
      console.error("Streaming failed", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMessageId
            ? { ...m, content: "⚠️ Bot failed. Please try again." }
            : m
        )
      );
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

  // --- CONTAINER CLASS ---
  const containerClass = isFloating
    ? `fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isExpanded
          ? "w-[28rem] h-[650px]"
          : isMinimized
          ? "w-16 h-16"
          : "w-96 h-[500px]"
      }`
    : "w-full h-full";

  // --- MINIMIZED FLOATING BUTTON ---
  if (isFloating && isMinimized) {
    return (
      <div className={containerClass}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg hover:scale-110 transition-transform"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Card className="h-full flex flex-col border border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <Bot className="h-5 w-5 text-green-600" />
            AI Assistant
          </div>
          {isFloating && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-6 w-6 p-0"
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`prose prose-sm max-w-full rounded-2xl px-4 py-3 shadow-sm whitespace-pre-wrap ${
                  msg.type === "user"
                    ? "bg-green-600 text-white rounded-br-none"
                    : "bg-gray-50 text-gray-900 border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Bot typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-500 italic">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t bg-white px-4 py-3 sticky bottom-0">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 shadow-sm">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Send a message..."
              className="flex-1 border-0 bg-transparent focus:ring-0"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 rounded-full w-10 h-10 flex items-center justify-center"
            >
              <Send className="h-4 w-4 text-white" />
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            AI may make mistakes. Verify critical info.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ChatbotWidget;
