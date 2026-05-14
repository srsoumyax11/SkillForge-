import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  content: string;
}

interface AILabProps {
  courseContext?: string;
  className?: string;
}

export default function AILab({ courseContext, className }: AILabProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          context: courseContext,
          history: messages.map(m => ({ 
            role: m.role === "user" ? "user" : "model", 
            parts: [{ text: m.content }] 
          }))
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: "model", content: data.text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`flex flex-col border-border/40 shadow-xl overflow-hidden bg-background/50 backdrop-blur-xl ${className} ${isExpanded ? "h-[600px]" : "h-14"}`}>
      <CardHeader className="p-3 border-b bg-primary/5 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            AI Lab Mentor
            {courseContext && <span className="text-[10px] font-normal text-muted-foreground uppercase tracking-widest px-2 py-0.5 bg-muted rounded">In Context</span>}
          </CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 rounded-full" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100%" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col flex-1"
          >
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full px-4 pt-4" ref={scrollRef}>
                <div className="space-y-6 pb-4">
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bot className="w-6 h-6 text-primary" />
                      </div>
                      <h4 className="font-bold mb-2">Hello! I'm your AI Mentor</h4>
                      <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
                        Ask me anything about your course material, coding challenges, or AI concepts.
                      </p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                      <Avatar className="h-8 w-8 flex-shrink-0 border">
                        {m.role === "model" ? (
                          <>
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary/10 text-primary"><Bot className="w-4 h-4" /></AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarFallback className="bg-muted text-muted-foreground"><User className="w-4 h-4" /></AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                        m.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted/50 border border-border/40 rounded-tl-none"
                      }`}>
                        <div className="markdown-body">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 animate-pulse">
                        <AvatarFallback className="bg-primary/10"><Bot className="w-4 h-4" /></AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/50 border border-border/40 rounded-2xl rounded-tl-none px-4 py-2.5">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>

            <CardFooter className="p-4 border-t bg-muted/5">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex w-full gap-2"
              >
                <Input 
                  placeholder="Ask a question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 rounded-full border-border/40 focus-visible:ring-primary shadow-inner"
                  autoFocus
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading || !input.trim()}
                  className="rounded-full shadow-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
