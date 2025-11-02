import * as React from 'react';
import { View, JobListing } from '../types';
import { supabase } from '../utils/supabaseClient';
import { PlusCircleIcon, BriefcaseIcon, MapPinIcon, StarIcon, LightningBoltIcon } from '../components/icons';
import UpgradeModal from '../components/UpgradeModal';
import DrillingRigLoader from '../components/DrillingRigLoader';

interface MyListingsScreenProps {
    onNavigate: (view: View, jobId?: string) => void;
}

const MyListingsScreen: React.FC<MyListingsScreenProps> = ({ onNavigate }) => {
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = React.useState(false);
    const [jobs, setJobs] = React.useState<JobListing[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isProUser, setIsProUser] = React.useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('is_pro')
                    .eq('id', user.id)
                    .single();
                
                setIsProUser(profileData?.is_pro || false);

                const { data: jobsData, error: jobsError } = await supabase
                    .from('job_listings')
                    .select('*')
                    .eq('author_id', user.id)
                    .order('created_at', { ascending: false });

                if (jobsError) {
                    console.error('Error fetching user jobs:', jobsError);
                } else {
                    setJobs(jobsData as JobListing[]);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, []);


    const handlePostJobClick = () => {
        const canPostJob = isProUser || jobs.length < 1;
        if (canPostJob) {
            onNavigate('postJob');
        } else {
            setIsUpgradeModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header onPostJob={handlePostJobClick} />
            <main className="p-4 pb-24 space-y-4">
                {loading ? (
                    <DrillingRigLoader />
                ) : jobs.length > 0 ? (
                    jobs.map(job => (
                        <JobCard key={job.id} job={job} onNavigate={onNavigate} />
                    ))
                ) : (
                    <EmptyState onPostJob={handlePostJobClick} />
                )}
            </main>
            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                onUpgrade={() => {
                    setIsUpgradeModalOpen(false);
                    onNavigate('proPlan');
                }}
                featureName="Birden Fazla İlan Yayınla"
                description="Aynı anda birden fazla ilan yayınlayarak projelerinizi hızlandırmak için Pro Plana geçin."
                icon={StarIcon}
            />
        </div>
    );
};

const Header: React.FC<{ onPostJob: () => void }> = ({ onPostJob }) => (
    <header className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">İlanlarım</h1>
        <button
            onClick={onPostJob}
            className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
            <PlusCircleIcon className="h-5 w-5" />
            Yeni İlan Ver
        </button>
    </header>
);

const JobCard: React.FC<{ job: JobListing; onNavigate: (view: View, jobId?: string) => void; }> = ({ job, onNavigate }) => {
    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm border ${job.isUrgent ? 'border-red-400' : 'border-gray-200'}`}>
            <div onClick={() => onNavigate('jobDetail', job.id)} className="cursor-pointer">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900 flex-grow pr-2">{job.title}</h3>
                     {job.isUrgent && (
                        <span className="flex-shrink-0 flex items-center gap-1.5 text-xs text-red-700 bg-red-100 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                            <LightningBoltIcon className="h-4 w-4" />
                            ACİL
                        </span>
                     )}
                </div>
                <div className="flex items-center text-gray-500 mt-1">
                    <MapPinIcon className="h-4 w-4 mr-1.5" />
                    <p className="text-sm">{job.location?.text}</p>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                <button
                    onClick={() => onNavigate('bids', job.id)}
                    className="flex-1 text-center bg-gray-100 text-gray-800 font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Teklifleri Gör
                </button>
                <button
                    onClick={() => onNavigate('editJob', job.id)}
                    className="flex-1 text-center bg-blue-100 text-blue-800 font-semibold py-2.5 rounded-lg hover:bg-blue-200 transition-colors"
                >
                    Düzenle
                </button>
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ onPostJob: () => void }> = ({ onPostJob }) => (
    <div className="text-center mt-20">
        <BriefcaseIcon className="h-16 w-16 mx-auto text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Henüz İlanınız Yok</h2>
        <p className="mt-2 text-gray-500">Projeniz için bir ilan oluşturarak firmalardan teklif almaya başlayın.</p>
        <button
            onClick={onPostJob}
            className="mt-6 flex items-center mx-auto gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
            <PlusCircleIcon className="h-5 w-5" />
            İlk İlanını Ver
        </button>
    </div>
);

export default MyListingsScreen;