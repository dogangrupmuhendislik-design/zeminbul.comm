import * as React from 'react';
import { UserRole, Profile, JobListing, Bid, Transaction, View } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { 
    UserIcon, BriefcaseIcon, CheckBadgeIcon, XCircleIcon, TrashIcon, BuildingOffice2Icon, TrophyIcon, 
    CurrencyDollarIcon, StarIcon, ChartBarIcon
} from '../components/icons';
// FIX: Added KeyValueRow to imports from shared components.
import { ProfileSection, StatItem, JobListSection, TransactionHistorySection, KeyValueRow } from '../components/shared/common';

interface AdminUserDetailProps {
    userId: string;
}

// FIX: Added missing CustomerInfo component definition.
const CustomerInfo: React.FC<{ profile: Profile }> = ({ profile }) => (
    <div className="flex items-center p-4">
        <div className="relative mr-4 flex-shrink-0">
            <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <UserIcon className="h-10 w-10" />
            </div>
            {profile.is_verified && <div className="absolute -bottom-1 -right-0 bg-green-500 text-white h-7 w-7 rounded-full flex items-center justify-center border-2 border-white" title="Onaylı Kullanıcı">
                <CheckBadgeIcon className="h-4 w-4" />
            </div>}
        </div>
        <div>
            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-500">{profile.email}</p>
        </div>
    </div>
);

// FIX: Added missing ProviderInfo component definition.
const ProviderInfo: React.FC<{ profile: Profile }> = ({ profile }) => (
    <div className="flex items-center p-4">
        <div className="relative mr-4 flex-shrink-0">
            {profile.logo_url ? (
                <img src={profile.logo_url} alt={`${profile.company_name} logosu`} className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 shadow-sm" />
            ) : (
                <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <BuildingOffice2Icon className="h-10 w-10" />
                </div>
            )}
            {profile.is_verified && (
                <div className="absolute -bottom-1 -right-0 bg-green-500 text-white h-7 w-7 rounded-full flex items-center justify-center border-2 border-white" title="Doğrulanmış Sağlayıcı">
                    <CheckBadgeIcon className="h-4 w-4" />
                </div>
            )}
        </div>
        <div className="flex-grow">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">{profile.company_name}</h2>
            <p className="text-gray-500 mt-1">{profile.email}</p>
        </div>
    </div>
);

// FIX: Added missing AdminActions component definition.
const AdminActions: React.FC<{
    isProvider: boolean;
    isVerified: boolean;
    isSuspended: boolean;
    onVerify: () => void;
    onSuspend: () => void;
    onDelete: () => void;
}> = ({ isProvider, isVerified, isSuspended, onVerify, onSuspend, onDelete }) => (
    <ProfileSection title="Yönetici Eylemleri">
        <div className="flex flex-wrap gap-2">
            {isProvider && (
                <button onClick={onVerify} className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${isVerified ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
                    {isVerified ? <XCircleIcon className="h-4 w-4" /> : <CheckBadgeIcon className="h-4 w-4" />}
                    <span>{isVerified ? 'Doğrulamayı Kaldır' : 'Doğrula'}</span>
                </button>
            )}
             <button onClick={onSuspend} className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${isSuspended ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>
                {isSuspended ? <CheckBadgeIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                <span>{isSuspended ? 'Askıyı Kaldır' : 'Askıya Al'}</span>
            </button>
            <button onClick={onDelete} className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors bg-red-100 text-red-800 hover:bg-red-200">
                <TrashIcon className="h-4 w-4" />
                <span>Kullanıcıyı Sil</span>
            </button>
        </div>
    </ProfileSection>
);

// FIX: Added missing CustomerContent component definition.
const CustomerContent: React.FC<{ profile: any; onNavigate: (view: View, jobId?: string) => void }> = ({ profile, onNavigate }) => (
    <div className="space-y-6">
        <ProfileSection title="Genel Bilgiler">
            <KeyValueRow label="Kullanıcı ID" value={profile.id} />
            <KeyValueRow label="Email" value={profile.email} />
            <KeyValueRow label="Kayıt Tarihi" value={new Date(profile.created_at).toLocaleDateString()} />
        </ProfileSection>
        <JobListSection title="İlanları" jobs={profile.listings} onNavigate={onNavigate} />
        <TransactionHistorySection transactions={profile.transactions} />
    </div>
);

// FIX: Added missing ProviderContent component definition.
const ProviderContent: React.FC<{ profile: any }> = ({ profile }) => (
    <div className="space-y-6">
        <ProfileSection title="Genel Bilgiler">
            <KeyValueRow label="Kullanıcı ID" value={profile.id} />
            <KeyValueRow label="Email" value={profile.email} />
            <KeyValueRow label="Telefon" value={profile.phone || 'Belirtilmemiş'} />
            <KeyValueRow label="Website" value={profile.website || 'Belirtilmemiş'} />
            <KeyValueRow label="Kayıt Tarihi" value={new Date(profile.created_at).toLocaleDateString()} />
        </ProfileSection>

        <ProfileSection title="İstatistikler">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <StatItem icon={TrophyIcon} value={(profile.stats.wonJobs || 0).toString()} label="Kazanılan İş" />
                <StatItem icon={ChartBarIcon} value={`${profile.stats.successRate || 0}%`} label="Başarı Oranı" />
                <StatItem icon={BriefcaseIcon} value={(profile.stats.totalBids || 0).toString()} label="Toplam Teklif" />
                <StatItem icon={CurrencyDollarIcon} value={(profile.stats.totalEarnings || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} label="Toplam Kazanç" />
                <StatItem icon={StarIcon} value={`${profile.stats.clientSatisfaction || 0} / 5.0`} label="Müşteri Memnuniyeti" />
                <StatItem icon={CurrencyDollarIcon} value={(profile.stats.balance || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} label="Bakiye" />
            </div>
        </ProfileSection>

        <TransactionHistorySection transactions={profile.transactions} />
    </div>
);


const AdminUserDetail: React.FC<AdminUserDetailProps> = ({ userId }) => {
    const [user, setUser] = React.useState<any | null>(null);
    const [loading, setLoading] = React.useState(true);

    const fetchUserData = React.useCallback(async () => {
        setLoading(true);

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        
        if (profileError || !profile) {
            console.error("Error fetching user profile:", profileError);
            setLoading(false);
            return;
        }

        let relatedData: any = {};
        if (profile.role === 'customer') {
            const { data: listings } = await supabase.from('job_listings').select('*').eq('author_id', userId);
            relatedData.listings = listings || [];
            const { count: openCount } = await supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('status', 'open');
            const { count: activeCount } = await supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('status', 'active');
            const { count: completedCount } = await supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('author_id', userId).eq('status', 'completed');
            relatedData.stats = { open: openCount || 0, active: activeCount || 0, completed: completedCount || 0 };
        } else { // Provider
            const { data: bids } = await supabase.from('bids').select('*, job_listings(title)').eq('provider_id', userId);
            relatedData.bids = (bids || []).map((b: any) => ({ ...b, jobTitle: b.job_listings?.title }));
            // Simplified stats for now
            relatedData.stats = { wonJobs: 0, successRate: 0, totalBids: bids?.length || 0, totalEarnings: 0, clientSatisfaction: 0, balance: profile.balance || 0 };
        }
        
        const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', userId);
        relatedData.transactions = transactions || [];

        setUser({ ...profile, ...relatedData });
        setLoading(false);
    }, [userId]);

    React.useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    const handleToggleVerification = async () => {
        const newStatus = !user.is_verified;
        setUser({ ...user, is_verified: newStatus });
        await supabase.from('profiles').update({ is_verified: newStatus }).eq('id', userId);
    };

    const handleDeleteUser = async () => {
        if (window.confirm('Bu kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            // Note: In a real app, you'd want to use a Supabase Function with admin rights to delete from auth.users
            alert('Kullanıcı silindi! (Simülasyon - Sadece profil silindi, auth kullanıcısı değil)');
            await supabase.from('profiles').delete().eq('id', userId);
            // The layout's back button will take the admin back to the user list.
        }
    };
    
    // Suspension is not in DB schema, so it remains a UI-only simulation for now.
    const [isSuspended, setIsSuspended] = React.useState(false);
    const handleToggleSuspension = () => setIsSuspended(!isSuspended);

    if (loading) {
        return <DrillingRigLoader />;
    }

    if (!user) {
        return (
            <div className="p-4 text-center">Kullanıcı bilgileri yüklenemedi.</div>
        );
    }
    
    const isProvider = user.role === 'provider';

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 shadow-sm rounded-lg">
                {isProvider ? <ProviderInfo profile={user} /> : <CustomerInfo profile={user} />}
            </div>

            <AdminActions 
                isProvider={isProvider}
                isVerified={user.is_verified}
                isSuspended={isSuspended}
                onVerify={handleToggleVerification}
                onSuspend={handleToggleSuspension}
                onDelete={handleDeleteUser}
            />
            
            {isProvider ? (
                <ProviderContent profile={user} />
            ) : (
                <CustomerContent profile={user} onNavigate={(view, id) => { console.warn(`Admin navigation to ${view} (${id}) is not implemented.`)}} />
            )}
        </div>
    );
};

export default AdminUserDetail;