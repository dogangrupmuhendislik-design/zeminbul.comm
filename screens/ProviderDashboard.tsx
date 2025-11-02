import * as React from 'react';
import { BriefcaseIcon, CheckBadgeIcon, CurrencyDollarIcon, ChartBarIcon, MapPinIcon, ClockIcon, XCircleIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { JobListing, View, ProviderProfile, Bid, BidStatus } from '../types';
import { supabase } from '../utils/supabaseClient';

interface ProviderDashboardProps {
    onNavigate: (view: View, jobId?: string) => void;
}

const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onNavigate }) => {
    const [profile, setProfile] = React.useState<Partial<ProviderProfile> & { companyName: string } | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [recentBids, setRecentBids] = React.useState<Bid[]>([]);
    const [recommendedJobs, setRecommendedJobs] = React.useState<JobListing[]>([]);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Fetch profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (profileData) {
                // Here we are creating a partial ProviderProfile for the dashboard.
                // A real app might calculate these stats on the backend.
                setProfile({
                    companyName: profileData.company_name || profileData.email,
                    stats: {
                        activeBids: 5, // Placeholder
                        wonJobs: 12, // Placeholder
                        balance: profileData.balance || 0,
                        successRate: 75, // Placeholder
                        averageBidAmount: 0, jobsWonLastYear: 0, clientSatisfaction: 0,
                    }
                });
            }

            // Fetch recent bids
            const { data: bidsData } = await supabase
                .from('bids')
                .select(`
                    *,
                    job_listings ( title )
                `)
                .eq('provider_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3);

            if (bidsData) {
                 const formattedBids = bidsData.map((b: any) => ({ ...b, jobTitle: b.job_listings.title }));
                 setRecentBids(formattedBids as Bid[]);
            }

            // Fetch recommended jobs (for now, just recent jobs)
            const { data: jobsData } = await supabase
                .from('job_listings')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (jobsData) {
                setRecommendedJobs(jobsData as JobListing[]);
            }
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);


    if (loading || !profile) {
        return (
            <div className="min-h-screen">
                <header className="bg-white dark:bg-gray-800 p-4 rounded-b-2xl shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hoş Geldiniz!</h1>
                    <p className="text-gray-600 dark:text-gray-300">Kontrol paneliniz yükleniyor...</p>
                </header>
                <DrillingRigLoader />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header name={profile.companyName!} />
            <div className="p-4 space-y-6">
                <StatsGrid stats={profile.stats!} />
                <RecentBids bids={recentBids} />
                <button 
                    onClick={() => onNavigate('postJob')}
                    className="w-full bg-orange-500 text-white font-bold text-lg py-4 rounded-lg shadow-md hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                    Yeni İş İlanlarını Keşfet 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
                <RecommendedJobs jobs={recommendedJobs} onNavigate={onNavigate} />
            </div>
        </div>
    );
};

const Header: React.FC<{name: string}> = ({ name }) => (
    <header className="bg-white dark:bg-gray-800 p-4 rounded-b-2xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hoş Geldiniz, {name}!</h1>
        <p className="text-gray-600 dark:text-gray-300">İşler sizi bekliyor. İşte hesabınıza hızlı bir bakış.</p>
    </header>
);

interface StatsGridProps {
    stats: ProviderProfile['stats'];
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => (
    <div className="grid grid-cols-2 gap-4">
        <StatCard icon={BriefcaseIcon} value={stats.activeBids} label="Aktif Teklifler" color="blue" />
        <StatCard icon={CheckBadgeIcon} value={stats.wonJobs} label="Kazanılan İşler" color="green" />
        <StatCard icon={CurrencyDollarIcon} value={stats.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} label="Bakiye" color="yellow" />
        <StatCard icon={ChartBarIcon} value={`${stats.successRate}%`} label="Başarı Oranı" color="purple" />
    </div>
);

interface StatCardProps {
    icon: React.FC<any>;
    value: string | number;
    label: string;
    color: 'blue' | 'green' | 'yellow' | 'purple';
}
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label, color }) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
        yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
    };
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
            <div className={`h-12 w-12 flex items-center justify-center rounded-full ${colors[color]}`}>
                <Icon className="h-7 w-7" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-3">{value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        </div>
    )
};

const BidStatusBadge: React.FC<{ status: BidStatus }> = ({ status }) => {
    const statusStyles = {
        pending: {
            text: 'Bekliyor',
            icon: ClockIcon,
            classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        },
        accepted: {
            text: 'Kabul Edildi',
            icon: CheckBadgeIcon,
            classes: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        },
        rejected: {
            text: 'Reddedildi',
            icon: XCircleIcon,
            classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        }
    };

    const { text, icon: Icon, classes } = statusStyles[status];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
            <Icon className="h-4 w-4" />
            {text}
        </span>
    );
};

const RecentBids: React.FC<{ bids: Bid[] }> = ({ bids }) => (
    <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Son Teklifleriniz</h2>
        {bids.length > 0 ? (
            <div className="space-y-3">
                {bids.map(bid => (
                    <div key={bid.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-start gap-4">
                           <div className="flex-grow">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">{bid.jobTitle}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Teklif: <span className="font-semibold">{bid.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                                </p>
                           </div>
                            <div className="flex-shrink-0">
                                <BidStatusBadge status={bid.status} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
             <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">Henüz gönderilmiş bir teklifiniz yok.</p>
            </div>
        )}
    </div>
);


interface RecommendedJobsProps {
    jobs: JobListing[];
    onNavigate: (view: View, jobId: string) => void;
}
const RecommendedJobs: React.FC<RecommendedJobsProps> = ({ jobs, onNavigate }) => (
    <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Sizin için Önerilenler</h2>
        <div className="space-y-3">
             {jobs.map(job => (
                <div key={job.id} onClick={() => onNavigate('jobDetail', job.id)} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{job.title}</h3>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2">
                        <MapPinIcon className="h-4 w-4 mr-1.5" />
                        <p className="text-sm">{job.location?.text}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

export default ProviderDashboard;