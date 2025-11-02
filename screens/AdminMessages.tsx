import * as React from 'react';
import { View, Ticket } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { MessageIcon, UserIcon, ClockIcon, CheckBadgeIcon, ChevronRightIcon } from '../components/icons';

interface AdminTicketsProps {
    onNavigate: (view: View, id?: string) => void;
}

type TicketStatus = 'open' | 'in_progress' | 'resolved';

// Mock Data since the 'tickets' table does not exist
const MOCK_TICKETS: Ticket[] = [
    {
        id: '1',
        created_at: new Date().toISOString(),
        subject: 'Teklif Veremiyorum',
        message: 'Yeni bir ilana teklif vermeye çalıştığımda "yetersiz bakiye" hatası alıyorum ancak bakiyem yeterli görünüyor. Yardımcı olabilir misiniz?',
        user_id: 'mock_user_1',
        status: 'open',
        profiles: { name: 'Ahmet Yılmaz', email: 'ahmet@example.com' }
    },
    {
        id: '2',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        subject: 'Profilimi Güncelleyemiyorum',
        message: 'Firma bilgilerimi güncellemeye çalıştığımda değişiklikler kaydedilmiyor. Kaydet butonuna bastıktan sonra sayfa yenileniyor ve eski bilgiler geri geliyor.',
        user_id: 'mock_user_2',
        status: 'in_progress',
        profiles: { company_name: 'Geoteknik A.Ş.', email: 'info@geoteknik.com' }
    },
    {
        id: '3',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        subject: 'Öneri: Raporlama Özelliği',
        message: 'Uygulamanıza ilanları raporlama özelliği eklenirse çok daha güvenli bir platform olur. Teşekkürler.',
        user_id: 'mock_user_3',
        status: 'resolved',
        profiles: { name: 'Ayşe Kaya', email: 'ayse@example.com' }
    }
];

const AdminTickets: React.FC<AdminTicketsProps> = ({ onNavigate }) => {
    const [tickets, setTickets] = React.useState<Ticket[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<TicketStatus | 'all'>('open');

    // DEV MODE: Use mock data since 'tickets' table does not exist
    React.useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setTickets(MOCK_TICKETS);
            setLoading(false);
        }, 500);
    }, []);

    const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
        // DEV MODE: Update local state only
        setTickets(current => current.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        console.log(`DEV MODE: Ticket ${ticketId} status changed to ${newStatus}`);
    };
    
    const filteredTickets = tickets.filter(t => filter === 'all' || t.status === filter);

    return (
        <div className="space-y-6">
            <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-md">
                <FilterButton text="Açık" count={tickets.filter(t=>t.status==='open').length} active={filter === 'open'} onClick={() => setFilter('open')} />
                <FilterButton text="İşlemde" count={tickets.filter(t=>t.status==='in_progress').length} active={filter === 'in_progress'} onClick={() => setFilter('in_progress')} />
                <FilterButton text="Çözüldü" count={tickets.filter(t=>t.status==='resolved').length} active={filter === 'resolved'} onClick={() => setFilter('resolved')} />
                <FilterButton text="Tümü" count={tickets.length} active={filter === 'all'} onClick={() => setFilter('all')} />
            </div>

            {loading ? <DrillingRigLoader /> : (
                <div className="space-y-4">
                    {filteredTickets.length > 0 ? (
                        filteredTickets.map(ticket => (
                            <TicketCard 
                                key={ticket.id}
                                ticket={ticket}
                                onStatusChange={handleStatusChange}
                                onNavigate={onNavigate}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-md">
                            <CheckBadgeIcon className="h-16 w-16 mx-auto text-green-400" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">Harika!</h3>
                            <p className="mt-2 text-gray-500">{filter === 'all' ? 'Hiç destek talebi yok.' : 'Bu filtrede destek talebi bulunmuyor.'}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const FilterButton: React.FC<{ text: string; count: number; active: boolean; onClick: () => void; }> = ({ text, count, active, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 text-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
        <span>{text}</span>
        {count > 0 && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-700'}`}>{count}</span>}
    </button>
);

const StatusBadge: React.FC<{status: TicketStatus}> = ({ status }) => {
    const styles = {
        open: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800',
    };
    const text = { open: 'Açık', in_progress: 'İşlemde', resolved: 'Çözüldü' };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{text[status]}</span>;
};

const TicketCard: React.FC<{ ticket: Ticket, onStatusChange: (id: string, status: TicketStatus) => void, onNavigate: (view: View, id?: string) => void }> = ({ ticket, onStatusChange, onNavigate }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const userName = ticket.profiles?.company_name || ticket.profiles?.name || 'Bilinmeyen Kullanıcı';
    const userEmail = ticket.profiles?.email || 'E-posta yok';
    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200/80">
            <div className="flex items-start justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <div className="flex items-center gap-2">
                         <StatusBadge status={ticket.status} />
                         <p className="font-bold text-gray-800">{ticket.subject}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1"><strong className="hover:underline">{userName}</strong> ({userEmail})</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(ticket.created_at).toLocaleString('tr-TR')}</p>
                </div>
                 <ChevronRightIcon className={`h-6 w-6 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </div>

             {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">{ticket.message}</p>
                    <div className="flex items-center justify-end gap-2">
                        <p className="text-sm font-medium text-gray-500">Durumu Değiştir:</p>
                        {ticket.status !== 'in_progress' && <button onClick={() => onStatusChange(ticket.id, 'in_progress')} className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-200">İşleme Al</button>}
                        {ticket.status !== 'resolved' && <button onClick={() => onStatusChange(ticket.id, 'resolved')} className="text-sm font-semibold bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200">Çözüldü Olarak İşaretle</button>}
                        {ticket.status !== 'open' && <button onClick={() => onStatusChange(ticket.id, 'open')} className="text-sm font-semibold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-200">Tekrar Aç</button>}
                    </div>
                </div>
             )}
        </div>
    );
};

export default AdminTickets;