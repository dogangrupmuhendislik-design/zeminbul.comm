import * as React from 'react';
import { Message } from '../types';
import { supabase } from '../utils/supabaseClient';
import { PaperAirplaneIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';

interface ChatScreenProps {
    conversationId: string;
    onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ conversationId, onBack }) => {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [newMessage, setNewMessage] = React.useState('');
    const [userId, setUserId] = React.useState<string | null>(null);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    React.useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const { data, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('conversation_id', conversationId)
                    .order('created_at', { ascending: true });

                if (error) {
                    console.error("Error fetching messages:", error);
                } else {
                    setMessages(data);
                }
            }
            setLoading(false);
        };
        fetchInitialData();
    }, [conversationId]);

    React.useEffect(() => {
        const channel = supabase.channel(`messages:${conversationId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
                const newMessage = payload.new as Message;
                // Avoid adding our own sent message twice
                if(newMessage.sender_id !== userId) {
                    setMessages(currentMessages => [...currentMessages, newMessage]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, userId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !userId) return;

        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            conversation_id: conversationId,
            sender_id: userId,
            content: content
        };
        
        setMessages(current => [...current, tempMessage]);
        setNewMessage('');
        
        const { error } = await supabase.from('messages').insert({
            conversation_id: conversationId,
            sender_id: userId,
            content: content,
        });

        if (error) {
            console.error("Error sending message:", error);
            // Revert optimistic update on error
            setMessages(current => current.filter(m => m.id !== tempMessage.id));
            setNewMessage(content); // Put the message back in the input
        }
    };
    
    return (
        <div className="h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
            <Header onBack={onBack} />
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? <DrillingRigLoader /> : (
                    <>
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} isSender={msg.sender_id === userId} />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </main>
            <MessageInput 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onSubmit={handleSendMessage}
            />
        </div>
    );
};

const Header: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <header className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-10 flex items-center">
        <button onClick={onBack} className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 flex-grow">Sohbet</h1>
        <div className="w-10"></div>
    </header>
);

interface MessageBubbleProps {
    message: Message;
    isSender: boolean;
}
const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isSender }) => (
    <div className={`flex items-end gap-2 ${isSender ? 'justify-end' : ''}`}>
        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isSender ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-lg'}`}>
            <p className="text-sm">{message.content}</p>
        </div>
    </div>
);

interface MessageInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
}
const MessageInput: React.FC<MessageInputProps> = ({ value, onChange, onSubmit }) => (
    <footer className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={onSubmit} className="flex items-center gap-3">
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder="Mesajınızı yazın..."
                className="flex-1 w-full p-3 border border-gray-300 dark:border-gray-600 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-gray-100 dark:bg-gray-700 dark:text-white"
            />
            <button type="submit" className="flex-shrink-0 h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50" disabled={!value.trim()}>
                <PaperAirplaneIcon className="h-6 w-6" />
            </button>
        </form>
    </footer>
);

export default ChatScreen;