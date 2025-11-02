
import * as React from 'react';
import { View, Profile } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { CheckBadgeIcon, XCircleIcon, UserCheckIcon } from '../components/icons';

interface AdminPendingProfilesProps {
    onNavigate: (view: View, id?: string) => void;
}

const AdminPendingProfiles: React.FC<AdminPendingProfilesProps> = ({ onNavigate }) => {
    const [pendingProfiles, setPendingProfiles] = React.useState<Profile[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchPendingProfiles = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('profile_status', 'pending_review')
            .order('created_at', { ascending: true });
        
        if (error) {
            console.error("Error fetching pending profiles:", error.message || error);
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
        if (!profile || !profile.pending_data) return;

        setPendingProfiles(current => current.filter(p => p.id !== profileId));
        const { error } = await supabase
            .from('profiles')
            .update({ 
                ...profile.pending_data, 
                pending_data: null, 
                profile_status: 'approved' 
            })
            .eq('id', profileId);
        if (error) {
            console.error("Error approving profile:", error.message || error);
            fetchPendingProfiles(); // Revert on error
        }
    };

    const handleReject = async (profileId: string) => {
        if (window.confirm("Bu profil değişikliklerini reddetmek istediğinizden emin misiniz? Değişiklikler silinecektir.")) {
            setPendingProfiles(current => current.filter(p => p.id !== profileId));
            const { error } = await supabase
                .from('profiles')
                .update({ pending_data: null, profile_status: 'approved' })
                .eq('id', profileId);
            if (error) {
                console.error("Error rejecting profile changes:", error.message || error);
                fetchPendingProfiles(); // Revert
            }
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Onay Bekleyen Profil Güncellemeleri ({pendingProfiles.length})</h2>
            {loading ? <DrillingRigLoader /> : (
                <div className="space-y-4">
                    {pendingProfiles.length > 0 ? (
                        pendingProfiles.map(profile => (
                            <ProfileApprovalCard 
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
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">Her Şey Güncel!</h3>
                            <p className="mt-2 text-gray-500">Onay bekleyen yeni bir profil güncellemesi bulunmuyor.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ProfileApprovalCard: React.FC<{ profile: Profile, onApprove: () => void, onReject: () => void, onNavigate: (view: View, id: string) => void }> = ({ profile, onApprove, onReject, onNavigate }) => {
    const changes = profile.pending_data ? Object.keys(profile.pending_data) : [];
    
    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200/80">
            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 cursor-pointer hover:underline" onClick={() => onNavigate('adminUserDetail', profile.id)}>
                    {profile.company_name || profile.name}
                </h3>
                <p className="text-sm text-gray-500">Güncelleme bekleyen {changes.length} alan var.</p>
                
                <div className="mt-4 space-y-3">
                    {Object.entries(profile.pending_data || {}).map(([key, newValue]) => (
                        <div key={key} className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-red-50 p-2 rounded-md border border-red-200">
                                <p className="font-semibold text-red-700">Önceki Değer:</p>
                                <p className="text-red-900 line-through truncate">{(profile as any)[key] || 'Boş'}</p>
                            </div>
                            <div className="bg-green-50 p-2 rounded-md border border-green-200">
                                <p className="font-semibold text-green-700">Yeni Değer:</p>
                                <p className="text-green-900 truncate">{newValue || 'Boş'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="bg-gray-50/70 p-3 flex justify-end gap-3 rounded-b-xl">
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

export default AdminPendingProfiles;
