import * as React from 'react';
import { JobListing, View, UserRole } from '../types';
// FIX: Use categories from context instead of a static import.
import { useCategories } from '../contexts/CategoriesContext';
import { MapPinIcon, CurrencyDollarIcon, CalendarIcon, LightningBoltIcon, FlagIcon, ExclamationTriangleIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
// FIX: Module '"file:///components/QuoteModal"' has no default export. Changed to named import.
import { QuoteModal } from '../components/QuoteModal';
import ReportModal from '../components/ReportModal';
import DisputeModal from '../components/DisputeModal';
import { supabase } from '../utils/supabaseClient';
import { ScreenHeader, IconInfoRow } from '../components/shared/common';


interface JobDetailProps {
    jobId: string;
    userRole: UserRole | null;
    onBack: () => void;
    onNavigate: (view: View, jobId?: string, providerId?: string) => void;
}

const JobDetail: React.FC<JobDetailProps> = ({ jobId, userRole, onBack, onNavigate }) => {
    const [job, setJob] = React.useState<JobListing | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isQuoteModalOpen, setQuoteModalOpen] = React.useState(false);
    const [isReportModalOpen, setReportModalOpen] = React.useState(false);
    const [isDisputeModalOpen, setDisputeModalOpen] = React.useState(false);
    const [bidCount, setBidCount] = React.useState(0);
    const [isOwner, setIsOwner] = React.useState(false);
    const [isAwardedProvider, setIsAwardedProvider] = React.useState(false);
    const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
    const [hasAlreadyBid, setHasAlreadyBid] = React.useState(false);
    const { categories } = useCategories();

    React.useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;

            setLoading(true);
            setHasAlreadyBid(false); // Reset on fetch

            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);

            const { data: jobData, error: jobError } = await supabase
                .from('job_listings')
                .select('*')
                .eq('id', jobId)
                .single();

            if (jobError) {
                console.error("Error fetching job:", jobError);
            } else {
                setJob(jobData as JobListing);
                if (user) {
                    if (jobData.author_id === user.id) {
                        setIsOwner(true);
                    }
                    if (jobData.awarded_to === user.id) {
                        setIsAwardedProvider(true);
                    }

                    // Check if the current provider has already placed a bid
                    if (userRole === 'provider') {
                        const { count, error: bidCheckError } = await supabase
                            .from('bids')
                            .select('id', { count: 'exact', head: true })
                            .eq('job_id', jobId)
                            .eq('provider_id', user.id);

                        if (!bidCheckError && count && count > 0) {
                            setHasAlreadyBid(true);
                        }
                    }
                }
            }

            const { count, error: countError } = await supabase
                .from('bids')
                .select('*', { count: 'exact', head: true })
                .eq('job_id', jobId);

            if (countError) {
                console.error("Error fetching bid count:", countError);
            } else {
                setBidCount(count || 0);
            }

            setLoading(false);
        };

        fetchJob();
    }, [jobId, userRole]);
    
    const handleOpenQuoteModal = () => {
        if (!job) return;
        setQuoteModalOpen(true);
    };

    const handleQuoteSubmit = async (quoteDetails: { amount: string, notes: string }) => {
        if (!job) return;
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Teklif vermek için giriş yapmalısınız.");

        const { error } = await supabase.from('bids').insert({
            job_id: job.id,
            provider_id: user.id,
            amount: parseFloat(quoteDetails.amount),
            notes: quoteDetails.notes,
            status: 'pending'
        });

        if (error) {
            throw new Error(error.message);
        }
        
        setBidCount(prev => prev + 1); // Increment bid count visually
        setHasAlreadyBid(true);
    };

    const handleReportSubmit = async (reason: string) => {
        if (!job) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("İlanı raporlamak için giriş yapmalısınız.");

        const { error } = await supabase.from('reports').insert({
            job_id: job.id,
            reporter_id: user.id,
            reason: reason,
            status: 'open',
        });

        if (error) {
            throw new Error(error.message);
        }
    };

    const handleDisputeSubmit = async (reason: string, details: string) => {
        if (!job || !currentUserId) return;

        const { error } = await supabase.from('disputes').insert({
            job_id: job.id,
            reporter_id: currentUserId,
            reason,
            details,
            status: 'open'
        });
        if (error) throw new Error("Anlaşmazlık raporu gönderilemedi: " + error.message);
    };

    const handleCompleteJob = async () => {
        if (!job || !job.awarded_to) return;
        if (window.confirm("Bu işi tamamlandı olarak işaretlemek istediğinizden emin misiniz? Bu işlem geri alınamaz ve değerlendirme sürecini başlatır.")) {
            setLoading(true);
            const { error } = await supabase
                .from('job_listings')
                .update({ status: 'completed' })
                .eq('id', jobId);
            
            if (error) {
                console.error("Error completing job:", error);
                alert("İş tamamlanamadı: " + error.message);
                setLoading(false);
            } else {
                setJob(prev => prev ? { ...prev, status: 'completed' } : null);
                // Navigate to rating screen after completion
                onNavigate('rateExperience', job.id, job.awarded_to);
            }
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <DrillingRigLoader />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-900">
                <ScreenHeader title="İlan Bulunamadı" onBack={onBack} />
                <div className="text-center p-8">
                    <p>Aradığınız iş ilanı bulunamadı veya kaldırılmış olabilir.</p>
                </div>
            </div>
        );
    }
    
    const formattedDate = new Date(job.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const categoryName = categories.find(s => s.id === job.category_id)?.name || job.category_id;
    const showDisputeButton = (isOwner || isAwardedProvider) && (job.status === 'active' || job.status === 'completed');
    const showBidButton = userRole === 'provider' && !isOwner && !hasAlreadyBid && job.status === 'open';


    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <ScreenHeader title="İlan Detayları" onBack={onBack} />
            <main className="p-4 pb-36 space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <span className="text-xs text-white bg-blue-500 font-semibold px-2 py-1 rounded-full">{categoryName}</span>
                    <div className="flex items-center gap-3 mt-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{job.title}</h1>
                        {job.isUrgent && (
                            <span className="flex-shrink-0 flex items-center gap-1.5 text-sm text-red-700 bg-red-100 font-bold px-3 py-1 rounded-full whitespace-nowrap">
                                <LightningBoltIcon className="h-5 w-5" />
                                ACİL
                            </span>
                        )}
                    </div>
                    <IconInfoRow icon={MapPinIcon} text={job.location?.text || 'Belirtilmemiş'} />
                    <IconInfoRow icon={CalendarIcon} text={`${formattedDate} tarihinde yayınlandı`} />
                    {job.budget && <IconInfoRow icon={CurrencyDollarIcon} text={`Tahmini Bütçe: ${job.budget}`} />}
                </div>
                
                {userRole === 'customer' && isOwner && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">İlan Yönetimi</h2>
                         <div className="flex items-center justify-between">
                            <p className="text-gray-700 dark:text-gray-300">{bidCount > 0 ? `${bidCount} firma teklif verdi.` : 'Henüz teklif yok.'}</p>
                            <div className="flex gap-2">
                                {isOwner && job.status !== 'completed' && (
                                    <button 
                                        onClick={() => onNavigate('editJob', job.id)}
                                        className="bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900"
                                    >
                                        Düzenle
                                    </button>
                                )}
                                <button 
                                    onClick={() => onNavigate('bids', job.id)}
                                    className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    {bidCount > 0 ? 'Teklifleri Gör' : 'Teklif Bekleniyor'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {isOwner && job.status === 'active' && (
                     <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <button 
                            onClick={handleCompleteJob}
                            className="w-full bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors"
                        >
                            İşi Tamamlandı Olarak İşaretle
                        </button>
                    </div>
                )}
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Proje Detayları</h2>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.details}</p>
                </div>
                
                {job.wizard_answers && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">Teknik Bilgiler</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(job.wizard_answers).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{key}</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                                        {typeof value === 'object' && value !== null && 'value' in value ? `${(value as any).value} ${(value as any).unit}` : String(value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                    <button 
                        onClick={() => setReportModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 text-sm text-red-600 font-semibold py-2"
                    >
                        <FlagIcon className="h-4 w-4" /> Bu İlanı Rapor Et
                    </button>
                </div>

                {showDisputeButton && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                        <button
                            onClick={() => setDisputeModalOpen(true)}
                            className="w-full flex items-center justify-center gap-2 text-sm text-orange-600 font-semibold py-2"
                        >
                            <ExclamationTriangleIcon className="h-4 w-4" /> Sorun Bildir
                        </button>
                    </div>
                )}
            </main>

            {showBidButton && (
                 <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
                    <button
                        onClick={handleOpenQuoteModal}
                        className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-4 rounded-lg hover:bg-green-600 transition-colors shadow-lg"
                    >
                        <CurrencyDollarIcon className="h-6 w-6" />
                        Teklif Ver
                    </button>
                </div>
            )}
            
            <QuoteModal
                job={job}
                isOpen={isQuoteModalOpen}
                onClose={() => setQuoteModalOpen(false)}
                onSubmit={handleQuoteSubmit}
            />
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setReportModalOpen(false)}
                onSubmit={handleReportSubmit}
                itemType="İlanı"
            />
             <DisputeModal
                isOpen={isDisputeModalOpen}
                onClose={() => setDisputeModalOpen(false)}
                onSubmit={handleDisputeSubmit}
            />
        </div>
    );
};

export default JobDetail;