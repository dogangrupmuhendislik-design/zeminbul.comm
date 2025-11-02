import * as React from 'react';
import { JobListing, Bid, UserRole, View, BidStatus, BidAnalysisResponse, Profile } from '../types';
import { CheckBadgeIcon, StarIcon, BrainCircuitIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
import BidCard from '../components/BidCard';
import UpgradeModal from '../components/UpgradeModal';
import BidAnalysisModal from '../components/BidAnalysisModal';
import { getBidAnalysis } from '../services/geminiService';
import { supabase } from '../utils/supabaseClient';

interface BidsScreenProps {
    jobId: string;
    userRole: UserRole;
    onBack: () => void;
    onNavigate: (view: View, id?: string) => void;
}

const BidsScreen: React.FC<BidsScreenProps> = ({ jobId, userRole, onBack, onNavigate }) => {
    const [job, setJob] = React.useState<JobListing | null>(null);
    const [bids, setBids] = React.useState<Bid[]>([]);
    const [customerProfile, setCustomerProfile] = React.useState<Profile | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);

    // State for AI analysis
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = React.useState(false);
    const [analysisResult, setAnalysisResult] = React.useState<BidAnalysisResponse | null>(null);
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const [analysisError, setAnalysisError] = React.useState<string | null>(null);


    const fetchData = React.useCallback(async () => {
        setLoading(true);

        const { data: jobData, error: jobError } = await supabase
            .from('job_listings')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError) {
            console.error("Error fetching job:", jobError);
            setLoading(false);
            return;
        }

        setJob(jobData);

        const { data: bidsData, error: bidsError } = await supabase
            .from('bids')
            .select(`
                *,
                profiles ( company_name, logo_url, average_rating, rating_count )
            `)
            .eq('job_id', jobId)
            .order('amount', { ascending: true });

        if (bidsError) {
            console.error("Error fetching bids:", bidsError);
        } else {
            const formattedBids = bidsData.map((b: any) => ({
                ...b,
                provider_name: b.profiles.company_name,
                provider_logo_url: b.profiles.logo_url,
                provider_average_rating: b.profiles.average_rating,
                provider_rating_count: b.profiles.rating_count,
            }));
            setBids(formattedBids);
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setCustomerProfile(profileData);
        }

        setLoading(false);
    }, [jobId]);

    React.useEffect(() => {
        fetchData();

        const channel = supabase.channel(`bids-for-job-${jobId}`)
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'bids', filter: `job_id=eq.${jobId}` }, 
                async (payload) => {
                    const newBid = payload.new as Bid;
                    
                    const { data: profileData, error } = await supabase
                        .from('profiles')
                        .select('company_name, logo_url, average_rating, rating_count')
                        .eq('id', newBid.provider_id)
                        .single();

                    if (!error && profileData) {
                        const formattedBid = {
                            ...newBid,
                            provider_name: profileData.company_name,
                            provider_logo_url: profileData.logo_url,
                            provider_average_rating: profileData.average_rating,
                            provider_rating_count: profileData.rating_count,
                        };
                        setBids(currentBids => [...currentBids, formattedBid].sort((a, b) => a.amount - b.amount));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [jobId, fetchData]);

    const handleUpdateBidStatus = async (bidId: string, newStatus: BidStatus) => {
        const bidToUpdate = bids.find(b => b.id === bidId);
        if (!bidToUpdate || !job) return;

        const originalBids = bids;
        const optimisticBids = bids.map(bid => {
            if (bid.id === bidId) return { ...bid, status: newStatus };
            if (newStatus === 'accepted' && bid.status === 'pending') return { ...bid, status: 'rejected' };
            return bid;
        });
        // FIX: Argument of type '{ status: string; ... }[]' is not assignable to parameter of type 'SetStateAction<Bid[]>'. Type 'string' is not assignable to type 'BidStatus'.
        setBids(optimisticBids as Bid[]);

        try {
            // Update job status to 'active'
            await supabase.from('job_listings').update({ status: 'active', awarded_to: bidToUpdate.provider_id }).eq('id', job.id);

            if (newStatus === 'accepted') {
                const otherPendingBidIds = originalBids
                    .filter(b => b.id !== bidId && b.status === 'pending')
                    .map(b => b.id);
                if (otherPendingBidIds.length > 0) {
                    await supabase.from('bids').update({ status: 'rejected' }).in('id', otherPendingBidIds);
                }
            }

            const { error } = await supabase.from('bids').update({ status: newStatus }).eq('id', bidId);

            if (error) throw error;

            if (newStatus === 'accepted') {
                // Conversation creation
                const { data: existingConversation } = await supabase
                    .from('conversations')
                    .select('id')
                    .eq('job_id', jobId)
                    .eq('provider_id', bidToUpdate.provider_id)
                    .maybeSingle();

                let conversationId = existingConversation?.id;

                if (!conversationId) {
                    const { data: newConversation, error: createError } = await supabase
                        .from('conversations')
                        .insert({
                            job_id: jobId,
                            customer_id: job.author_id,
                            provider_id: bidToUpdate.provider_id,
                        })
                        .select('id')
                        .single();
                    
                    if (createError) throw createError;
                    conversationId = newConversation.id;
                }
                
                if (conversationId) {
                    onNavigate('chat', conversationId);
                }
            }
        } catch (error) {
            console.error(`Error updating bid status:`, error);
            setBids(originalBids);
            // You might want to show an error message to the user here
        }
    };


    const handleViewProfile = (providerId: string) => {
        if (customerProfile?.is_pro) {
            onNavigate('providerProfile', providerId);
        } else {
            setIsUpgradeModalOpen(true);
        }
    };
    
    const handleAnalyzeBids = async () => {
        if (!job || bids.length < 2) return;

        setIsAnalyzing(true);
        setAnalysisResult(null);
        setAnalysisError(null);
        setIsAnalysisModalOpen(true);

        try {
            const result = await getBidAnalysis(job, bids);
            if (result) {
                setAnalysisResult(result);
            } else {
                throw new Error("Analiz sonucu alınamadı. Lütfen daha sonra tekrar deneyin.");
            }
        } catch (error) {
            console.error(error);
            setAnalysisError((error as Error).message);
        } finally {
            setIsAnalyzing(false);
        }
    };


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <DrillingRigLoader />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-white">
                <Header title="İlan Bulunamadı" onBack={onBack} />
                <div className="text-center p-8"><p>İlan bilgileri yüklenemedi.</p></div>
            </div>
        );
    }
    
    const acceptedBid = bids.find(b => b.status === 'accepted');

    return (
        <div className="min-h-screen bg-gray-100">
            <Header title="Gelen Teklifler" onBack={onBack} />
            <main className="p-4 pb-24 space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
                    <p className="text-sm text-gray-500">{job.location?.text}</p>
                </div>

                {acceptedBid && (
                     <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 rounded-md shadow-sm" role="alert">
                        <div className="flex">
                            <div className="py-1"><CheckBadgeIcon className="h-6 w-6 text-green-500 mr-3"/></div>
                            <div>
                                <p className="font-bold">Bir teklifi kabul ettiniz!</p>
                                <p className="text-sm"><strong>{acceptedBid.provider_name}</strong> firmasının teklifini kabul ettiniz. Diğer teklifler otomatik olarak reddedildi.</p>
                            </div>
                        </div>
                    </div>
                )}
                
                 {bids.length > 1 && !acceptedBid && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <button
                            onClick={handleAnalyzeBids}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow"
                        >
                            <BrainCircuitIcon className="h-6 w-6" />
                            Teklifleri AI ile Analiz Et
                        </button>
                    </div>
                )}

                <div className="space-y-3">
                    {bids.length > 0 ? bids.map(bid => (
                        <BidCard 
                            key={bid.id}
                            bid={bid}
                            isCustomerView={userRole === 'customer'}
                            isJobAwarded={!!acceptedBid}
                            onAccept={() => handleUpdateBidStatus(bid.id, 'accepted')}
                            onReject={() => handleUpdateBidStatus(bid.id, 'rejected')}
                            onViewProfile={() => handleViewProfile(bid.provider_id)}
                        />
                    )) : (
                        <div className="bg-white p-6 rounded-lg shadow-sm text-center mt-8">
                             <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz Teklif Yok</h3>
                            <p className="mt-1 text-sm text-gray-500">Bu ilan için henüz bir teklif almadınız.</p>
                        </div>
                    )}
                </div>
            </main>
             <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onUpgrade={() => {
                    setIsUpgradeModalOpen(false);
                    onNavigate('proPlan');
                }}
                featureName="Firma Profillerini Görüntüle"
                description="Teklif veren firmaların detaylı profillerini, geçmiş işlerini ve müşteri yorumlarını görmek için Pro Plana geçin."
                icon={StarIcon}
            />
            <BidAnalysisModal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
                isLoading={isAnalyzing}
                analysisResult={analysisResult}
                error={analysisError}
            />
        </div>
    );
};

const Header: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
    <header className="p-4 border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center">
        <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-xl font-bold text-center text-gray-900 flex-grow">{title}</h1>
        <div className="w-10"></div>
    </header>
);

export default BidsScreen;