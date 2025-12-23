import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Loader2 } from "lucide-react";
import { FormField } from "../PDFEditor";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  formFields: FormField[];
  currentPage: number;
}

export const ChatPanel = ({
  isOpen,
  onClose,
  formFields,
  currentPage,
}: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      content: "Hello! I'm here to help you with your form. Ask me any questions about the fields you're filling out.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Get current page fields info
  const currentPageFields = formFields.filter(f => f.page === currentPage);

  const getFormContext = () => {
    const fieldsInfo = currentPageFields
      .map(f => `${f.name}: ${f.value || "(empty)"}`)
      .join("\n");
    
    return `Current form page ${currentPage} fields:\n${fieldsInfo || "No fields on this page"}`;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call your AI API here
      // For now, we'll use a simple mock response
      const formContext = getFormContext();
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          formContext,
          pageNumber: currentPage,
        }),
      }).catch(() => null);

      let assistantContent = "";

      if (response && response.ok) {
        const data = await response.json();
        assistantContent = data.response || "I couldn't process that. Please try again.";
      } else {
        // Mock response when API is not available
        assistantContent = generateMockResponse(input, currentPageFields);
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-response`,
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (query: string, fields: FormField[]) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("help") || lowerQuery.includes("field")) {
      const fieldNames = fields.map(f => f.name).join(", ");
      return `I can help you with this form! On the current page, you have these fields: ${fieldNames || "No fields"}. What would you like to know?`;
    }
    
    if (lowerQuery.includes("next") || lowerQuery.includes("page")) {
      return "You can navigate to the next page by clicking the 'Next' button in the toolbar, or using the page navigation controls.";
    }
    
    if (lowerQuery.includes("save") || lowerQuery.includes("download")) {
      return "To save your form, click the 'Save & Download' button. This will download your filled form as a PDF.";
    }

    if (lowerQuery.includes("signature")) {
      return "You can add signatures to your form using the Signature tool in the left sidebar. Click on the form where you want to place the signature.";
    }

    return "I'm here to help with your form! You can ask me about:\n- How to fill specific fields\n- Navigation between pages\n- How to save or download\n- Adding signatures or annotations";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 bottom-0 w-80 bg-card border-r border-border shadow-lg flex flex-col z-50 animate-in slide-in-from-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Chat with Doc</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-secondary text-secondary-foreground rounded-bl-none"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg rounded-bl-none">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => {
              if (e.key === "Enter" && !isLoading) {
                handleSendMessage();
              }
            }}
            placeholder="Ask about your form..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
