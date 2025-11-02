import * as React from 'react';
import { Message, Profile } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { UserIcon, BuildingOffice2Icon } from '../components/icons';

interface AdminViewChatScreenProps {
    conversationId: string;
}

interface Participant {
    id: string;
    name: string;
    avatar_url?: string;
    role: 'customer' | 'provider';
}

const AdminViewChatScreen: React.FC<AdminViewChatScreenProps> = ({ conversationId }) => {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [participants, setParticipants] = React.useState<Record<string, Participant>>({});
    const [loading, setLoading] = React.useState(true);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages]);

    React.useEffect(() => {
        const fetchChatData = async () => {
            setLoading(true);

            // Fetch conversation details to identify participants
            const { data: convoData, error: convoError } = await supabase
                .from('conversations')
                .select('customer:customer_id(id, name, avatar_url), provider:provider_id(id, company_name, logo_url)')
                .eq('id', conversationId)
                .single();
            
            if (convoError || !convoData) {
                console.error("Error fetching conversation details:", convoError);
                setLoading(false);
                return;
            }

            const fetchedParticipants: Record<string, Participant> = {};
            if (convoData.customer) {
                fetchedParticipants[(convoData.customer as any).id] = { ...(convoData.customer as any), role: 'customer' };
            }
            if (convoData.provider) {
                fetchedParticipants[(convoData.provider as any).id] = { id: (convoData.provider as any).id, name: (convoData.provider as any).company_name, avatar_url: (convoData.provider as any).logo_url, role: 'provider' };
            }
            setParticipants(fetchedParticipants);

            // Fetch messages
            const { data: messagesData, error: messagesError } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });

            if (messagesError) {
                console.error("Error fetching messages:", messagesError);
            } else {
                setMessages(messagesData);
            }
            setLoading(false);
        };
        fetchChatData();
    }, [conversationId]);

    const getParticipantIcon = (role: 'customer' | 'provider') => {
        return role === 'customer' ? <UserIcon className="h-6 w-6" /> : <BuildingOffice2Icon className="h-6 w-6" />;
    };

    return (
        <div className="h-full bg-gray-100 flex flex-col" style={{ minHeight: 'calc(100vh - 150px)' }}>
            <main className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? <DrillingRigLoader /> : (
                    <>
                        {messages.map((msg) => {
                            const participant = participants[msg.sender_id];
                            if (!participant) return null;
                            return <MessageBubble key={msg.id} message={msg} participant={participant} />;
                        })}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </main>
             <footer className="p-4 bg-yellow-50 border-t border-yellow-200 text-center text-sm text-yellow-800">
                Bu sohbeti sadece görüntülemektesiniz. Mesaj gönderemezsiniz.
            </footer>
        </div>
    );
};

const MessageBubble: React.FC<{ message: Message; participant: Participant }> = ({ message, participant }) => (
    <div className="flex items-start gap-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
            {participant.avatar_url ? (
                <img src={participant.avatar_url} alt={participant.name} className="h-full w-full object-cover" />
            ) : (
                participant.role === 'customer' ? <UserIcon className="h-6 w-6" /> : <BuildingOffice2Icon className="h-6 w-6" />
            )}
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-2">
                <p className="font-bold">{participant.name}</p>
                <p className="text-xs text-gray-400">{new Date(message.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="mt-1 max-w-xs md:max-w-md p-3 rounded-lg bg-white shadow-sm border">
                <p className="text-sm text-gray-800">{message.content}</p>
            </div>
        </div>
    </div>
);

export default AdminViewChatScreen;