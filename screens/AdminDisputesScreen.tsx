import * as React from 'react';
import { View, Dispute, Profile } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { ExclamationTriangleIcon, CheckBadgeIcon, ChevronRightIcon } from '../components/icons';

interface AdminDisputesScreenProps {
    onNavigate: (view: View, id?: string) => void;
}

type DisputeStatus = 'open' | 'in_progress' | 'resolved';

const AdminDisputesScreen: React.FC<AdminDisputesScreenProps> = ({ onNavigate }) => {
    const [disputes, setDisputes] = React.useState<Dispute[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<DisputeStatus>('open');

    const fetchDisputes = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('disputes')
            .select('*, job_listing:job_id(title), reporter:reporter_id(name, company_name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching disputes:", error);
        } else {
            setDisputes(data as any[]);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);
    
    const handleStatusChange = async (disputeId: string, newStatus: DisputeStatus) => {
        setDisputes(current => current.map(d => d.id === disputeId ? { ...d, status: newStatus } : d));
        const { error } = await supabase.from('disputes').update({ status: newStatus }).eq('id', disputeId);
        if (error) {
            console.error("Failed to update dispute status:", error);
            fetchDisputes(); // Revert on error
        }
    };
    
    const filteredDisputes = disputes.filter(d => d.status === filter);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Anlaşmazlık Raporları</h2>
             <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-md">
                <FilterButton text="Açık" count={disputes.filter(d=>d.status==='open').length} active={filter === 'open'} onClick={() => setFilter('open')} />
                <FilterButton text="İncelemede" count={disputes.filter(d=>d.status==='in_progress').length} active={filter === 'in_progress'} onClick={() => setFilter('in_progress')} />
                <FilterButton text="Çözüldü" count={disputes.filter(d=>d.status==='resolved').length} active={filter === 'resolved'} onClick={() => setFilter('resolved')} />
            </div>

            {loading ? <DrillingRigLoader /> : (
                <div className="space-y-4">
                    {filteredDisputes.length > 0 ? (
                        filteredDisputes.map(dispute => (
                            <DisputeCard
                                key={dispute.id}
                                dispute={dispute}
                                onStatusChange={handleStatusChange}
                                onNavigate={onNavigate}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-md">
                            <CheckBadgeIcon className="h-16 w-16 mx-auto text-green-400" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">Tebrikler!</h3>
                            <p className="mt-2 text-gray-500">Bu kategoride incelenmeyi bekleyen bir anlaşmazlık raporu yok.</p>
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

const DisputeCard: React.FC<{ dispute: Dispute; onStatusChange: (id: string, status: DisputeStatus) => void; onNavigate: (v: View, id: string) => void }> = ({ dispute, onStatusChange, onNavigate }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const reporterName = dispute.reporter?.company_name || dispute.reporter?.name || 'Bilinmeyen';

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200/80">
            <div className="flex items-start justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <p className="font-bold text-gray-800 cursor-pointer hover:underline" onClick={e => { e.stopPropagation(); onNavigate('adminJobDetail', dispute.job_id); }}>
                        İlan: {dispute.job_listing?.title || 'Bilinmiyor'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Raporlayan: <strong className="cursor-pointer hover:underline" onClick={e => { e.stopPropagation(); onNavigate('adminUserDetail', dispute.reporter_id); }}>{reporterName}</strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(dispute.created_at).toLocaleString('tr-TR')}</p>
                </div>
                <ChevronRightIcon className={`h-6 w-6 text-gray-500 transform transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div className="bg-gray-50 p-3 rounded-md border">
                        <h4 className="text-sm font-semibold text-gray-600 mb-1">Sebep: {dispute.reason}</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{dispute.details}</p>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <p className="text-sm font-medium text-gray-500">Durumu Değiştir:</p>
                        {dispute.status !== 'in_progress' && <button onClick={() => onStatusChange(dispute.id, 'in_progress')} className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-200">İncelemeye Al</button>}
                        {dispute.status !== 'resolved' && <button onClick={() => onStatusChange(dispute.id, 'resolved')} className="text-sm font-semibold bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200">Çözüldü</button>}
                        {dispute.status !== 'open' && <button onClick={() => onStatusChange(dispute.id, 'open')} className="text-sm font-semibold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-200">Tekrar Aç</button>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDisputesScreen;
