import * as React from 'react';
import { Notification, UserRole, View } from '../types';
import { BellIcon, CurrencyDollarIcon, CheckBadgeIcon, XCircleIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { supabase } from '../utils/supabaseClient';

interface NotificationsProps {
    userRole: UserRole;
    onNavigate: (view: View, id?: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ userRole, onNavigate }) => {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchNotifications = React.useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching notifications:", error);
            } else {
                setNotifications(data as Notification[]);
            }
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);


    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <div className="p-4">
                {loading ? (
                    <DrillingRigLoader />
                ) : notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map(notif => (
                            <NotificationItem 
                                key={notif.id} 
                                notification={notif}
                                userRole={userRole}
                                onNavigate={onNavigate} 
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
};

const Header: React.FC = () => (
    <header className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">Bildirimler</h1>
    </header>
);

interface NotificationItemProps {
    notification: Notification;
    userRole: UserRole;
    onNavigate: (view: View, id?: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, userRole, onNavigate }) => {
    const notificationDetails = {
        new_bid: { icon: CurrencyDollarIcon, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/50' },
        bid_accepted: { icon: CheckBadgeIcon, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/50' },
        bid_rejected: { icon: XCircleIcon, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/50' },
        job_updated: { icon: BellIcon, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/50' },
        profile_viewed: { icon: BellIcon, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/50' },
        generic: { icon: BellIcon, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' },
    };

    const { icon: Icon, color, bg } = notificationDetails[notification.type] || notificationDetails.generic;

    const handleClick = () => {
        if (notification.jobId) {
            const targetView = userRole === 'customer' ? 'bids' : 'jobDetail';
            onNavigate(targetView, notification.jobId);
        }
    };
    
    const isClickable = !!notification.jobId;

    return (
        <div 
            onClick={isClickable ? handleClick : undefined}
            className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border-l-4 transition-all ${notification.read ? 'border-transparent' : 'border-blue-500'} ${isClickable ? 'cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
        >
            <div className="flex items-start">
                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div className="ml-4 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{notification.description}</p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{new Date(notification.created_at).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>
        </div>
    );
}

const EmptyState: React.FC = () => (
    <div className="text-center mt-20">
        <BellIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Henüz Bildirim Yok</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Yeni bir gelişme olduğunda sizi burada bilgilendireceğiz.</p>
    </div>
);


export default Notifications;