import * as React from 'react';
import { JobListing, Bid } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
// FIX: Use categories from context instead of a static import.
import { useCategories } from '../contexts/CategoriesContext';
import { 
    MapPinIcon, CalendarIcon, UserIcon, StarIcon, TrashIcon, CurrencyDollarIcon, ClockIcon, 
    CheckBadgeIcon, XCircleIcon, BriefcaseIcon, BuildingOffice2Icon
} from '../components/icons';
import { IconInfoRow, ProfileSection } from '../components/shared/common';

interface AdminJobDetailProps {
    jobId: string;
}

const AdminJobDetail: React.FC<AdminJobDetailProps> = ({ jobId }) => {
    const [job, setJob] = React.useState<(JobListing & { customer_name: string }) | null>(null);
    const [bids, setBids] = React.useState<Bid[]>([]);
    const [loading, setLoading] = React.useState(true);
    const { categories } = useCategories();

    const fetchJobData = React.useCallback(async () => {
        setLoading(true);
        const { data: jobData, error: jobError } = await supabase
            .from('job_listings')
            .select('*, profiles:author_id(name)')
            .eq('id', jobId)
            .single();

        if (jobError || !jobData) {
            console.error("Error fetching job details:", jobError?.message || 'Job not found');
            setLoading(false);
            return;
        }
        
        const formattedJob = { 
            ...jobData, 
            customer_name: (jobData.profiles as any)?.name || 'Bilinmeyen Kullanıcı'
        };
        delete (formattedJob as any).profiles;
        setJob(formattedJob);

        const { data: bidsData, error: bidsError } = await supabase
            .from('bids')
            .select('*, profiles(company_name, logo_url)')
            .eq('job_id', jobId);

        if (bidsError) {
            console.error("Error fetching bids for job:", bidsError);
        } else {
            const formattedBids = bidsData.map((b: any) => ({
                ...b,
                provider_name: b.profiles.company_name,
                provider_logo_url: b.profiles.logo_url
            }));
            setBids(formattedBids);
        }

        setLoading(false);
    }, [jobId]);

    React.useEffect(() => {
        fetchJobData();
    }, [fetchJobData]);

    const handleDeleteJob = async () => {
        if (window.confirm('Bu ilanı kalıcı olarak silmek istediğinizden emin misiniz?')) {
            const { error } = await supabase.from('job_listings').delete().eq('id', jobId);
            if (!error) {
                setJob(null); // Re-render to show "not found" state
            } else {
                alert("İlan silinirken bir hata oluştu: " + error.message);
            }
        }
    };
    
    // Featured status is not in DB, so it's a UI-only simulation
    const [isFeatured, setIsFeatured] = React.useState(false);
    const handleToggleFeatured = () => setIsFeatured(!isFeatured);

    if (loading) {
        return <DrillingRigLoader />;
    }

    if (!job) {
        return (
            <div className="p-4 text-center">İlan bilgileri yüklenemedi veya ilan silinmiş olabilir.</div>
        );
    }

    const categoryName = categories.find(s => s.id === job.category_id)?.name || job.category_id;
    const formattedDate = new Date(job.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="min-h-screen bg-gray-100 pb-24">
            
            <div className="bg-white p-4 shadow-sm">
                <JobInfo 
                    title={job.title} 
                    category={categoryName} 
                    customer={job.customer_name}
                    location={job.location?.text || 'Belirtilmemiş'}
                    date={formattedDate}
                />
            </div>

            <main className="p-4 space-y-6">
                <AdminActions 
                    isFeatured={isFeatured}
                    onFeature={handleToggleFeatured}
                    onDelete={handleDeleteJob}
                />
                <ProfileSection title="Proje Detayları">
                    <p className="text-gray-700 whitespace-pre-wrap">{job.details}</p>
                </ProfileSection>

                {job.wizard_answers && (
                    <ProfileSection title="Teknik Detaylar">
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(job.wizard_answers).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-gray-500 capitalize">{key}</p>
                                    <p className="font-semibold text-gray-800">
                                        {typeof value === 'object' && value !== null && 'value' in value ? `${(value as any).value} ${(value as any).unit}` : String(value)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </ProfileSection>
                )}
                
                <BidsSection bids={bids} />
            </main>
        </div>
    );
};

const JobInfo: React.FC<any> = ({ title, category, customer, location, date }) => (
    <div>
        <span className="text-xs text-white bg-blue-500 font-semibold px-2 py-1 rounded-full">{category}</span>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">{title}</h2>
        <div className="mt-3 space-y-2 text-gray-600">
            <IconInfoRow icon={UserIcon} text={customer} />
            <IconInfoRow icon={MapPinIcon} text={location} />
            <IconInfoRow icon={CalendarIcon} text={date} />
        </div>
    </div>
);

const AdminActions: React.FC<any> = ({ isFeatured, onFeature, onDelete }) => (
    <ProfileSection title="Yönetici Eylemleri">
        <div className="flex flex-wrap gap-2">
            <ActionButton 
                onClick={onFeature}
                text={isFeatured ? 'Öne Çıkanı Kaldır' : 'Öne Çıkar'}
                icon={StarIcon}
                color={isFeatured ? 'gray' : 'yellow'}
            />
            <ActionButton 
                onClick={onDelete}
                text="İlanı Sil"
                icon={TrashIcon}
                color="red"
            />
        </div>
    </ProfileSection>
);

const BidsSection: React.FC<{ bids: Bid[] }> = ({ bids }) => (
    <ProfileSection title="Gelen Teklifler">
        {bids.length > 0 ? (
            <div className="space-y-3">
                {bids.map(bid => <BidItem key={bid.id} bid={bid} />)}
            </div>
        ) : (
            <p className="text-gray-500 text-sm text-center py-4">Bu ilana henüz teklif verilmemiş.</p>
        )}
    </ProfileSection>
);

const BidItem: React.FC<{ bid: Bid }> = ({ bid }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
        <div className="flex items-center gap-3">
            {bid.provider_logo_url ? (
                <img src={bid.provider_logo_url} alt={`${bid.provider_name} logosu`} className="h-10 w-10 rounded-full object-cover border" />
            ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <BuildingOffice2Icon className="h-6 w-6" />
                </div>
            )}
            <div>
                <p className="font-semibold text-gray-800 text-sm">{bid.provider_name}</p>
                <p className="text-xs text-gray-500">{new Date(bid.created_at).toLocaleString('tr-TR')}</p>
            </div>
        </div>
        <div className="text-right">
             <p className={`font-bold text-sm text-blue-600`}>
                {bid.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </p>
            <p className={`text-xs font-semibold capitalize ${bid.status === 'accepted' ? 'text-green-600' : bid.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                {bid.status}
            </p>
        </div>
    </div>
);

const ActionButton: React.FC<{text: string, icon: React.FC<any>, color: 'yellow' | 'red' | 'gray' | 'green', onClick: () => void}> = ({ text, icon: Icon, color, onClick }) => {
    const colors = {
        yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        red: 'bg-red-100 text-red-800 hover:bg-red-200',
        gray: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        green: 'bg-green-100 text-green-800 hover:bg-green-200'
    };
    return (
        <button onClick={onClick} className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${colors[color]}`}>
            <Icon className="h-4 w-4" />
            <span>{text}</span>
        </button>
    );
};

export default AdminJobDetail;