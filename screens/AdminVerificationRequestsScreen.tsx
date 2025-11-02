import * as React from 'react';
import { View, Profile } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { CheckBadgeIcon, XCircleIcon, UserCheckIcon, UserIcon, BriefcaseIcon } from '../components/icons';

interface AdminVerificationRequestsScreenProps {
    onNavigate: (view: View, id?: string) => void;
}

const AdminVerificationRequestsScreen: React.FC<AdminVerificationRequestsScreenProps> = ({ onNavigate }) => {
    const [pendingProfiles, setPendingProfiles] = React.useState<Profile[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchPendingProfiles = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('verification_status', 'pending')
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error("Error fetching pending verification requests:", error.message || error);
        } else {
            setPendingProfiles(data as Profile[]);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchPendingProfiles();
    }, [fetchPendingProfiles]);

    const handleApprove = async (profileId: string) => {
        const profile = pendingProfiles.find(p => p.id === profileId);
        if (!profile || !profile.pending_verification_data) return;

        setPendingProfiles(current => current.filter(p => p.id !== profileId));

        const { error } = await supabase
            .from('profiles')
            .update({ 
                company_name: profile.pending_verification_data.company_name,
                tax_id: profile.pending_verification_data.tax_id,
                is_verified: true,
                verification_status: 'verified',
                pending_verification_data: null,
            })
            .eq('id', profileId);

        if (error) {
            console.error("Error approving verification request:", error);
            fetchPendingProfiles(); // Revert on error
        }
    };
    
    const handleReject = async (profileId: string) => {
        if (window.confirm("Bu doğrulama talebini reddetmek istediğinizden emin misiniz?")) {
            setPendingProfiles(current => current.filter(p => p.id !== profileId));
            const { error } = await supabase
                .from('profiles')
                .update({ verification_status: 'rejected', pending_verification_data: null })
                .eq('id', profileId);
            if (error) {
                console.error("Error rejecting verification request:", error);
                fetchPendingProfiles(); // Revert on error
            }
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Doğrulama Talepleri ({pendingProfiles.length})</h2>
            {loading ? <DrillingRigLoader /> : (
                <div className="space-y-4">
                    {pendingProfiles.length > 0 ? (
                        pendingProfiles.map(profile => (
                            <VerificationRequestCard 
                                key={profile.id} 
                                profile={profile}
                                onApprove={() => handleApprove(profile.id)}
                                onReject={() => handleReject(profile.id)}
                                onNavigate={onNavigate}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-md">
                            <UserCheckIcon className="h-16 w-16 mx-auto text-green-400" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">Onay Kuyruğu Temiz!</h3>
                            <p className="mt-2 text-gray-500">Onay bekleyen yeni bir doğrulama talebi bulunmuyor.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const VerificationRequestCard: React.FC<{ profile: Profile, onApprove: () => void, onReject: () => void, onNavigate: (view: View, id: string) => void }> = ({ profile, onApprove, onReject, onNavigate }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200/80">
             <div className="flex items-center cursor-pointer" onClick={() => onNavigate('adminUserDetail', profile.id)}>
                <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center mr-4 ${profile.role === 'customer' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    {profile.role === 'customer' ? <UserIcon className="h-6 w-6"/> : <BriefcaseIcon className="h-6 w-6"/>}
                </div>
                <div>
                    <p className="font-bold text-gray-800 hover:underline">{profile.name || profile.company_name}</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <h4 className="font-semibold text-gray-600">Gönderilen Bilgiler:</h4>
                <div className="text-sm bg-gray-50 p-3 rounded-md">
                    <p><strong className="text-gray-500">Firma Adı:</strong> {profile.pending_verification_data?.company_name}</p>
                    <p><strong className="text-gray-500">Vergi No / TC:</strong> {profile.pending_verification_data?.tax_id}</p>
                </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
                 <button onClick={onReject} className="flex items-center gap-1.5 text-sm font-semibold bg-red-100 text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
                    <XCircleIcon className="h-4 w-4" /> Reddet
                </button>
                <button onClick={onApprove} className="flex items-center gap-1.5 text-sm font-semibold bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
                    <CheckBadgeIcon className="h-4 w-4" /> Onayla
                </button>
            </div>
        </div>
    );
};


export default AdminVerificationRequestsScreen;