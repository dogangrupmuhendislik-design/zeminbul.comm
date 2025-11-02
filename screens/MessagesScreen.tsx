import * as React from 'react';
import { View, Conversation } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { BuildingOffice2Icon, UserIcon } from '../components/icons';

interface MessagesScreenProps {
    onNavigate: (view: View, id?: string) => void;
    onViewMessages: () => void;
}

const MessagesScreen: React.FC<MessagesScreenProps> = ({ onNavigate, onViewMessages }) => {
    const [conversations, setConversations] = React.useState<Conversation[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [userId, setUserId] = React.useState<string | null>(null);

    React.useEffect(() => {
        onViewMessages();
    }, [onViewMessages]);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const { data, error } = await supabase
                    .from('conversations')
                    .select(`
                        *,
                        job_listings ( title ),
                        customer:customer_id ( name, avatar_url ),
                        provider:provider_id ( company_name, logo_url ),
                        messages ( content, created_at )
                    `)
                    .or(`customer_id.eq.${user.id},provider_id.eq.${user.id}`)
                    .order('created_at', { foreignTable: 'messages', ascending: false });

                if (error) {
                    console.error("Error fetching conversations:", error);
                } else {
                    setConversations(data as any[]);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return (
             <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                <Header />
                <DrillingRigLoader />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <main className="p-4">
                {conversations.length > 0 ? (
                    <div className="space-y-3">
                        {conversations.map(convo => (
                            <ConversationItem 
                                key={convo.id}
                                conversation={convo}
                                currentUserId={userId!}
                                onSelect={() => onNavigate('chat', convo.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </main>
        </div>
    );
};

const Header: React.FC = () => (
    <header className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-10">
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">Mesajlar</h1>
    </header>
);

const EmptyState: React.FC = () => (
    <div className="text-center mt-20">
         <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Henüz Mesaj Yok</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Bir firma teklifinizi kabul ettiğinde veya bir müşteri teklifinizi kabul ettiğinde sohbetleriniz burada görünecektir.</p>
    </div>
);

interface ConversationItemProps {
    conversation: Conversation;
    currentUserId: string;
    onSelect: () => void;
}
const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, currentUserId, onSelect }) => {
    const isCustomer = currentUserId === conversation.customer_id;
    const name = isCustomer ? conversation.provider?.company_name : conversation.customer?.name;
    const avatar = isCustomer ? conversation.provider?.logo_url : conversation.customer?.avatar_url;
    const Icon = isCustomer ? BuildingOffice2Icon : UserIcon;
    const lastMessage = conversation.messages?.[0];

    return (
        <div onClick={onSelect} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-center gap-4">
                 <div className="flex-shrink-0 h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {avatar ? (
                        <img src={avatar} alt={name} className="h-full w-full object-cover" />
                    ) : (
                        <Icon className="h-8 w-8 text-gray-500" />
                    )}
                </div>
                <div className="flex-grow overflow-hidden">
                    <div className="flex justify-between items-start">
                        <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{name}</p>
                        {lastMessage && <p className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{new Date(lastMessage.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 font-medium truncate">{conversation.job_listings?.title}</p>
                </div>
            </div>
        </div>
    );
};

export default MessagesScreen;