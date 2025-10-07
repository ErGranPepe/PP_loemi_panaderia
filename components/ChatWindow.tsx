import React, { useState, useRef, useEffect } from 'react';
// Correct: Import GoogleGenAI and Chat for chat functionality.
import { GoogleGenAI, Chat } from "@google/genai";
import { OrderManager } from '../utils/orderManager';
import { ChatOrder } from '../types';

const mockAIResponse = (message: string) => {
    return new Promise<string>(resolve => {
        setTimeout(() => {
            // Detectar si el mensaje contiene intención de pedido
            const orderKeywords = ['quiero', 'pedido', 'encargar', 'comprar', 'necesito'];
            const hasOrderIntent = orderKeywords.some(keyword => 
                message.toLowerCase().includes(keyword)
            );
            
            if (hasOrderIntent) {
                resolve(`Perfecto, puedo ayudarte con tu pedido. ¿Qué productos te interesan? Tenemos:\n\n🍞 Panes: Hogaza de Masa Madre (4.50€), Baguette (2.20€)\n🥐 Bollería: Croissant (2.50€), Palmera de Chocolate (3.20€)\n🍰 Pasteles: Tarta de Queso (18.50€)\n🥪 Salados: Empanada de Atún (3.80€)\n\nDime qué quieres y las cantidades, y yo preparo tu pedido.`);
            } else {
                resolve(`He recibido tu mensaje: "${message}". Como asistente virtual, puedo ayudarte con preguntas sobre nuestros productos, horarios y pedidos especiales. ¿En qué puedo ayudarte?`);
            }
        }, 1000);
    });
};


type Message = {
    text: string;
    isUser: boolean;
    isOrder?: boolean;
    orderData?: ChatOrder;
};

const ChatWindow: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const [orderManager] = useState(() => OrderManager.getInstance());

    useEffect(() => {
        if (isOpen) {
            setMessages([
                { text: '¡Hola! Soy el asistente virtual de El Horno de Móstoles. ¿Cómo puedo ayudarte hoy?', isUser: false }
            ]);
            // Usar import.meta.env para variables de entorno en Vite
            if (!import.meta.env.VITE_API_KEY) {
                console.warn("API_KEY environment variable not set. Using mock responses.");
            } else {
                try {
                    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
                    // Correct: Use ai.chats.create to start a new chat session.
                    const chatSession = ai.chats.create({
                        // Correct: Use a valid and recommended model.
                        model: 'gemini-1.5-flash',
                        config: {
                            systemInstruction: `Eres un asistente de la panadería "Loemi Artesanos". 
                            
Productos disponibles:
                            🍞 Panes: Hogaza de Masa Madre (4.50€), Baguette (2.20€), Pan de Centeno (3.80€), Pan de Nueces (4.20€)
                            🥐 Bollería: Croissant (2.50€), Palmera de Chocolate (3.20€), Ensaimada (4.80€), Magdalena (1.80€)
                            🍰 Pasteles: Tarta de Queso (18.50€), Tarta de Chocolate (22.00€)
                            🥪 Salados: Empanada de Atún (3.80€), Quiche Lorraine (5.20€)
                            
Ayuda con consultas sobre productos, horarios (L-V 7-20h, S-D 8-15h) y ubicación (Móstoles). 
Para pedidos, toma nota de productos y cantidades, calcula totales y pide datos de contacto. Sé amable y natural.`,
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
        
        // Add a placeholder for the AI response
        const aiMessagePlaceholder: Message = { text: '...', isUser: false };
        setMessages(prev => [...prev, aiMessagePlaceholder]);
        
        try {
            let responseText: string;
            if (chat) {
                const response = await chat.sendMessage({ message: input });
                responseText = response.text;
            } else {
                responseText = await mockAIResponse(input);
            }
            
            // Mostrar respuesta directamente sin procesamiento especial
            setMessages(prev => prev.map((msg, i) => i === prev.length - 1 ? { ...msg, text: responseText } : msg));
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.map((msg, i) => i === prev.length - 1 ? { ...msg, text: 'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.' } : msg));
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
                <div className="fixed bottom-20 sm:bottom-24 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-full max-w-sm h-[50vh] sm:h-[60vh] bg-white rounded-lg shadow-2xl flex flex-col z-40 overflow-hidden border border-stone-200">
                    <div className="bg-amber-800 text-white p-3 sm:p-4 flex justify-between items-center">
                        <h3 className="font-bold text-base sm:text-lg">Asistente Virtual</h3>
                    </div>
                    <div className="flex-1 p-2 sm:p-4 overflow-y-auto bg-stone-50">
                        <div className="flex flex-col space-y-4">
                           {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`rounded-lg px-3 py-2 max-w-[250px] sm:max-w-xs lg:max-w-md text-sm ${msg.isUser ? 'bg-amber-200 text-stone-800' : 'bg-white text-stone-700 border border-stone-200'}`}>
                                        {msg.text === '...' && !msg.isUser ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse"></div>
                                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse delay-75"></div>
                                                <div className="w-2 h-2 bg-stone-400 rounded-full animate-pulse delay-150"></div>
                                            </div>
                                        ) : (
                                            <>
                                                {msg.text}
                                                {msg.isOrder && msg.orderData && (
                                                    <div className="mt-3">
                                                        <button
                                                            onClick={() => {
                                                                const whatsappMessage = `Hola, confirmo mi pedido:\n\n${msg.orderData!.items.map(item => `• ${item.product} x${item.quantity} - ${item.price}€`).join('\n')}\n\nTotal: ${msg.orderData!.total}€\n\nDatos: ${msg.orderData!.customerInfo.name} - ${msg.orderData!.customerInfo.phone}`;
                                                                const whatsappUrl = `https://wa.me/34912345678?text=${encodeURIComponent(whatsappMessage)}`;
                                                                window.open(whatsappUrl, '_blank');
                                                            }}
                                                            className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center space-x-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                                            </svg>
                                                            <span>Enviar por WhatsApp</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    <div className="p-2 sm:p-4 bg-white border-t border-stone-200">
                        <div className="flex space-x-1 sm:space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Escribe tu mensaje..."
                                className="flex-1 px-3 py-2 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
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
