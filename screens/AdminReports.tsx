import * as React from 'react';
import { View, Report } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { FlagIcon, CheckBadgeIcon, ChevronRightIcon } from '../components/icons';

interface AdminReportsProps {
    onNavigate: (view: View, id?: string) => void;
}

type ReportStatus = 'open' | 'resolved';

const AdminReports: React.FC<AdminReportsProps> = ({ onNavigate }) => {
    const [reports, setReports] = React.useState<Report[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<ReportStatus>('open');

    const fetchReports = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reports')
            .select('*, job_listings(title), reported_profile:profile_id(name, company_name), reporter:reporter_id(name, company_name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching reports:", error);
        } else {
            setReports(data as any[]);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleStatusChange = async (reportId: string, newStatus: ReportStatus) => {
        setReports(current => current.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
        const { error } = await supabase.from('reports').update({ status: newStatus }).eq('id', reportId);
        if (error) {
            console.error("Failed to update report status:", error);
            fetchReports(); // Revert
        }
    };

    const filteredReports = reports.filter(r => r.status === filter);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Kullanıcı Raporları</h2>
            <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-md">
                <FilterButton text="Açık Raporlar" count={reports.filter(r=>r.status==='open').length} active={filter === 'open'} onClick={() => setFilter('open')} />
                <FilterButton text="Çözülmüş Raporlar" count={reports.filter(r=>r.status==='resolved').length} active={filter === 'resolved'} onClick={() => setFilter('resolved')} />
            </div>

            {loading ? <DrillingRigLoader /> : (
                <div className="space-y-4">
                    {filteredReports.length > 0 ? (
                        filteredReports.map(report => (
                            <ReportCard 
                                key={report.id}
                                report={report}
                                onStatusChange={handleStatusChange}
                                onNavigate={onNavigate}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-md">
                            <CheckBadgeIcon className="h-16 w-16 mx-auto text-green-400" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">Rapor Kutusu Temiz!</h3>
                            <p className="mt-2 text-gray-500">İncelenmeyi bekleyen yeni bir rapor bulunmuyor.</p>
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

const ReportCard: React.FC<{ report: Report, onStatusChange: (id: string, status: ReportStatus) => void, onNavigate: (view: View, id?: string) => void }> = ({ report, onStatusChange, onNavigate }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const reporterName = report.reporter?.company_name || report.reporter?.name || 'Bilinmeyen Kullanıcı';
    
    const reportedItemTitle = report.job_id 
        ? `İlan: ${report.job_listings?.title || 'Bilinmiyor'}`
        : `Profil: ${report.reported_profile?.company_name || report.reported_profile?.name || 'Bilinmiyor'}`;
    
    const reportedItemClick = () => {
        if (report.job_id) {
            onNavigate('adminJobDetail', report.job_id);
        } else if (report.profile_id) {
            onNavigate('adminUserDetail', report.profile_id);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200/80">
            <div className="flex items-start justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div>
                    <p 
                        className="font-bold text-gray-800 cursor-pointer hover:underline" 
                        onClick={e => { e.stopPropagation(); reportedItemClick(); }}
                    >
                        {reportedItemTitle}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Raporlayan: <strong className="cursor-pointer hover:underline" onClick={e => {e.stopPropagation(); onNavigate('adminUserDetail', report.reporter_id)}}>{reporterName}</strong>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(report.created_at).toLocaleString('tr-TR')}</p>
                </div>
                 <ChevronRightIcon className={`h-6 w-6 text-gray-500 transform transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
            </div>

             {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    <div className="bg-gray-50 p-3 rounded-md border">
                        <h4 className="text-sm font-semibold text-gray-600 mb-1">Rapor Nedeni:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{report.reason}</p>
                    </div>
                    {report.status === 'open' && (
                        <div className="flex items-center justify-end">
                            <button onClick={() => onStatusChange(report.id, 'resolved')} className="flex items-center gap-1.5 text-sm font-semibold bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
                                <CheckBadgeIcon className="h-4 w-4" /> Çözüldü Olarak İşaretle
                            </button>
                        </div>
                    )}
                     {report.status === 'resolved' && (
                        <div className="flex items-center justify-end">
                            <button onClick={() => onStatusChange(report.id, 'open')} className="flex items-center gap-1.5 text-sm font-semibold bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg hover:bg-yellow-200 transition-colors">
                                Raporu Tekrar Aç
                            </button>
                        </div>
                    )}
                </div>
             )}
        </div>
    );
};


export default AdminReports;
