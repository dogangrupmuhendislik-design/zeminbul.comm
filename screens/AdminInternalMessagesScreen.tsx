import * as React from 'react';
import { View, Profile } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { UserIcon, Cog6ToothIcon } from '../components/icons';

interface AdminInternalMessagesScreenProps {
    onNavigate: (view: View, id?: string) => void;
}

const AdminInternalMessagesScreen: React.FC<AdminInternalMessagesScreenProps> = ({ onNavigate }) => {
    const [admins, setAdmins] = React.useState<Profile[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchAdmins = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'admin');

            if (error) {
                console.error("Error fetching admins:", error);
            } else {
                // Exclude the current user from the list
                setAdmins(data.filter(admin => admin.id !== user?.id));
            }
            setLoading(false);
        };
        fetchAdmins();
    }, []);

    if (loading) {
        return <DrillingRigLoader />;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Admin Mesajları</h2>
            
            {admins.length > 0 ? (
                <div className="bg-white p-4 rounded-xl shadow-md divide-y divide-gray-200">
                    {admins.map(admin => (
                        <div 
                            key={admin.id}
                            onClick={() => onNavigate('adminChat', admin.id)}
                            className="flex items-center p-3 cursor-pointer hover:bg-gray-50 rounded-lg"
                        >
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-4">
                                <Cog6ToothIcon className="h-7 w-7" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{admin.name || 'Admin'}</p>
                                <p className="text-sm text-gray-500">{admin.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <p className="text-gray-600">Sizden başka yönetici bulunmuyor.</p>
                </div>
            )}
        </div>
    );
};

export default AdminInternalMessagesScreen;