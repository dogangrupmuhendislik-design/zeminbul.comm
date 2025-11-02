import * as React from 'react';
import { XCircleIcon } from '../components/icons';
import { View } from '../types';

interface PaymentCancelScreenProps {
    onNavigate: (view: View) => void;
}

const PaymentCancelScreen: React.FC<PaymentCancelScreenProps> = ({ onNavigate }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-800 p-4 text-center">
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
            <div className="animate-fade-in">
                <XCircleIcon className="h-24 w-24 text-red-500" />
                <h1 className="text-3xl font-bold mt-6">Ödeme İptal Edildi</h1>
                <p className="mt-2 text-lg">Bakiye yükleme işlemini tamamlamadınız.</p>
                <button
                    onClick={() => onNavigate('addFunds')}
                    className="mt-8 bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                >
                    Tekrar Dene
                </button>
            </div>
        </div>
    );
};

export default PaymentCancelScreen;