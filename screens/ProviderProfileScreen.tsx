import * as React from 'react';
import { ProviderProfile, UploadedDocument, Rating } from '../types';
import { BuildingOffice2Icon, CheckBadgeIcon, DocumentCheckIcon, TrophyIcon, StarIcon, Cog6ToothIcon, ChartBarIcon, BriefcaseIcon, CurrencyDollarIcon, OutlineStarIcon, UserIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
import TurkeyMap from '../components/TurkeyMap';
import { supabase } from '../utils/supabaseClient';
import { ProfileSection, StatItem } from '../components/shared/common';

interface ProviderProfileScreenProps {
    providerId: string;
    onBack: () => void;
}

const documentTypeNames: Record<UploadedDocument['type'], string> = {
    tax_certificate: 'Vergi Levhası',
    trade_registry: 'Ticaret Sicil Gazetesi',
    qualification_certificate: 'Mesleki Yeterlilik Belgesi',
};


const ProviderProfileScreen: React.FC<ProviderProfileScreenProps> = ({ providerId, onBack }) => {
    const [profile, setProfile] = React.useState<ProviderProfile | null>(null);
    const [ratings, setRatings] = React.useState<Rating[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', providerId)
                .single();

            if (error || !data) {
                console.error("Error fetching provider profile:", error);
                setProfile(null);
            } else {
                // Map Supabase data to the ProviderProfile type
                // Note: Some stats are complex and kept as placeholders
                const fetchedProfile: ProviderProfile = {
                    companyName: data.company_name || 'N/A',
                    logoUrl: data.logo_url,
                    description: data.description || '',
                    servicesOffered: data.services_offered || [],
                    specialties: [], // Not in DB
                    certifications: data.certifications || [],
                    awards: data.awards || [],
                    yearsInBusiness: data.created_at ? new Date().getFullYear() - new Date(data.created_at).getFullYear() : 0,
                    portfolio: data.portfolio || [],
                    clients: [], // Not in DB
                    machinePark: data.machine_park || [],
                    serviceArea: data.service_area || { mapUrl: '', regions: [] },
                    testimonials: [], // Not in DB
                    bids: [], // Fetched separately if needed
                    transactions: [], // Fetched separately if needed
                    contact: {
                        email: data.email || '',
                        phone: data.phone || '',
                        website: data.website || '',
                    },
                    stats: { // Most stats are placeholders as they require complex queries
                        activeBids: 5, wonJobs: 12, balance: data.balance || 0, successRate: 75,
                        averageBidAmount: 125000, jobsWonLastYear: 25, clientSatisfaction: data.average_rating || 0, totalBids: 16, totalEarnings: 1250000,
                    },
                    isVerified: data.is_verified,
                    uploaded_documents: data.uploaded_documents || [],
                };
                setProfile(fetchedProfile);

                // Fetch ratings for this provider
                const { data: ratingsData, error: ratingsError } = await supabase
                    .from('ratings')
                    .select('*, rater_profile:rater_id(name), job_listing:job_id(title)')
                    .eq('rated_id', providerId);

                if(ratingsError) {
                    console.error("Error fetching ratings:", ratingsError);
                } else {
                    setRatings(ratingsData as any[]);
                }
            }
            setLoading(false);
        };

        if (providerId) {
            fetchProfileData();
        }
    }, [providerId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <DrillingRigLoader />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                <Header onBack={onBack} />
                <div className="p-4 text-center">
                    <p>Sağlayıcı profili bulunamadı.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header onBack={onBack} />
            <div className="bg-white dark:bg-gray-800 pb-8 rounded-b-3xl shadow-sm">
                <ProviderInfo profile={profile} />
            </div>
            <div className="p-4">
                <ProviderContent profile={profile} ratings={ratings} />
            </div>
        </div>
    );
};

const Header: React.FC<{onBack: () => void}> = ({ onBack }) => (
    <header className="p-4 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-3xl">
         <button onClick={onBack} className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Firma Profili</h1>
        <div className="w-10"></div>
    </header>
);

const ProviderInfo: React.FC<{ profile: ProviderProfile }> = ({ profile }) => (
     <div className="flex items-center p-4">
        <div className="relative mr-4 flex-shrink-0">
            {profile.logoUrl ? (
                <img src={profile.logoUrl} alt={`${profile.companyName} logosu`} className="h-20 w-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 shadow-sm" />
            ) : (
                <div className="h-20 w-20 rounded-full bg-orange-500 flex items-center justify-center text-white">
                    <BuildingOffice2Icon className="h-10 w-10" />
                </div>
            )}
            {profile.isVerified && <div className="absolute -bottom-1 -right-0 bg-green-500 text-white h-7 w-7 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800" title="Doğrulanmış Sağlayıcı">
                <CheckBadgeIcon className="h-4 w-4" />
            </div>}
        </div>
        <div className="flex-grow">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{profile.companyName}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{profile.yearsInBusiness > 0 ? `${profile.yearsInBusiness} yıldır sektörde` : 'Yeni Firma'}</p>
        </div>
    </div>
);

const ProviderContent: React.FC<{profile: ProviderProfile; ratings: Rating[]}> = ({ profile, ratings }) => {
    const approvedDocuments = profile.uploaded_documents?.filter(doc => doc.status === 'approved') || [];
    return (
    <div className="space-y-6">
        <ProfileSection title="Doğrulamalar">
            <div className="flex flex-wrap gap-2">
                {profile.isVerified && (
                     <span className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <CheckBadgeIcon className="h-4 w-4" />
                        Onaylı Hesap
                    </span>
                )}
                {approvedDocuments.map(doc => (
                    <span key={doc.type} className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                        <CheckBadgeIcon className="h-4 w-4" />
                        {documentTypeNames[doc.type]} Onaylı
                    </span>
                ))}
                 {approvedDocuments.length === 0 && !profile.isVerified && (
                     <p className="text-sm text-gray-500 dark:text-gray-400">Bu firmanın henüz doğrulanmış bir belgesi bulunmuyor.</p>
                )}
            </div>
        </ProfileSection>

        <ProfileSection title="Değerlendirmeler">
            {ratings.length > 0 ? (
                <div className="space-y-4">
                    {ratings.map(rating => <RatingItem key={rating.id} rating={rating} />)}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Bu firma için henüz bir değerlendirme yapılmamış.</p>
            )}
        </ProfileSection>

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
        
        <ProfileSection title="Makine Parkuru">
            <div className="space-y-3">
                {(profile.machinePark || []).length > 0 ? profile.machinePark.map((machine, index) => (
                     <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <Cog6ToothIcon className="h-6 w-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{machine.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{machine.model}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg text-blue-600 dark:text-blue-400">{machine.quantity}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Adet</p>
                        </div>
                    </div>
                )) : (
                     <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Firma makine parkuru bilgisini paylaşmamış.</p>
                )}
            </div>
        </ProfileSection>

        <ProfileSection title="Hizmet Bölgeleri">
            <TurkeyMap highlightedRegions={profile.serviceArea?.regions || []} />
            <div className="flex flex-wrap gap-2 mt-4">
                {(profile.serviceArea?.regions || []).map(region => (
                    <span key={region} className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-sm font-medium px-3 py-1 rounded-full">
                        {region}
                    </span>
                ))}
            </div>
        </ProfileSection>


        <ProfileSection title="Sertifikalar">
            <ul className="space-y-2">
                {(profile.certifications || []).map(cert => (
                    <li key={cert} className="flex items-center text-gray-700 dark:text-gray-300">
                        <DocumentCheckIcon className="h-5 w-5 mr-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                        <span>{cert}</span>
                    </li>
                ))}
            </ul>
        </ProfileSection>

    </div>
    );
};

const RatingItem: React.FC<{ rating: Rating }> = ({ rating }) => {
    const ratingValues = rating.ratings ? Object.values(rating.ratings) : [];
    const numericValues = ratingValues.map(v => Number(v)).filter(v => !isNaN(v));
    const totalScore = numericValues.reduce((sum: number, val: number) => sum + val, 0);
    const avgScore = numericValues.length > 0 ? totalScore / numericValues.length : 0;

    return (
        <div className="border-t pt-4 first:border-t-0 first:pt-0">
            <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                    <UserIcon className="h-6 w-6" />
                </div>
                <div>
                     <p className="font-bold">{rating.rater_profile?.name || 'Anonim'}</p>
                     <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`h-4 w-4 ${i < Math.round(avgScore) ? 'text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                     </div>
                </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mt-2">İş: {rating.job_listing?.title || 'Bilinmiyor'}</p>
            {rating.comment && <p className="mt-2 text-gray-700 italic">"{rating.comment}"</p>}
        </div>
    );
};


export default ProviderProfileScreen;