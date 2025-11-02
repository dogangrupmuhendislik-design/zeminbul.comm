import * as React from 'react';
import { UserRole, CustomerProfile, ProviderProfile, JobListing, View, Transaction, Profile as ProfileType } from '../types';
import { UserIcon, BriefcaseIcon, CheckBadgeIcon, Cog6ToothIcon, ShareIcon, BuildingOffice2Icon, CurrencyDollarIcon, StarIcon, ChartBarIcon, QuestionMarkCircleIcon, SunIcon, MoonIcon, ChatBubbleBottomCenterTextIcon, TrophyIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { supabase } from '../utils/supabaseClient';
import { ProfileSection, SettingsRow, KeyValueRow, JobListSection, TransactionHistorySection, StatItem } from '../components/shared/common';

interface ProfileProps {
  userRole: UserRole;
  onLogout: () => void;
  onNavigate: (view: View, jobId?: string) => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

const Profile: React.FC<ProfileProps> = ({ userRole, onLogout, onNavigate, theme, onThemeChange }) => {
    const [profile, setProfile] = React.useState<any | null>(null);
    const [loading, setLoading] = React.useState(true);

    const fetchProfileData = React.useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            if (profileData) {
                // Fetch related data
                if (profileData.role === 'customer') {
                    const { data: listings } = await supabase.from('job_listings').select('*').eq('author_id', user.id);
                    const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', user.id);
                    // Mocked stats for now
                    profileData.stats = { open: listings?.length || 0, active: 0, completed: 0 };
                    profileData.listings = listings || [];
                    profileData.transactions = transactions || [];
                } else if (profileData.role === 'provider') {
                     const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', user.id);
                     profileData.transactions = transactions || [];
                     // Mocked complex data for provider profile for simplicity
                     profileData.stats = { activeBids: 5, wonJobs: 12, balance: profileData.balance || 0, successRate: 75, averageBidAmount: 125000, jobsWonLastYear: 25, clientSatisfaction: 4.8, totalBids: 16, totalEarnings: 1250000 };
                     profileData.servicesOffered = profileData.services_offered || [];
                }
                setProfile(profileData);
            }
        }
        setLoading(false);
    }, []);


    React.useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

  const customerData = userRole === 'customer' ? (profile as CustomerProfile) : null;
  const providerData = userRole === 'provider' ? (profile as ProviderProfile & {companyName: string, contact: any}) : null;
  const adminData = userRole === 'admin' ? (profile as ProfileType) : null;
  
  if (providerData) {
      providerData.companyName = profile.company_name;
      providerData.contact = { email: profile.email, phone: profile.phone, website: profile.website };
  }


  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ZeminBul.com',
          text: 'Geoteknik projelerin için en iyi firmaları ZeminBul.com\'da bul!',
          url: window.location.origin,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('Paylaşma özelliği tarayıcınız tarafından desteklenmiyor.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header onLogout={onLogout} onEdit={() => onNavigate('editProfile')} theme={theme} onThemeChange={onThemeChange} />
        {loading || !profile ? (
            <DrillingRigLoader />
        ) : (
            <>
                <div className="bg-white dark:bg-gray-800 pb-8 rounded-b-3xl shadow-sm">
                    {userRole === 'customer' && customerData && <CustomerInfo profile={profile} />}
                    {userRole === 'provider' && providerData && <ProviderInfo profile={profile} />}
                    {userRole === 'admin' && adminData && <AdminInfo profile={adminData} />}
                </div>
                <div className="p-4">
                    {userRole === 'customer' && customerData && <CustomerContent profile={profile} onNavigate={onNavigate} onShare={handleShare} />}
                    {userRole === 'provider' && providerData && <ProviderContent profile={profile} onNavigate={onNavigate} />}
                    {userRole === 'admin' && adminData && <AdminContent profile={adminData} onNavigate={onNavigate} onShare={handleShare} />}
                </div>
            </>
        )}
    </div>
  );
};

const Header: React.FC<{onLogout: () => void, onEdit: () => void, theme: 'light' | 'dark', onThemeChange: () => void}> = ({ onLogout, onEdit, theme, onThemeChange }) => (
    <header className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-3xl">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Profil</h1>
        <div className="flex items-center space-x-2">
            <button onClick={onThemeChange} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700">
                {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
            <button onClick={onEdit} className="text-sm text-blue-600 dark:text-blue-400 font-semibold">Düzenle</button>
            <button onClick={onLogout} className="text-sm text-red-500 dark:text-red-400 font-semibold">Çıkış Yap</button>
        </div>
    </header>
);

const CustomerInfo: React.FC<{ profile: ProfileType & CustomerProfile }> = ({ profile }) => (
    <div className="flex flex-col items-center px-4">
        <div className="relative">
            {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="h-24 w-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-sm" />
            ) : (
                 <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <UserIcon className="h-12 w-12" />
                </div>
            )}
             {profile.is_pro && (
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-yellow-400 to-orange-500 text-white h-8 w-8 rounded-full flex items-center justify-center border-2 border-white shadow" title="Pro Üye">
                    <StarIcon className="h-5 w-5" />
                </div>
            )}
            {profile.is_verified && (
                <div className="absolute -bottom-1 -left-1 bg-green-500 text-white h-8 w-8 rounded-full flex items-center justify-center border-2 border-white shadow" title="Onaylı Hesap">
                    <CheckBadgeIcon className="h-5 w-5" />
                </div>
            )}
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.name}</h2>
        <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
        <div className="mt-6 w-full grid grid-cols-3 gap-2 text-center">
            <StatItem value={profile.stats.open} label="Açık İlan" icon={BriefcaseIcon} />
            <StatItem value={profile.stats.active} label="Aktif İş" icon={BriefcaseIcon} color="green" />
            <StatItem value={profile.stats.completed} label="Tamamlanan İş" icon={CheckBadgeIcon} color="purple"/>
        </div>
    </div>
);

const ProviderInfo: React.FC<{ profile: ProfileType & ProviderProfile }> = ({ profile }) => (
     <div className="flex items-center p-4">
        <div className="relative mr-4 flex-shrink-0">
            {profile.logo_url ? (
                <img src={profile.logo_url} alt={`${profile.company_name} logosu`} className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-sm" />
            ) : (
                <div className="h-20 w-20 rounded-full bg-orange-500 flex items-center justify-center text-white">
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{profile.company_name}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{profile.yearsInBusiness || 0} yıldır sektörde</p>
        </div>
    </div>
);

const AdminInfo: React.FC<{ profile: ProfileType }> = ({ profile }) => (
    <div className="flex flex-col items-center px-4">
        <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            <Cog6ToothIcon className="h-12 w-12" />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.name || 'Admin'}</h2>
        <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
    </div>
);

const CustomerContent: React.FC<{profile: ProfileType & CustomerProfile, onNavigate: (view: View, jobId?: string) => void, onShare: () => void}> = ({ profile, onNavigate, onShare }) => (
    <div className="space-y-6">
        <ProfileSection title="Abonelik Durumu">
             {profile.is_pro ? (
                <div className="bg-green-50 dark:bg-green-900/50 border-l-4 border-green-500 text-green-800 dark:text-green-200 p-4 rounded-md" role="alert">
                    <div className="flex">
                        <div className="py-1"><CheckBadgeIcon className="h-6 w-6 text-green-500 mr-3"/></div>
                        <div>
                            <p className="font-bold">Pro Üyesisiniz</p>
                            <p className="text-sm dark:text-green-300">Tüm Pro özelliklerinden yararlanıyorsunuz.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <SettingsRow 
                    label="Pro Plana Yükselt"
                    sublabel="Sınırsız ilan yayınlayın ve firma profillerini görüntüleyin."
                    icon={StarIcon}
                    onClick={() => onNavigate('proPlan')}
                />
            )}
        </ProfileSection>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
            <h3 className="font-bold mb-2 dark:text-gray-100">Hesap Bilgileri</h3>
            <SettingsRow label="Profili Düzenle" icon={UserIcon} onClick={() => onNavigate('editProfile')} />
            <SettingsRow 
                label={profile.is_verified ? "Onaylı Hesap" : "Hesabını Onayla"}
                sublabel={profile.is_verified ? "Hesabınız başarıyla onaylanmıştır." : "Onaylı hesap rozeti alarak güvenilirliğinizi artırın."}
                icon={CheckBadgeIcon}
                onClick={() => onNavigate('verificationRequest')}
            />
            <KeyValueRow label="E-posta" value={profile.email!} />
            <KeyValueRow label="Telefon" value={profile.phone || 'Belirtilmemiş'} />
        </div>
        <JobListSection title="İlanlarım" jobs={profile.listings} onNavigate={onNavigate} />
        <TransactionHistorySection transactions={profile.transactions} />
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
             <h3 className="font-bold mb-2 dark:text-gray-100">Ayarlar ve Destek</h3>
             <SettingsRow label="Ayarlar" sublabel="Bildirimler, gizlilik ve daha fazlası" icon={Cog6ToothIcon} onClick={() => onNavigate('settings')}/>
             <SettingsRow label="Sıkça Sorulan Sorular" icon={QuestionMarkCircleIcon} onClick={() => onNavigate('faq')} />
             <SettingsRow label="İstek, Öneri ve Şikayet" sublabel="Bize geri bildirimde bulunun" icon={ChatBubbleBottomCenterTextIcon} onClick={() => onNavigate('contactUs')} />
             <SettingsRow label="Uygulamayı Paylaş" sublabel="ZeminBul'u arkadaşlarına önerin" icon={ShareIcon} onClick={onShare} />
        </div>
    </div>
);

const ProviderContent: React.FC<{profile: ProfileType & ProviderProfile, onNavigate: (view: View) => void}> = ({ profile, onNavigate }) => (
    <div className="space-y-6">
        <ProfileSection title="Hesap İşlemleri">
            <SettingsRow 
                label="Profili Düzenle" 
                sublabel="Firma bilgilerinizi ve portfolyonuzu güncelleyin" 
                icon={UserIcon}
                onClick={() => onNavigate('editProfile')}
            />
             <SettingsRow 
                label={profile.is_verified ? "Onaylı Firma" : "Firmanı Onayla"}
                sublabel={profile.is_verified ? "Firmanız başarıyla onaylanmıştır." : "Onaylı firma rozeti alarak daha fazla iş alın."}
                icon={CheckBadgeIcon}
                onClick={() => onNavigate('verificationRequest')}
            />
            <SettingsRow 
                label="Bakiye Yükle" 
                sublabel="Teklif vermek için bakiye yükleyin" 
                icon={CurrencyDollarIcon}
                onClick={() => onNavigate('addFunds')}
            />
        </ProfileSection>

        <ProfileSection title="Destek ve Ayarlar">
            <SettingsRow 
                label="Ayarlar" 
                sublabel="Bildirimler, gizlilik ve daha fazlası" 
                icon={Cog6ToothIcon}
                onClick={() => onNavigate('settings')}
            />
            <SettingsRow 
                label="Sıkça Sorulan Sorular" 
                sublabel="Merak ettiğiniz soruların cevapları" 
                icon={QuestionMarkCircleIcon}
                onClick={() => onNavigate('faq')}
            />
            <SettingsRow 
                label="İstek, Öneri ve Şikayet" 
                sublabel="Bize geri bildirimde bulunun" 
                icon={ChatBubbleBottomCenterTextIcon}
                onClick={() => onNavigate('contactUs')}
            />
        </ProfileSection>
        
        <TransactionHistorySection transactions={profile.transactions} />
        
        <ProfileSection title="Hakkında">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{profile.description}</p>
        </ProfileSection>

        <ProfileSection title="İstatistikler">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <StatItem icon={TrophyIcon} value={(profile.stats.wonJobs || 0).toString()} label="Kazanılan İş" />
                <StatItem icon={ChartBarIcon} value={`${profile.stats.successRate || 0}%`} label="Başarı Oranı" />
                <StatItem icon={BriefcaseIcon} value={(profile.stats.totalBids || 0).toString()} label="Toplam Teklif" />
                <StatItem icon={CurrencyDollarIcon} value={(profile.stats.totalEarnings || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 })} label="Toplam Kazanç" />
                <StatItem icon={CurrencyDollarIcon} value={(profile.stats.averageBidAmount || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 })} label="Ortalama Teklif" />
                <StatItem icon={StarIcon} value={`${profile.stats.clientSatisfaction || 0} / 5.0`} label="Müşteri Memnuniyeti" />
            </div>
        </ProfileSection>

        <ProfileSection title="Sunulan Hizmetler">
            <div className="flex flex-wrap gap-2">
                {(profile.servicesOffered || []).map(service => (
                    <span key={service} className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-sm font-medium px-3 py-1 rounded-full">
                        {service}
                    </span>
                ))}
            </div>
        </ProfileSection>

        {/* Other sections like specialties, machine park etc. can be added here if they are in the 'profiles' table jsonb column */}
    </div>
);

const AdminContent: React.FC<{profile: ProfileType, onNavigate: (view: View) => void, onShare: () => void}> = ({ profile, onNavigate, onShare }) => (
    <div className="space-y-6">
        <ProfileSection title="Yönetici İşlemleri">
            <SettingsRow 
                label="Platform Ayarları" 
                sublabel="Komisyon, kategoriler ve duyuruları yönetin" 
                icon={Cog6ToothIcon}
                onClick={() => onNavigate('adminSettings')}
            />
             <SettingsRow 
                label="İstek, Öneri ve Şikayet" 
                sublabel="Kullanıcı geri bildirimlerini görüntüle" 
                icon={ChatBubbleBottomCenterTextIcon}
                onClick={() => onNavigate('adminTickets')}
            />
             <SettingsRow 
                label="Uygulamayı Paylaş" 
                sublabel="ZeminBul'u arkadaşlarına önerin" 
                icon={ShareIcon} 
                onClick={onShare} 
            />
        </ProfileSection>
    </div>
);


export default Profile;