import * as React from 'react';
import { View, JobListing } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { CheckBadgeIcon, XCircleIcon, BriefcaseIcon } from '../components/icons';
// FIX: Use categories from context instead of a static import.
import { useCategories } from '../contexts/CategoriesContext';

interface AdminPendingJobsProps {
    onNavigate: (view: View, id?: string) => void;
}

type JobWithProfile = JobListing & { profiles: { name?: string } };

const AdminPendingJobs: React.FC<AdminPendingJobsProps> = ({ onNavigate }) => {
    const [pendingJobs, setPendingJobs] = React.useState<JobWithProfile[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchPendingJobs = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('job_listings')
            .select('*, profiles:author_id(name)')
            .eq('status', 'pending_review')
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error("Error fetching pending jobs:", error.message || error);
        } else {
            setPendingJobs(data as JobWithProfile[]);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchPendingJobs();
    }, [fetchPendingJobs]);

    const handleApprove = async (jobId: string) => {
        setPendingJobs(current => current.filter(job => job.id !== jobId));
        const { error } = await supabase
            .from('job_listings')
            .update({ status: 'open' })
            .eq('id', jobId);
        if (error) {
            console.error("Error approving job:", error);
            fetchPendingJobs(); // Revert
        }
    };

    const handleReject = async (jobId: string) => {
        if (window.confirm("Bu ilanı reddetmek ve kalıcı olarak silmek istediğinizden emin misiniz?")) {
            setPendingJobs(current => current.filter(job => job.id !== jobId));
            const { error } = await supabase
                .from('job_listings')
                .delete()
                .eq('id', jobId);
            if (error) {
                console.error("Error rejecting job:", error);
                fetchPendingJobs(); // Revert
            }
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Onay Bekleyen İlanlar ({pendingJobs.length})</h2>
            {loading ? <DrillingRigLoader /> : (
                <div className="space-y-4">
                    {pendingJobs.length > 0 ? (
                        pendingJobs.map(job => (
                            <JobApprovalCard 
                                key={job.id} 
                                job={job}
                                onApprove={() => handleApprove(job.id)}
                                onReject={() => handleReject(job.id)}
                                onNavigate={onNavigate}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-md">
                            <CheckBadgeIcon className="h-16 w-16 mx-auto text-green-400" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">Onay Kuyruğu Temiz!</h3>
                            <p className="mt-2 text-gray-500">Onay bekleyen yeni bir iş ilanı bulunmuyor.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const JobApprovalCard: React.FC<{ job: JobWithProfile, onApprove: () => void, onReject: () => void, onNavigate: (view: View, id: string) => void }> = ({ job, onApprove, onReject, onNavigate }) => {
    const { categories } = useCategories();
    const categoryName = categories.find(s => s.id === job.category_id)?.name || 'Bilinmeyen';
    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200/80">
            <div className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">{categoryName}</span>
                        <h3 className="font-bold text-lg text-gray-800 mt-1 cursor-pointer hover:underline" onClick={() => onNavigate('adminJobDetail', job.id)}>{job.title}</h3>
                        <p className="text-sm text-gray-500">Yayınlayan: {job.profiles?.name || 'Bilinmiyor'}</p>
                    </div>
                     <p className="text-xs text-gray-400 flex-shrink-0">{new Date(job.created_at).toLocaleDateString('tr-TR')}</p>
                </div>
                <div className="mt-3 bg-gray-50 p-3 rounded-md border">
                    <p className="text-sm text-gray-600 h-12 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{job.details}</p>
                </div>
            </div>
            <div className="bg-gray-50/70 p-3 flex justify-end gap-3 rounded-b-xl">
                 <button onClick={onReject} className="flex items-center gap-1.5 text-sm font-semibold bg-red-100 text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
                    <XCircleIcon className="h-4 w-4" /> Reddet
                </button>
                <button onClick={onApprove} className="flex items-center gap-1.5 text-sm font-semibold bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
                    <CheckBadgeIcon className="h-4 w-4" /> Onayla
                </button>
            </div>
        </div>
    );
};


export default AdminPendingJobs;