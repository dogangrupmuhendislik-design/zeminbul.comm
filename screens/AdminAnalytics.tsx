import * as React from 'react';
import { View, Profile, JobListing, Transaction } from '../types';
import { BarChart, PieChart, LineChart } from '../components/AdminCharts';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { useCategories } from '../contexts/CategoriesContext';
import { ICON_MAP } from '../constants';

interface AdminAnalyticsProps {
    onNavigate: (view: View, id?: string) => void;
}

type Tab = 'users' | 'jobs' | 'financials';

const monthOrder = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = React.useState<Tab>('users');
    const [loading, setLoading] = React.useState(true);
    
    // Data states
    const [userGrowth, setUserGrowth] = React.useState<any[]>([]);
    const [jobDistribution, setJobDistribution] = React.useState<any[]>([]);
    const [jobsOverTime, setJobsOverTime] = React.useState<any[]>([]);
    const [revenueOverTime, setRevenueOverTime] = React.useState<any[]>([]);
    const { categories } = useCategories();


    React.useEffect(() => {
        const fetchData = async () => {
            if (categories.length === 0) return;
            setLoading(true);

            // Fetch all necessary data
            const { data: profiles } = await supabase.from('profiles').select('created_at, role');
            const { data: jobs } = await supabase.from('job_listings').select('created_at, category_id');
            const { data: transactions } = await supabase.from('transactions').select('created_at, amount, type');

            // Process User Growth
            const growth = (profiles || []).reduce((acc: Record<string, { month: string, customers: number, providers: number }>, p) => {
                if (!p.created_at) return acc;
                const month = new Date(p.created_at).toLocaleString('tr-TR', { month: 'short' });
                if (!acc[month]) acc[month] = { month, customers: 0, providers: 0 };
                if (p.role === 'customer') acc[month].customers++;
                if (p.role === 'provider') acc[month].providers++;
                return acc;
            }, {});
            const sortedGrowth = Object.values(growth).sort((a: { month: string }, b: { month: string }) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
            setUserGrowth(sortedGrowth);
            
            // Process Job Distribution
            const colors = ['#3b82f6', '#ef4444', '#10b981', '#f97316', '#8b5cf6', '#eab308'];
            const distribution = (jobs || []).reduce((acc: Record<string, { name: string; value: number }>, job) => {
                const categoryName = categories.find(c => c.id === job.category_id)?.name || 'Diğer';
                if (!acc[categoryName]) acc[categoryName] = { name: categoryName, value: 0 };
                acc[categoryName].value++;
                return acc;
            }, {});
            setJobDistribution(Object.values(distribution).map((item: { name: string; value: number; }, index) => ({...item, color: colors[index % colors.length]})));

            // Process Jobs Over Time
            const jobsByMonth = (jobs || []).reduce((acc: Record<string, { label: string, value: number }>, job) => {
                const month = new Date(job.created_at).toLocaleString('tr-TR', { month: 'short' });
                if (!acc[month]) acc[month] = { label: month, value: 0 };
                acc[month].value++;
                return acc;
            }, {});
            const sortedJobs = Object.values(jobsByMonth).sort((a: { label: string }, b: { label: string }) => monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label));
            setJobsOverTime(sortedJobs);
            
            // Process Revenue Over Time
            const revenueByMonth = (transactions || []).reduce((acc: Record<string, { label: string, value: number }>, tx) => {
                if(tx.type === 'fee' || tx.type === 'subscription') {
                    const month = new Date(tx.created_at).toLocaleString('tr-TR', { month: 'short' });
                    if (!acc[month]) acc[month] = { label: month, value: 0 };
                    acc[month].value += Math.abs(tx.amount);
                }
                return acc;
            }, {});
            const sortedRevenue = Object.values(revenueByMonth).sort((a: { label: string }, b: { label: string }) => monthOrder.indexOf(a.label) - monthOrder.indexOf(b.label));
            setRevenueOverTime(sortedRevenue);

            setLoading(false);
        };
        if(categories.length > 0) fetchData();

    }, [categories]);

    return (
        <div className="space-y-6">
            <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-md">
                <TabButton text="Kullanıcı Analitiği" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <TabButton text="İlan Analitiği" active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')} />
                <TabButton text="Finansal Analitik" active={activeTab === 'financials'} onClick={() => setActiveTab('financials')} />
            </div>
            
            {loading ? <DrillingRigLoader /> : (
                <>
                    {activeTab === 'users' && (
                        <AnalyticsSection title="Platform Büyüme Analizi (Yeni Kayıtlar)">
                            <div className="h-80">
                                <BarChart data={userGrowth} />
                            </div>
                        </AnalyticsSection>
                    )}
                    {activeTab === 'jobs' && (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-3">
                                <AnalyticsSection title="Aylara Göre Yeni İlan Sayısı">
                                    <div className="h-80"><LineChart data={jobsOverTime} color="#10b981" /></div>
                                </AnalyticsSection>
                            </div>
                            <div className="lg:col-span-2">
                                <AnalyticsSection title="İlan Kategori Dağılımı">
                                    <div className="h-80"><PieChart data={jobDistribution} /></div>
                                </AnalyticsSection>
                            </div>
                        </div>
                    )}
                    {activeTab === 'financials' && (
                        <AnalyticsSection title="Aylık Gelir Trendi (Komisyon + Abonelik)">
                             <div className="h-80"><LineChart data={revenueOverTime} color="#8b5cf6" /></div>
                        </AnalyticsSection>
                    )}
                </>
            )}
        </div>
    );
};

const TabButton: React.FC<{ text: string; active: boolean; onClick: () => void; }> = ({ text, active, onClick }) => (
    <button onClick={onClick} className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
        {text}
    </button>
);

const AnalyticsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        {children}
    </div>
);

export default AdminAnalytics;