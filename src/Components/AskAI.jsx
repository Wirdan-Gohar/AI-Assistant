import { useEffect, useState, useRef } from "react";
import "./AskAI.css";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowDown, ArrowUp } from "lucide-react";

export default function AskAI({
    aiPrompt,
    setAiPrompt,
    aiResponse,
    setAiResponse,
    isAiLoading,
    setIsAiLoading
}) {
    const [chats, setChats] = useState(() => {
        const saved = localStorage.getItem("chatHistory");
        return saved ? JSON.parse(saved) : [];
    });
    const [currentChatId, setCurrentChatId] = useState(() => {
        const saved = localStorage.getItem("currentChatId");
        return saved || null;
    });
    const [currentMessages, setCurrentMessages] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const messagesEndRef = useRef(null);
    const [showButton, setShowButton] = useState(false);
    // Load current chat messages
    useEffect(() => {
        if (currentChatId) {
            const chat = chats.find(c => c.id === currentChatId);
            setCurrentMessages(chat?.messages || []);
        } else {
            setCurrentMessages([]);
        }
    }, [currentChatId, chats]);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem("chatHistory", JSON.stringify(chats));
    }, [chats]);

    useEffect(() => {
        if (currentChatId) {
            localStorage.setItem("currentChatId", currentChatId);
        }
    }, [currentChatId]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentMessages, isAiLoading]);

    const handleAskAI = async () => {
        if (!aiPrompt.trim()) return;

        const userMessage = { role: "user", content: aiPrompt };
        let chatId = currentChatId;

        // Create new chat if none exists
        if (!chatId) {
            chatId = Date.now().toString();
            const newChat = {
                id: chatId,
                title: aiPrompt.slice(0, 30) + (aiPrompt.length > 30 ? "..." : ""),
                messages: [userMessage],
                createdAt: new Date().toISOString()
            };
            setChats(prev => [newChat, ...prev]);
            setCurrentChatId(chatId);
        } else {
            // Add to existing chat
            setChats(prev => prev.map(chat =>
                chat.id === chatId
                    ? { ...chat, messages: [...chat.messages, userMessage] }
                    : chat
            ));
        }

        setAiPrompt(""); // Clear input
        setIsAiLoading(true);

        try {
            console.log("🚀 Sending request with prompt:", aiPrompt);
            const response = await fetch("/ask-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: aiPrompt }),
            });

            console.log("📡 Response status:", response.status);
            const data = await response.json();
            console.log("📦 Response data:", data);

            if (data.answer) {
                const aiMessage = { role: "assistant", content: data.answer };
                console.log("✅ Adding AI message to chat:", aiMessage);
                setChats(prev => {
                    const updated = prev.map(chat =>
                        chat.id === chatId
                            ? { ...chat, messages: [...chat.messages, aiMessage] }
                            : chat
                    );
                    console.log("💾 Updated chats:", updated);
                    return updated;
                });
            } else if (data.error) {
                console.error("❌ API Error:", data.error);
                const errorMessage = { role: "assistant", content: `Error: ${data.error}` };
                setChats(prev => prev.map(chat =>
                    chat.id === chatId
                        ? { ...chat, messages: [...chat.messages, errorMessage] }
                        : chat
                ));
            }
        } catch (err) {
            console.error("💥 Fetch error:", err);
            const errorMessage = { role: "assistant", content: "Error connecting to AI." };
            setChats(prev => prev.map(chat =>
                chat.id === chatId
                    ? { ...chat, messages: [...chat.messages, errorMessage] }
                    : chat
            ));
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleNewChat = () => {
        setCurrentChatId(null);
        setCurrentMessages([]);
        setAiPrompt("");
    };

    const handleSelectChat = (chatId) => {
        setCurrentChatId(chatId);
    };

    const handleDeleteChat = (chatId, e) => {
        e.stopPropagation();
        setChats(prev => prev.filter(chat => chat.id !== chatId));
        if (currentChatId === chatId) {
            handleNewChat();
        }
    };
    const moveDown = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleScroll = () => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Hide if within 100px of the bottom
        const isAtBottom = documentHeight - (scrollY + windowHeight) < 100;
        console.log("isAtBottom", isAtBottom);
        setShowButton(!isAtBottom);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (
        <div className="chat-app">
            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <button className="new-chat-btn" onClick={handleNewChat}>
                    + New Chat
                </button>
                <div className="chat-list">
                    {chats.map(chat => (
                        <div
                            key={chat.id}
                            className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
                            onClick={() => handleSelectChat(chat.id)}
                        >
                            <span className="chat-title">{chat.title}</span>
                            <button
                                className="delete-chat-btn"
                                onClick={(e) => handleDeleteChat(chat.id, e)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="chat-container">
                <div className="chat-header">
                    <button className="toggle-sidebar-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        ☰
                    </button>
                    Wirdan's AI Assistant
                </div>

                <div className="chat-messages">
                    {currentMessages.length === 0 && !isAiLoading && (
                        <div style={{ color: '#676767', textAlign: 'center', marginTop: '20%' }}>
                            Ask me anything!
                        </div>
                    )}

                    {currentMessages.map((msg, idx) => (
                        <div key={idx} className={msg.role === "user" ? "user-bubble" : "ai-bubble"}>
                            {msg.role === "assistant" ? (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        a: ({ node, ...linkProps }) => {
                                            const isFakeLink = linkProps.href?.includes('sandbox:');
                                            if (isFakeLink) {
                                                return (
                                                    <button className="real-download-btn">
                                                        📥 Click Here to Download Real PDF
                                                    </button>
                                                );
                                            }
                                            return <a {...linkProps} target="_blank" rel="noreferrer">{linkProps.children}</a>;
                                        }
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </div>
                    ))}

                    {isAiLoading && (
                        <div className="ai-bubble typing-dots">
                            AI is thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-wrapper">
                    <div className="chat-input-container">
                        <textarea
                            rows="1"
                            placeholder="Message AI..."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAskAI();
                                }
                            }}
                        />
                        <button
                            className="send-btn"
                            onClick={handleAskAI}
                            disabled={isAiLoading || !aiPrompt.trim()}
                        >
                            {isAiLoading ? "..." : <ArrowUp size={20} strokeWidth={2.5} />}
                        </button>
                    </div>
                </div>
                {/* <div ref={bottomRef} /> */}
                {showButton && <button
                    className="scroll-down-btn"
                    onClick={moveDown}
                    style={{ position: 'fixed', bottom: '100px', right: '20px' }}
                >
                    <ArrowDown size={20} strokeWidth={2.5} />
                </button>}
            </div>
        </div>
    );
}