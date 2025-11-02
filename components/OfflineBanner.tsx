import * as React from 'react';
import { WifiOffIcon } from './icons';

const OfflineBanner: React.FC = () => {
    const [isOnline, setIsOnline] = React.useState(() => navigator.onLine);

    React.useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center z-[9999] text-white p-8 text-center"
            role="alert"
            aria-live="assertive"
        >
            <WifiOffIcon className="h-24 w-24 text-red-500 mb-6 animate-pulse" />
            <h1 className="text-3xl font-bold mb-2">İnternet Bağlantısı Yok</h1>
            <p className="text-lg text-gray-300 max-w-md">
                Bu uygulama çevrimiçi çalışmaktadır. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.
            </p>
        </div>
    );
};

export default OfflineBanner;