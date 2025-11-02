import * as React from 'react';
import { View, Profile } from '../types';
import { supabase } from '../utils/supabaseClient';
import { UserIcon, BriefcaseIcon, CheckBadgeIcon, XCircleIcon, DocumentCheckIcon, CalendarIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';

interface AdminVerificationScreenProps {
    onNavigate: (view: View, id: string) => void;
}

const AdminVerificationScreen: React.FC<AdminVerificationScreenProps> = ({ onNavigate }) => {
    const [pendingUsers, setPendingUsers] = React.useState<Profile[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState<'providers' | 'customers'>('providers');

    const fetchPendingUsers = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_verified', false);

        if (error) {
            console.error("Error fetching pending users:", error);
        } else {
            setPendingUsers(data as Profile[]);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

    const handleApprove = async (userId: string) => {
        setPendingUsers(current => current.filter(user => user.id !== userId));
        const { error } = await supabase
            .from('profiles')
            .update({ is_verified: true })
            .eq('id', userId);
        
        if (error) {
            console.error("Error approving user:", error);
            fetchPendingUsers(); // Re-fetch on error to revert UI
        }
    };

    const handleDeny = async (userId: string) => {
        if (window.confirm("Bu kullanıcının doğrulama isteğini reddetmek ve hesabı silmek istediğinizden emin misiniz?")) {
            setPendingUsers(current => current.filter(user => user.id !== userId));
            // In a real app, you'd call a server-side function to delete the auth.user as well.
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);
            
            if (error) {
                console.error("Error denying/deleting user:", error);
                fetchPendingUsers(); // Re-fetch on error
            }
        }
    };
    
    const providers = pendingUsers.filter(u => u.role === 'provider');
    // Customers are typically auto-verified, but this handles cases where they might not be.
    const customers = pendingUsers.filter(u => u.role === 'customer');
    const usersToShow = activeTab === 'providers' ? providers : customers;

    return (
        <div className="space-y-6">
            <div className="bg-white p-2 rounded-xl shadow-md">
                <div className="flex space-x-2">
                    <TabButton 
                        text="Bekleyen Firmalar" 
                        count={providers.length}
                        active={activeTab === 'providers'} 
                        onClick={() => setActiveTab('providers')} 
                    />
                    <TabButton 
                        text="Bekleyen Müşteriler" 
                        count={customers.length}
                        active={activeTab === 'customers'} 
                        onClick={() => setActiveTab('customers')} 
                    />
                </div>
            </div>
            
            {loading ? <DrillingRigLoader /> : (
                <div className="space-y-4">
                    {usersToShow.length > 0 ? (
                        usersToShow.map(user => (
                            <VerificationCard 
                                key={user.id} 
                                user={user} 
                                onApprove={() => handleApprove(user.id)}
                                onDeny={() => handleDeny(user.id)}
                                onNavigate={onNavigate}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-md">
                            <CheckBadgeIcon className="h-16 w-16 mx-auto text-green-400" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">Her Şey Güncel!</h3>
                            <p className="mt-2 text-gray-500">Onay bekleyen yeni bir kullanıcı bulunmuyor.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const TabButton: React.FC<{ text: string; count: number; active: boolean; onClick: () => void; }> = ({ text, count, active, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 text-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
        <span>{text}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-700'}`}>{count}</span>
    </button>
);

interface VerificationCardProps {
    user: Profile & { created_at?: string };
    onApprove: () => void;
    onDeny: () => void;
    onNavigate: (view: View, id: string) => void;
}

const VerificationCard: React.FC<VerificationCardProps> = ({ user, onApprove, onDeny, onNavigate }) => {
    // Supabase provides created_at, not registeredAt
    const registrationDate = user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Bilinmiyor';
    
    return (
         <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200/80">
            <div 
                className="flex items-center cursor-pointer"
                onClick={() => onNavigate('adminUserDetail', user.id)}
            >
                <div className={`h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center mr-4 ${user.role === 'customer' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                    {user.role === 'customer' ? <UserIcon className="h-7 w-7"/> : <BriefcaseIcon className="h-7 w-7"/>}
                </div>
                <div>
                    <p className="font-bold text-gray-800 hover:underline">{user.company_name || user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                        <CalendarIcon className="h-3 w-3 mr-1.5" />
                        <span>Kayıt: {registrationDate}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                {/* Document viewing is a future feature */}
                {/* {user.role === 'provider' && user.documentUrl && ( ... ) } */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onDeny(); }}
                    className="flex items-center gap-1.5 text-sm font-semibold bg-red-100 text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"
                >
                    <XCircleIcon className="h-4 w-4" />
                    Reddet ve Sil
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onApprove(); }}
                    className="flex items-center gap-1.5 text-sm font-semibold bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
                >
                    <CheckBadgeIcon className="h-4 w-4" />
                    Onayla
                </button>
            </div>
        </div>
    );
};


export default AdminVerificationScreen;