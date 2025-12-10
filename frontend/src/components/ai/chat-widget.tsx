"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Sparkles, X, Send, Bot, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    role: "user" | "ai";
    content: string;
};

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "ai",
            content: "Hello! I'm your HotelStock AI assistant. Ask me anything about your inventory or reports."
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        // Mock AI response for MVP
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: "I'm a demo AI right now, but soon I'll be able to query your live database! Try asking about 'waste costs' or 'low stock' later."
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {isOpen && (
                <GlassCard className="w-[350px] md:w-[400px] h-[500px] flex flex-col p-0 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-300 border-primary/20">
                    {/* Header */}
                    <div className="p-4 border-b border-border bg-primary/10 flex items-center justify-between backdrop-blur-md">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Hotel AI</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-muted-foreground">Online</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/40 custom-scrollbar" ref={scrollRef}>
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex gap-3 max-w-[85%]",
                                    m.role === "user" ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                <div className={cn(
                                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
                                )}>
                                    {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-sm",
                                    m.role === "user"
                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                        : "bg-card border border-border text-foreground rounded-bl-none shadow-sm"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="h-8 w-8 rounded-full bg-card border border-border text-foreground flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-none shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-border bg-background/60 backdrop-blur-md">
                        <form onSubmit={handleSend} className="relative">
                            <Input
                                placeholder="Ask about inventory..."
                                className="pr-12 bg-background/50 border-input text-foreground focus-visible:ring-primary/50"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1 top-1 h-8 w-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                                disabled={!inputValue.trim() || isTyping}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </GlassCard>
            )}

            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 animate-in zoom-in duration-300 flex items-center justify-center"
                >
                    <Sparkles className="h-6 w-6" />
                </Button>
            )}
        </div>
    );
}
