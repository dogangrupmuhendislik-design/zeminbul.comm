import * as React from 'react';
import { CheckBadgeIcon } from '../components/icons';
import { View } from '../types';

interface PaymentSuccessScreenProps {
    onNavigate: (view: View) => void;
}

const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({ onNavigate }) => {
    React.useEffect(() => {
        // Redirect to profile after a few seconds to allow user to see the message
        const timer = setTimeout(() => {
            onNavigate('profile');
        }, 3000);

        return () => clearTimeout(timer);
    }, [onNavigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-green-800 p-4 text-center">
            <style>{`
                @keyframes bounce-in {
                    0% { transform: scale(0.5); opacity: 0; }
                    80% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-bounce-in {
                    animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
            <div className="animate-bounce-in">
                <CheckBadgeIcon className="h-24 w-24 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mt-6">Ödeme Başarılı!</h1>
            <p className="mt-2 text-lg">Bakiyeniz güncellendi. Profilinize yönlendiriliyorsunuz...</p>
        </div>
    );
};

export default PaymentSuccessScreen;