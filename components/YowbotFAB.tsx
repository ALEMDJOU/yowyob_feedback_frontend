'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Minimize2, History, Plus } from 'lucide-react'; 
import Image from 'next/image';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
};

type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
    lastUpdate: Date;
};

export default function YowbotFAB() {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
    const [messages, setMessages] = useState<Message[]>([
        { id: 'welcome', text: "Bonjour ! Je suis YowBot, ton assistant intelligent. Comment puis-je t'aider ?", sender: 'bot', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Chargement de la position et de l'historique au démarrage
    useEffect(() => {
        const savedPos = localStorage.getItem('yowbot-position');
        if (savedPos) {
            try {
                const parsed = JSON.parse(savedPos);
                x.set(parsed.x || 0); y.set(parsed.y || 0);
            } catch (e) { console.error(e); }
        }

        const savedSessions = localStorage.getItem('yowbot-sessions');
        if (savedSessions) {
            try {
                const parsed = JSON.parse(savedSessions);
                const formatted = parsed.map((s: any) => ({
                    ...s,
                    lastUpdate: new Date(s.lastUpdate),
                    messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
                }));
                setSessions(formatted);
            } catch (e) { console.error(e); }
        }
        setIsLoaded(true);
    }, [x, y]);

    // Sauvegarde automatique des messages dans l'historique
    useEffect(() => {
        if (messages.length > 1) {
            const firstUserMsg = messages.find(m => m.sender === 'user')?.text || "Nouvelle discussion";
            const updatedSession: ChatSession = {
                id: currentSessionId,
                title: firstUserMsg.substring(0, 35) + (firstUserMsg.length > 35 ? "..." : ""),
                messages: messages,
                lastUpdate: new Date()
            };
            setSessions(prev => {
                const filtered = prev.filter(s => s.id !== currentSessionId);
                const newList = [updatedSession, ...filtered];
                localStorage.setItem('yowbot-sessions', JSON.stringify(newList));
                return newList;
            });
        }
    }, [messages, currentSessionId]);

    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, isOpen]);

    const startNewChat = () => {
        setCurrentSessionId(Date.now().toString());
        setMessages([{ id: 'welcome', text: 'Bonjour ! Comment puis-je vous aider dans cette nouvelle session ?', sender: 'bot', timestamp: new Date() }]);
        setShowHistory(false);
    };

    const loadSession = (session: ChatSession) => {
        setCurrentSessionId(session.id);
        setMessages(session.messages);
        setShowHistory(false);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isTyping) return;

        const userMsg: Message = { id: Date.now().toString(), text: inputValue, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsg.text,
                    history: messages.map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text }))
                }),
            });
            const data = await response.json();
            const botMsg: Message = { id: (Date.now() + 1).toString(), text: data.reply, sender: 'bot', timestamp: new Date() };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) { console.error(error); } finally { setIsTyping(false); }
    };

    if (!isLoaded) return null;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(10px)' }}
                        style={{
                            position: 'fixed', bottom: '100px', right: '30px',
                            width: '380px', height: '550px', maxHeight: '80vh',
                            backgroundColor: 'rgba(12, 11, 11, 0.95)', backdropFilter: 'blur(15px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.6)', display: 'flex', 
                            flexDirection: 'column', overflow: 'hidden', zIndex: 10000
                        }}
                    >
                        {/* Header avec Logo et Boutons de navigation */}
                        <div style={{ padding: '20px', background: 'linear-gradient(90deg, #6A1B9A 0%, #4A00B7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Image src="/images/logo.jpg" alt="YowBot" width={40} height={40} style={{ borderRadius: '12px', border: '2px solid rgba(255,255,255,0.2)' }} />
                                <div>
                                    <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>YowBot</div>
                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ width: 8, height: 8, backgroundColor: '#2ecc71', borderRadius: '50%' }} /> En ligne
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setShowHistory(!showHistory)} title="Historique" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px', color: 'white', cursor: 'pointer' }}>
                                    <History size={18} />
                                </button>
                                <button onClick={startNewChat} title="Nouvelle discussion" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px', color: 'white', cursor: 'pointer' }}>
                                    <Plus size={18} />
                                </button>
                                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                                    <Minimize2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#121212' }}>
                            {/* Volet Historique */}
                            <AnimatePresence>
                                {showHistory && (
                                    <motion.div
                                        initial={{ x: -380 }} animate={{ x: 0 }} exit={{ x: -380 }}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#1a1a1a', zIndex: 50, padding: '20px', overflowY: 'auto' }}
                                    >
                                        <h3 style={{ color: 'white', marginBottom: '15px', fontSize: '1rem', fontWeight: 700 }}>Historique</h3>
                                        {sessions.length === 0 && <p style={{ color: '#666', fontSize: '0.9rem' }}>Aucune discussion.</p>}
                                        {sessions.map(s => (
                                            <div key={s.id} onClick={() => loadSession(s)} style={{ 
                                                padding: '12px', borderRadius: '12px', backgroundColor: currentSessionId === s.id ? '#6A1B9A' : '#252525', 
                                                color: 'white', cursor: 'pointer', marginBottom: '10px', border: '1px solid #333'
                                            }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                                                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{s.lastUpdate.toLocaleDateString()}</div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Zone des messages */}
                            <div style={{ height: '100%', padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {messages.map((msg) => (
                                    <motion.div key={msg.id} initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }}
                                        style={{
                                            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                            backgroundColor: msg.sender === 'user' ? '#6A1B9A' : '#1e1e1e',
                                            color: 'white', padding: '12px 16px', borderRadius: '15px', maxWidth: '85%', fontSize: '0.92rem',
                                            border: msg.sender === 'bot' ? '1px solid #333' : 'none',
                                        }}
                                    >
                                        {msg.text}
                                    </motion.div>
                                ))}
                                
                                {isTyping && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: '600', paddingLeft: '5px', fontStyle: 'italic' }}
                                    >
                                        YowBot réfléchit...
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Pied de page et Input */}
                        <form onSubmit={handleSendMessage} style={{ padding: '20px', backgroundColor: '#0c0b0b', borderTop: '1px solid #333', display: 'flex', gap: '10px' }}>
                            <input
                                type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Écrivez un message..."
                                style={{ flex: 1, backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '14px', padding: '12px 16px', color: 'white', outline: 'none' }}
                            />
                            <button type="submit" disabled={!inputValue.trim()} style={{ backgroundColor: '#6A1B9A', border: 'none', borderRadius: '12px', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bouton Flottant (FAB) */}
            <motion.div
                drag dragMomentum={false}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => {
                    localStorage.setItem('yowbot-position', JSON.stringify({ x: x.get(), y: y.get() }));
                    setTimeout(() => setIsDragging(false), 100);
                }}
                onClick={() => !isDragging && setIsOpen(!isOpen)}
                style={{ x, y, position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, cursor: 'grab' }}
            >
                <div style={{ width: '65px', height: '65px', borderRadius: '22px', background: 'linear-gradient(135deg, #6A1B9A, #4A00B7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 30px rgba(106, 27, 154, 0.5)' }}>
                    {isOpen ? <X size={28} /> : <Bot size={28} />}
                </div>
            </motion.div>
        </>
    );
}