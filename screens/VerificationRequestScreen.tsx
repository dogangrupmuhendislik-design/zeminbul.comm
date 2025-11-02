import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import { Profile } from '../types';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { CheckBadgeIcon, ClockIcon, XCircleIcon, LoaderIcon, BriefcaseIcon } from '../components/icons';

interface VerificationRequestScreenProps {
    onBack: () => void;
}

const VerificationRequestScreen: React.FC<VerificationRequestScreenProps> = ({ onBack }) => {
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [companyName, setCompanyName] = React.useState('');
    const [taxId, setTaxId] = React.useState('');

    const fetchProfile = React.useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (error) {
                console.error("Error fetching profile for verification:", error);
            } else {
                setProfile(data);
                setCompanyName(data.company_name || data.name || '');
            }
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName.trim() || !taxId.trim()) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }

        setSaving(true);
        setError(null);
        
        const { error: updateError } = await supabase.from('profiles').update({
            verification_status: 'pending',
            pending_verification_data: {
                company_name: companyName,
                tax_id: taxId,
            },
        }).eq('id', profile!.id);

        if (updateError) {
            setError(updateError.message);
        } else {
            // Re-fetch profile to show updated status
            fetchProfile();
        }
        setSaving(false);
    };

    const renderContent = () => {
        if (loading || !profile) {
            return <DrillingRigLoader />;
        }

        if (profile.is_verified || profile.verification_status === 'verified') {
            return (
                <StatusDisplay
                    icon={CheckBadgeIcon}
                    iconColor="text-green-500"
                    title="Hesabınız Onaylı"
                    message="Bu hesap yönetici tarafından doğrulanmıştır. Platformdaki tüm özelliklere erişebilirsiniz."
                />
            );
        }
        
        if (profile.verification_status === 'pending') {
            return (
                <StatusDisplay
                    icon={ClockIcon}
                    iconColor="text-blue-500"
                    title="Talebiniz İnceleniyor"
                    message="Onay talebiniz ekibimize ulaştı. En kısa sürede incelenip size geri dönüş yapılacaktır."
                />
            );
        }
        
        return (
            <form onSubmit={handleSubmit} className="space-y-6">
                 {profile.verification_status === 'rejected' && (
                    <div className="bg-red-50 p-4 rounded-lg text-red-700 border border-red-200">
                        <p className="font-bold">Talebiniz Reddedildi</p>
                        <p className="text-sm">Gönderdiğiniz bilgiler doğrulanamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.</p>
                    </div>
                 )}
                 {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-md text-center">{error}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Firma Adı / Tüzel Kişi Adı</label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Vergi Numarası / T.C. Kimlik No</label>
                    <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    {saving ? <><LoaderIcon className="h-5 w-5 animate-spin" /> Gönderiliyor...</> : 'Onay Talebi Gönder'}
                </button>
            </form>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="p-4 border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center">
                <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-center text-gray-900 flex-grow">Hesap Onayı</h1>
                <div className="w-10"></div>
            </header>
            <main className="p-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-start text-blue-800 bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                        <BriefcaseIcon className="h-8 w-8 mr-4 flex-shrink-0" />
                        <div>
                            <h2 className="font-bold">Neden hesabımı onaylamalıyım?</h2>
                            <p className="text-sm">Onaylı hesaplar, platformda daha fazla güvenilirlik kazanır. Onaylı bir rozet, potansiyel müşteri veya firmaların sizinle çalışma olasılığını artırır.</p>
                        </div>
                    </div>
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

const StatusDisplay: React.FC<{ icon: React.FC<any>, title: string, message: string, iconColor: string }> = ({ icon: Icon, title, message, iconColor }) => (
    <div className="text-center py-10">
        <Icon className={`h-16 w-16 mx-auto ${iconColor}`} />
        <h2 className="mt-4 text-2xl font-bold text-gray-800">{title}</h2>
        <p className="mt-2 text-gray-600 max-w-sm mx-auto">{message}</p>
    </div>
);

export default VerificationRequestScreen;