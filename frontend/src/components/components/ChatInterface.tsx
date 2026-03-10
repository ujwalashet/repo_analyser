'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
    id: string;
    role: 'assistant' | 'user';
    content: string;
}

interface ChatInterfaceProps {
    repoName: string | null;
    onSendMessage: (msg: string) => Promise<string>;
}

export function ChatInterface({ repoName, onSendMessage }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am ready to analyze your repositories. Select a repo and ask me anything about its architecture, code, or dependencies.'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (repoName) {
            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `I am now analyzing **${repoName}**. What would you like to know?`
                }
            ]);
        }
    }, [repoName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !repoName || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await onSendMessage(userMsg);
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response }]);
        } catch (error) {
            setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'An error occurred while fetching the answer. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-neutral-900 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-900 to-neutral-900 pointer-events-none" />

            <ScrollArea className="flex-1 p-6 relative z-10">
                <div className="max-w-3xl mx-auto space-y-6">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-indigo-600' : 'bg-neutral-700'
                                    }`}>
                                    {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                                </div>
                                <div className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed max-w-[85%] shadow-sm ${msg.role === 'user'
                                        ? 'bg-neutral-800 text-neutral-100'
                                        : 'bg-neutral-950 border border-neutral-800 text-neutral-300'
                                    }`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </motion.div>
                        ))}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-4"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                    <Sparkles className="w-4 h-4 text-white animate-pulse" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl bg-neutral-950 border border-neutral-800 text-neutral-400 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <div className="p-4 bg-neutral-950 border-t border-neutral-800 relative z-10">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={repoName ? `Ask about ${repoName}...` : "Select a repository first..."}
                            disabled={!repoName || isLoading}
                            className="w-full bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-full px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50 text-[15px]"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!input.trim() || !repoName || isLoading}
                            className="absolute right-2 top-2 bottom-2 w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                            <Send className="w-4 h-4 text-white" />
                        </Button>
                    </form>
                    <div className="text-center mt-3 text-xs text-neutral-500">
                        AI responses may vary. Double check the generated context against the repository.
                    </div>
                </div>
            </div>
        </div>
    );
}
