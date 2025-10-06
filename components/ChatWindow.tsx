import React, { useState, useRef, useEffect } from 'react';
// Correct: Import GoogleGenAI and Chat for chat functionality.
import { GoogleGenAI, Chat } from "@google/genai";

const mockAIResponse = (message: string) => {
    return new Promise<string>(resolve => {
        setTimeout(() => {
            resolve(`He recibido tu mensaje: "${message}". Como asistente virtual, puedo ayudarte con preguntas sobre nuestros productos, horarios y pedidos especiales. ¿En qué puedo ayudarte?`);
        }, 1000);
    });
};


type Message = {
    text: string;
    isUser: boolean;
};

const ChatWindow: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setMessages([
                { text: '¡Hola! Soy el asistente virtual de El Horno de Móstoles. ¿Cómo puedo ayudarte hoy?', isUser: false }
            ]);
            // Correct: Initialize Gemini client with API key from environment variables.
            if (!process.env.API_KEY) {
                console.warn("API_KEY environment variable not set. Using mock responses.");
            } else {
                try {
                    // Correct: Initialize GoogleGenAI with a named apiKey parameter.
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    // Correct: Use ai.chats.create to start a new chat session.
                    const chatSession = ai.chats.create({
                        // Correct: Use a valid and recommended model.
                        model: 'gemini-2.5-flash',
                        config: {
                            systemInstruction: 'Eres un asistente amigable y servicial para una panadería llamada "El Horno de Móstoles". Responde preguntas sobre productos, horarios, ubicación e ingredientes. Sé conciso y amable.',
                        },
                    });
                    setChat(chatSession);
                } catch (error) {
                    console.error("Error initializing Gemini:", error);
                     setMessages(prev => [...prev, { text: "Lo siento, no puedo conectarme con el asistente en este momento.", isUser: false }]);
                }
            }
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { text: input, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            let responseText: string;
            if (chat) {
                // Correct: Use chat.sendMessage to send a message in the session.
                const response = await chat.sendMessage({ message: input });
                // Correct: Access the response text directly from the .text property.
                responseText = response.text;
            } else {
                // Fallback to mock if chat isn't initialized
                responseText = await mockAIResponse(input);
            }
            const aiMessage: Message = { text: responseText, isUser: false };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { text: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.', isUser: false };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-amber-800 text-white rounded-full p-4 shadow-lg hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-700 z-50 transition-transform transform hover:scale-110"
                aria-label="Abrir chat"
            >
                {isOpen ? (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )}
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] bg-white rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden border border-stone-200">
                    <div className="bg-amber-800 text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold text-lg">Asistente Virtual</h3>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto bg-stone-50">
                        <div className="flex flex-col space-y-4">
                           {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${msg.isUser ? 'bg-amber-200 text-stone-800' : 'bg-white text-stone-700 border border-stone-200'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                     <div className="rounded-lg px-4 py-2 bg-white text-stone-700 border border-stone-200">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse delay-75"></div>
                                            <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse delay-150"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    <div className="p-4 bg-white border-t border-stone-200">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 px-3 py-2 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading || input.trim() === ''} className="bg-amber-800 text-white rounded-full p-3 disabled:bg-stone-400 hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-700">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWindow;
