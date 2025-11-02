import * as React from 'react';
import { View, JobApplication } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { UserIcon, BriefcaseIcon, CheckBadgeIcon, XCircleIcon, EnvelopeIcon, PhoneIcon, DocumentTextIcon } from '../components/icons';

interface AdminJobApplicationsProps {
    onNavigate: (view: View, id?: string) => void;
}

const AdminJobApplications: React.FC<AdminJobApplicationsProps> = ({ onNavigate }) => {
    const [applications, setApplications] = React.useState<JobApplication[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<'all' | 'pending' | 'interview' | 'rejected'>('all');

    const fetchApplications = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('job_applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching applications:", error);
        } else {
            setApplications(data as JobApplication[]);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleStatusUpdate = async (id: string, status: JobApplication['status']) => {
        // Optimistic update
        setApplications(current => current.map(app => app.id === id ? { ...app, status } : app));
        
        const { error } = await supabase
            .from('job_applications')
            .update({ status })
            .eq('id', id);

        if (error) {
            console.error("Error updating status:", error);
            fetchApplications(); // Revert on error
        }
    };

    const filteredApps = applications.filter(app => filter === 'all' || app.status === filter);

    if (loading) return <DrillingRigLoader />;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Kariyer Başvuruları</h2>
            
            <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-md overflow-x-auto">
                <FilterButton text="Tümü" count={applications.length} active={filter === 'all'} onClick={() => setFilter('all')} />
                <FilterButton text="Bekleyen" count={applications.filter(a => a.status === 'pending').length} active={filter === 'pending'} onClick={() => setFilter('pending')} />
                <FilterButton text="Mülakat" count={applications.filter(a => a.status === 'interview').length} active={filter === 'interview'} onClick={() => setFilter('interview')} />
                <FilterButton text="Reddedilen" count={applications.filter(a => a.status === 'rejected').length} active={filter === 'rejected'} onClick={() => setFilter('rejected')} />
            </div>

            <div className="space-y-4">
                {filteredApps.length > 0 ? (
                    filteredApps.map(app => (
                        <ApplicationCard 
                            key={app.id} 
                            application={app} 
                            onStatusUpdate={handleStatusUpdate} 
                        />
                    ))
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl shadow-md">
                        <BriefcaseIcon className="h-16 w-16 mx-auto text-gray-300" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800">Başvuru Bulunamadı</h3>
                        <p className="mt-2 text-gray-500">Seçili filtrede gösterilecek başvuru yok.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const FilterButton: React.FC<{ text: string; count: number; active: boolean; onClick: () => void; }> = ({ text, count, active, onClick }) => (
    <button onClick={onClick} className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 text-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
        <span>{text}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-700'}`}>{count}</span>
    </button>
);

const ApplicationCard: React.FC<{ application: JobApplication, onStatusUpdate: (id: string, status: JobApplication['status']) => void }> = ({ application, onStatusUpdate }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        interview: 'bg-blue-100 text-blue-800',
        rejected: 'bg-red-100 text-red-800'
    };

    const statusText = {
        pending: 'İnceleniyor',
        interview: 'Mülakat',
        rejected: 'Reddedildi'
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200/80 overflow-hidden transition-all hover:shadow-lg">
            <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <UserIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{application.applicant_name}</h3>
                            <p className="text-sm text-blue-600 font-medium">{application.job_title}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(application.created_at).toLocaleDateString('tr-TR')}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[application.status]}`}>
                        {statusText[application.status]}
                    </span>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4 animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-700">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                            <a href={`mailto:${application.email}`} className="hover:text-blue-600 hover:underline">{application.email}</a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
                            <a href={`tel:${application.phone}`} className="hover:text-blue-600 hover:underline">{application.phone}</a>
                        </div>
                         <div className="flex items-center gap-2 text-gray-700 col-span-2">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                            <a href={application.cv_link} target="_blank" rel="noreferrer" className="text-blue-600 font-medium hover:underline break-all">CV Görüntüle ({application.cv_link})</a>
                        </div>
                    </div>

                    {application.cover_letter && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-bold text-gray-900 mb-1">Ön Yazı</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{application.cover_letter}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                        {application.status !== 'interview' && (
                             <button 
                                onClick={() => onStatusUpdate(application.id, 'interview')}
                                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700"
                            >
                                <CheckBadgeIcon className="w-4 h-4" /> Mülakata Çağır
                            </button>
                        )}
                        {application.status !== 'rejected' && (
                            <button 
                                onClick={() => onStatusUpdate(application.id, 'rejected')}
                                className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-200"
                            >
                                <XCircleIcon className="w-4 h-4" /> Reddet
                            </button>
                        )}
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AdminJobApplications;