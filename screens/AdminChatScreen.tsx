import * as React from 'react';
import { AdminMessage } from '../types';
import { supabase } from '../utils/supabaseClient';
import { PaperAirplaneIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';

interface AdminChatScreenProps {
    recipientId: string;
    currentAdminId: string;
}

const AdminChatScreen: React.FC<AdminChatScreenProps> = ({ recipientId, currentAdminId }) => {
    const [messages, setMessages] = React.useState<AdminMessage[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [newMessage, setNewMessage] = React.useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(scrollToBottom, [messages]);

    React.useEffect(() => {
        // NOTE: The 'admin_messages' table is a conceptual addition for this feature
        // and may not exist in the base schema. This code assumes it exists.
        const fetchMessages = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('admin_messages')
                .select('*')
                .or(`(sender_id.eq.${currentAdminId},receiver_id.eq.${recipientId}),(sender_id.eq.${recipientId},receiver_id.eq.${currentAdminId})`)
                .order('created_at', { ascending: true });
            
            if (error) {
                console.error("Error fetching admin messages:", error);
            } else {
                setMessages(data as AdminMessage[]);
            }
            setLoading(false);
        };
        fetchMessages();
    }, [currentAdminId, recipientId]);

    React.useEffect(() => {
        const channel = supabase.channel(`admin-chat-${currentAdminId}-${recipientId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'admin_messages', 
                filter: `receiver_id=eq.${currentAdminId}` 
            }, (payload) => {
                const msg = payload.new as AdminMessage;
                if (msg.sender_id === recipientId) {
                     setMessages(current => [...current, msg]);
                }
            })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentAdminId, recipientId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content) return;

        const tempMessage: AdminMessage = {
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
            sender_id: currentAdminId,
            receiver_id: recipientId,
            content: content,
            read: false
        };
        setMessages(current => [...current, tempMessage]);
        setNewMessage('');

        const { error } = await supabase.from('admin_messages').insert({
            sender_id: currentAdminId,
            receiver_id: recipientId,
            content: content,
        });

        if (error) {
            console.error("Error sending admin message:", error);
            setMessages(current => current.filter(m => m.id !== tempMessage.id));
            setNewMessage(content);
        }
    };
    
    return (
        <div className="h-full bg-gray-100 flex flex-col" style={{minHeight: 'calc(100vh - 150px)'}}>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? <DrillingRigLoader /> : (
                    <>
                        {messages.map((msg) => (
                            <MessageBubble key={msg.id} message={msg} isSender={msg.sender_id === currentAdminId} />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </main>
            <footer className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 bg-gray-100"
                    />
                    <button type="submit" className="flex-shrink-0 h-12 w-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50" disabled={!newMessage.trim()}>
                        <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                </form>
            </footer>
        </div>
    );
};

const MessageBubble: React.FC<{ message: AdminMessage; isSender: boolean; }> = ({ message, isSender }) => (
    <div className={`flex items-end gap-2 ${isSender ? 'justify-end' : ''}`}>
        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${isSender ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-white text-gray-800 rounded-bl-lg shadow-sm'}`}>
            <p className="text-sm">{message.content}</p>
        </div>
    </div>
);


export default AdminChatScreen;