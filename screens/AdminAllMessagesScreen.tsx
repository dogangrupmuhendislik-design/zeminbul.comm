import * as React from 'react';
import { View, Conversation, Profile } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { BuildingOffice2Icon, UserIcon, MagnifyingGlassIcon } from '../components/icons';

interface AdminAllMessagesScreenProps {
    onNavigate: (view: View, id?: string) => void;
}

type ConversationWithProfiles = Conversation & {
    customer: Partial<Profile>;
    provider: Partial<Profile>;
    messages: { content: string, created_at: string }[];
};

const AdminAllMessagesScreen: React.FC<AdminAllMessagesScreenProps> = ({ onNavigate }) => {
    const [conversations, setConversations] = React.useState<ConversationWithProfiles[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');

    React.useEffect(() => {
        const fetchConversations = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('conversations')
                .select(`
                    *,
                    job_listings ( title ),
                    customer:customer_id ( name, avatar_url, company_name ),
                    provider:provider_id ( name, company_name, logo_url ),
                    messages ( content, created_at )
                `)
                .order('created_at', { foreignTable: 'messages', ascending: false });

            if (error) {
                console.error("Error fetching conversations:", error);
            } else {
                setConversations(data as any[]);
            }
            setLoading(false);
        };
        fetchConversations();
    }, []);

    const filteredConversations = React.useMemo(() => {
        if (!searchTerm) return conversations;
        const lowercasedTerm = searchTerm.toLowerCase();
        return conversations.filter(convo => {
            const customerName = convo.customer?.name?.toLowerCase() || '';
            const providerName = convo.provider?.company_name?.toLowerCase() || '';
            const jobTitle = convo.job_listings?.title?.toLowerCase() || '';
            return customerName.includes(lowercasedTerm) || providerName.includes(lowercasedTerm) || jobTitle.includes(lowercasedTerm);
        });
    }, [conversations, searchTerm]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Tüm Kullanıcı Mesajlaşmaları</h2>
            <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-3.5 left-4" />
                    <input
                        type="text"
                        placeholder="Müşteri, firma adı veya ilan başlığı ara..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-3 pl-12 border border-gray-300 rounded-lg"
                    />
                </div>
            </div>
            
            {loading ? <DrillingRigLoader /> : (
                <div className="space-y-3">
                    {filteredConversations.length > 0 ? (
                        filteredConversations.map(convo => (
                            <ConversationItem key={convo.id} conversation={convo} onSelect={() => onNavigate('adminViewChat', convo.id)} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">Mesajlaşma bulunamadı.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const ConversationItem: React.FC<{ conversation: ConversationWithProfiles, onSelect: () => void }> = ({ conversation, onSelect }) => {
    const customerName = conversation.customer?.name || 'Müşteri';
    const providerName = conversation.provider?.company_name || 'Firma';
    const lastMessage = conversation.messages?.[0];

    return (
        <div onClick={onSelect} className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:bg-gray-50">
            <p className="font-bold text-gray-800">{conversation.job_listings?.title || 'İlan Başlığı Yok'}</p>
            <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><UserIcon className="h-4 w-4"/> {customerName}</span>
                    <span className="flex items-center gap-1"><BuildingOffice2Icon className="h-4 w-4"/> {providerName}</span>
                </div>
                {lastMessage && <p className="text-xs text-gray-400">{new Date(lastMessage.created_at).toLocaleDateString('tr-TR')}</p>}
            </div>
            {lastMessage && <p className="text-sm text-gray-500 mt-2 truncate italic">"{lastMessage.content}"</p>}
        </div>
    );
}

export default AdminAllMessagesScreen;
