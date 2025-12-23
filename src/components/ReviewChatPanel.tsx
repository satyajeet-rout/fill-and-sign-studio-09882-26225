import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, X } from "lucide-react";

interface ReviewChatPanelProps {
  pdfObjectUrl?: string | null;
  onClose?: () => void;
}

const ReviewChatPanel = ({ pdfObjectUrl, onClose }: ReviewChatPanelProps) => {
  const [messages, setMessages] = useState<{ id: string; type: "user" | "assistant"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pdfObjectUrl) {
      setMessages([{ id: "init", type: "assistant", text: "PDF loaded into chat context." }]);
    }
  }, [pdfObjectUrl]);

  const send = async () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), type: "user", text: input }]);
    setInput("");
    setLoading(true);

    // Simulate AI response using pdf context
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: "assistant", text: `Simulated AI reply about the PDF: (pdf present: ${!!pdfObjectUrl})` }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-start justify-between">
        <div>
          <h3 className="font-semibold">AI Chat</h3>
          <p className="text-sm text-muted-foreground">Chat with your filled form</p>
        </div>
        <div>
          <Button variant="ghost" size="icon" onClick={() => onClose?.()} aria-label="Close chat">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m.id} className={m.type === "user" ? "text-right" : "text-left"}>
              <div className={`inline-block px-3 py-2 rounded-lg ${m.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-left">
              <div className="inline-block px-3 py-2 rounded-lg bg-muted"><Loader2 className="w-4 h-4 animate-spin" /></div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} />
          <Button onClick={send} disabled={loading || !input.trim()} size="icon"><Send className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewChatPanel;
