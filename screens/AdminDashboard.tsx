
import * as React from 'react';
import { View, AdminActivity, Profile, JobListing, Transaction, UserRole } from '../types';
// FIX: Import `DocumentCheckIcon` to resolve a "Cannot find name" error.
import { ChartBarIcon, UsersIcon, BriefcaseIcon, CurrencyDollarIcon, ArrowUpIcon, ArrowDownIcon, StarIcon, UserPlusIcon, DocumentPlusIcon, ShieldCheckIcon, CheckBadgeIcon, UserIcon, Cog6ToothIcon, FlagIcon, DocumentCheckIcon, UserCheckIcon, ExclamationTriangleIcon, DocumentArrowUpIcon, ChatBubbleBottomCenterTextIcon, MessageIcon, PhotoIcon, PlusCircleIcon } from '../components/icons';
import { BarChart, PieChart } from '../components/AdminCharts';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { useCategories } from '../contexts/CategoriesContext';

interface AdminDashboardProps {
    onNavigate: (view: View, id?: string) => void;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';

const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " yıl önce";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " ay önce";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " gün önce";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " saat önce";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " dakika önce";
    return "az önce";
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
    const [stats, setStats] = React.useState({ totalUsers: 0, totalProviders: 0, activeJobs: 0, totalBids: 0 });
    const [financialData, setFinancialData] = React.useState({ commissions: 0, subscriptions: 0 });
    const [userGrowthData, setUserGrowthData] = React.useState<{ month: string; customers: number; providers: number }[]>([]);
    const [jobCategoryDistribution, setJobCategoryDistribution] = React.useState<{ name: string; value: number; color: string }[]>([]);
    const [recentActivity, setRecentActivity] = React.useState<AdminActivity[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [financialTimeFilter, setFinancialTimeFilter] = React.useState<TimeFilter>('month');
    const { categories } = useCategories();

    React.useEffect(() => {
        const fetchData = async () => {
            if (categories.length === 0) return;
            setLoading(true);

            // Fetch stats
            const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: totalProviders } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'provider');
            const { count: activeJobs } = await supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('status', 'open');
            const { count: totalBids } = await supabase.from('bids').select('*', { count: 'exact', head: true });
            setStats({ totalUsers: totalUsers || 0, totalProviders: totalProviders || 0, activeJobs: activeJobs || 0, totalBids: totalBids || 0 });

            // Fetch data for charts
            const { data: profiles } = await supabase.from('profiles').select('created_at, role');
            const { data: jobs } = await supabase.from('job_listings').select('category_id');

            // Process user growth data
            const growth = (profiles || []).reduce((acc: Record<string, { month: string, customers: number, providers: number }>, profile: Pick<Profile, 'created_at' | 'role'>) => {
                if (!profile.created_at) return acc;
                const month = new Date(profile.created_at).toLocaleString('tr-TR', { month: 'short' });
                if (!acc[month]) {
                    acc[month] = { month, customers: 0, providers: 0 };
                }
                if (profile.role === 'customer') acc[month].customers++;
                if (profile.role === 'provider') acc[month].providers++;
                return acc;
            }, {} as Record<string, { month: string; customers: number; providers: number; }>);
            setUserGrowthData(Object.values(growth));
            
            const colors = ['#3b82f6', '#ef4444', '#10b981', '#f97316', '#8b5cf6', '#eab308'];
            const distribution = (jobs || []).reduce((acc: Record<string, { name: string; value: number }>, job: Pick<JobListing, 'category_id'>) => {
                const categoryName = categories.find(s => s.id === job.category_id)?.name || 'Diğer';
                if (!acc[categoryName]) {
                    acc[categoryName] = { name: categoryName, value: 0 };
                }
                acc[categoryName].value++;
                return acc;
            }, {} as Record<string, { name: string; value: number }>);
            setJobCategoryDistribution(Object.values(distribution).map((item: {name: string, value: number}, index) => ({...item, color: colors[index % colors.length]})));

            // Fetch recent activity
            const { data: recentUsers } = await supabase.from('profiles').select('id, name, company_name, created_at, role').order('created_at', { ascending: false }).limit(5);
            const { data: recentJobs } = await supabase.from('job_listings').select('id, title, author_id, created_at, profiles(name)').order('created_at', { ascending: false }).limit(5);
            
            const usersActivity: AdminActivity[] = (recentUsers || []).map((u: any) => ({
                id: `user-${u.id}`, type: 'new_user', userId: u.id, userName: u.company_name || u.name, timestamp: u.created_at,
            }));
            const jobsActivity: AdminActivity[] = (recentJobs || []).map((j: any) => ({
                id: `job-${j.id}`, type: 'new_job', userId: j.author_id, userName: j.profiles?.name || 'Bilinmeyen Kullanıcı', targetId: j.id, targetName: j.title, timestamp: j.created_at,
            }));

            const combined = [...usersActivity, ...jobsActivity]
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 5);
            setRecentActivity(combined);

            setLoading(false);
        };
        fetchData();
    }, [categories]);

    React.useEffect(() => {
        const calculateFinancials = async () => {
            const now = new Date();
            let startDate = new Date(0); // The beginning of time for 'all'

            if (financialTimeFilter === 'today') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            } else if (financialTimeFilter === 'week') {
                const dayOfWeek = now.getDay();
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
            } else if (financialTimeFilter === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            }
            
            const { data: transactions } = await supabase.from('transactions').select('amount, type').gte('created_at', startDate.toISOString());
            
            const totals = (transactions || []).reduce((acc, tx: Transaction) => {
                if (tx.type === 'fee') { // Commission from bids
                    acc.commissions += Math.abs(tx.amount);
                } else if (tx.type === 'subscription') { // From Pro Plan
                    acc.subscriptions += Math.abs(tx.amount);
                }
                return acc;
            }, { commissions: 0, subscriptions: 0 });
            
            setFinancialData(totals);
        };
        calculateFinancials();
    }, [financialTimeFilter]);

    if (loading) {
        return <DrillingRigLoader />;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={UsersIcon} title="Toplam Kullanıcı" value={stats.totalUsers} />
                <StatCard icon={BriefcaseIcon} title="Toplam Firma" value={stats.totalProviders} />
                <StatCard icon={ChartBarIcon} title="Aktif İlanlar" value={stats.activeJobs} />
                <StatCard icon={CurrencyDollarIcon} title="Toplam Teklif" value={stats.totalBids} />
            </div>

             <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yönetim Paneli Kısayolları</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <ActionCard icon={ShieldCheckIcon} title="Firma Onayları" onClick={() => onNavigate('adminVerification')} />
                    <ActionCard icon={DocumentCheckIcon} title="İlan Onayları" onClick={() => onNavigate('adminPendingJobs')} />
                    <ActionCard icon={UserCheckIcon} title="Profil Onayları" onClick={() => onNavigate('adminPendingProfiles')} />
                    <ActionCard icon={UserCheckIcon} title="Doğrulama Talepleri" onClick={() => onNavigate('adminVerificationRequests')} />
                    <ActionCard icon={DocumentArrowUpIcon} title="Belge Onayları" onClick={() => onNavigate('adminDocumentVerifications')} />
                    <ActionCard icon={ExclamationTriangleIcon} title="Anlaşmazlıklar" onClick={() => onNavigate('adminDisputes')} />
                    <ActionCard icon={FlagIcon} title="Raporlar" onClick={() => onNavigate('adminReports')} />
                    <ActionCard icon={BriefcaseIcon} title="Kariyer Başvuruları" onClick={() => onNavigate('adminJobApplications')} />
                    <ActionCard icon={PlusCircleIcon} title="Açık Pozisyon Yönetimi" onClick={() => onNavigate('adminJobOpenings')} />
                    <ActionCard icon={MessageIcon} title="Admin Mesajları" onClick={() => onNavigate('adminInternalMessages')} />
                    <ActionCard icon={ChatBubbleBottomCenterTextIcon} title="Tüm Mesajlar" onClick={() => onNavigate('adminAllMessages')} />
                    <ActionCard icon={PhotoIcon} title="Kategori Yönetimi" onClick={() => onNavigate('adminCategories')} />
                    <ActionCard icon={Cog6ToothIcon} title="Ayarlar" onClick={() => onNavigate('adminSettings')} />
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Büyüme Analizi (Yeni Kayıtlar)</h3>
                     <div className="h-72">
                        <BarChart data={userGrowthData} />
                     </div>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4">İlan Kategori Dağılımı</h3>
                     <div className="h-72">
                        <PieChart data={jobCategoryDistribution} />
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Finansal Özet</h3>
                        <div className="flex-shrink-0 mt-2 sm:mt-0 bg-gray-100 p-1 rounded-lg">
                            <FilterButton text="Bugün" active={financialTimeFilter === 'today'} onClick={() => setFinancialTimeFilter('today')} />
                            <FilterButton text="Bu Hafta" active={financialTimeFilter === 'week'} onClick={() => setFinancialTimeFilter('week')} />
                            <FilterButton text="Bu Ay" active={financialTimeFilter === 'month'} onClick={() => setFinancialTimeFilter('month')} />
                            <FilterButton text="Tümü" active={financialTimeFilter === 'all'} onClick={() => setFinancialTimeFilter('all')} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <FinancialStatCard title="Komisyon Geliri" amount={financialData.commissions} icon={CurrencyDollarIcon} />
                        <FinancialStatCard title="Abonelik Geliri" amount={financialData.subscriptions} icon={StarIcon} />
                    </div>
                </div>
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                     <RecentActivityFeed activities={recentActivity} onNavigate={onNavigate} />
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ icon: React.FC<any>; title: string; value: string | number; change?: number }> = ({ icon: Icon, title, value, change }) => {
    const isPositive = change && change >= 0;
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200/80">
            <div className="flex justify-between items-start">
                <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {change !== undefined && (
                <div className={`mt-4 flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                    <span>{Math.abs(change)}%</span>
                    <span className="font-normal text-gray-500">geçen aydan</span>
                </div>
            )}
        </div>
    );
};

const FilterButton: React.FC<{ text: string; active: boolean; onClick: () => void }> = ({ text, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
    >
        {text}
    </button>
);

const FinancialStatCard: React.FC<{ title: string; amount: number; icon: React.FC<any> }> = ({ title, amount, icon: Icon }) => (
    <div className="bg-gray-50/80 border border-gray-200/80 p-4 rounded-lg flex items-center">
        <div className="p-3 bg-white rounded-full mr-4 border">
            <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
        </div>
    </div>
);

const activityConfig = {
  new_user: { icon: UserPlusIcon, color: 'text-blue-500', bg: 'bg-blue-100' },
  new_job: { icon: DocumentPlusIcon, color: 'text-green-500', bg: 'bg-green-100' },
  new_bid: { icon: CurrencyDollarIcon, color: 'text-orange-500', bg: 'bg-orange-100' },
  verify_provider: { icon: ShieldCheckIcon, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  accept_bid: { icon: CheckBadgeIcon, color: 'text-purple-500', bg: 'bg-purple-100' },
};

const ActivityItem: React.FC<{ activity: AdminActivity; onNavigate: (view: View, id?: string) => void }> = ({ activity, onNavigate }) => {
    const config = activityConfig[activity.type];
    if (!config) return null;

    const renderText = () => {
        const userNameEl = <strong onClick={() => onNavigate('adminUserDetail', activity.userId)} className="cursor-pointer hover:underline">{activity.userName}</strong>;
        const targetNameEl = activity.targetId && activity.targetName ? <strong onClick={() => onNavigate('adminJobDetail', activity.targetId)} className="cursor-pointer hover:underline">{activity.targetName}</strong> : null;

        switch (activity.type) {
            case 'new_user':
                return <>{userNameEl} platforma yeni bir kullanıcı olarak kaydoldu.</>;
            case 'new_job':
                return <>{userNameEl}, {targetNameEl} adlı yeni bir ilan yayınladı.</>;
            case 'new_bid':
                return <>{userNameEl}, {targetNameEl} ilanına yeni bir teklif verdi.</>;
            case 'verify_provider':
                return <>{userNameEl} adlı firma bir yönetici tarafından doğrulandı.</>;
            case 'accept_bid':
                return <>{userNameEl}, {targetNameEl} ilanı için bir teklifi kabul etti.</>;
            default:
                return null;
        }
    };

    return (
        <div className="flex items-start space-x-4 py-3">
            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${config.bg}`}>
                <config.icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div className="flex-grow">
                <p className="text-sm text-gray-700">{renderText()}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(activity.timestamp)}</p>
            </div>
        </div>
    );
};

const RecentActivityFeed: React.FC<{ activities: AdminActivity[], onNavigate: (view: View, id?: string) => void }> = ({ activities, onNavigate }) => (
    <div>
        <h3 className="text-lg font-semibold text-gray-900">Son Hareketler</h3>
        <div className="mt-4 -my-3 flow-root">
             <div className="divide-y divide-gray-200/80">
                {activities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} onNavigate={onNavigate} />
                ))}
            </div>
        </div>
    </div>
);

const ActionCard: React.FC<{ icon: React.FC<any>; title: string; onClick: () => void }> = ({ icon: Icon, title, onClick }) => (
    <button onClick={onClick} className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 transition-colors border border-gray-200/80">
        <Icon className="h-8 w-8 mx-auto text-blue-600" />
        <p className="text-xs font-semibold text-gray-800 mt-2">{title}</p>
    </button>
);


export default AdminDashboard;