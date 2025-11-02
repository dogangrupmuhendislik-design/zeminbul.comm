import * as React from 'react';
import { UserRole, View, Profile } from '../types';
import { UserIcon, BriefcaseIcon, CheckBadgeIcon, XCircleIcon } from '../components/icons';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';

interface AdminUsersProps {
    onNavigate: (view: View, id: string) => void;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ onNavigate }) => {
    const [users, setUsers] = React.useState<Profile[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<'all' | 'customer' | 'provider'>('all');

    const fetchUsers = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) {
            console.error("Error fetching users:", error);
        } else {
            setUsers(data as Profile[]);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleVerificationToggle = async (userId: string, newStatus: boolean) => {
        // Optimistic update
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user.id === userId ? { ...user, is_verified: newStatus } : user
            )
        );
        
        const { error } = await supabase
            .from('profiles')
            .update({ is_verified: newStatus })
            .eq('id', userId);

        if (error) {
            console.error(`Error updating verification for user ${userId}:`, error);
            // Revert on error
            fetchUsers();
        }
    };

    const filteredUsers = React.useMemo(() => {
        if (filter === 'all') return users;
        return users.filter(user => user.role === filter);
    }, [users, filter]);

    if (loading) {
        return <DrillingRigLoader />;
    }

    return (
        <div className="space-y-6">
            <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-md">
                <FilterButton text="Tümü" active={filter === 'all'} onClick={() => setFilter('all')} />
                <FilterButton text="Müşteriler" active={filter === 'customer'} onClick={() => setFilter('customer')} />
                <FilterButton text="Firmalar" active={filter === 'provider'} onClick={() => setFilter('provider')} />
            </div>
            <div className="space-y-4">
                {filteredUsers.map(user => (
                    <div 
                        key={user.id} 
                        onClick={() => onNavigate('adminUserDetail', user.id)}
                        className={`bg-white p-4 rounded-xl shadow-md border-l-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 ${user.is_verified ? 'border-green-500' : 'border-yellow-500'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center mr-4 ${user.role === 'customer' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {user.role === 'customer' ? <UserIcon className="h-7 w-7"/> : <BriefcaseIcon className="h-7 w-7"/>}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">{user.name || user.company_name}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${user.role === 'customer' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                {user.role === 'customer' ? 'Müşteri' : 'Firma'}
                            </span>
                        </div>
                         {user.role === 'provider' && (
                            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                                {!user.is_verified ? (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleVerificationToggle(user.id, true); }}
                                        className="flex items-center gap-1.5 text-sm font-semibold bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors"
                                    >
                                        <CheckBadgeIcon className="h-4 w-4" />
                                        Doğrula
                                    </button>
                                ) : (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleVerificationToggle(user.id, false); }}
                                        className="flex items-center gap-1.5 text-sm font-semibold bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        <XCircleIcon className="h-4 w-4" />
                                        Doğrulamayı Kaldır
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const FilterButton: React.FC<{ text: string; active: boolean; onClick: () => void; }> = ({ text, active, onClick }) => (
    <button onClick={onClick} className={`flex-1 text-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
        {text}
    </button>
);

export default AdminUsers;