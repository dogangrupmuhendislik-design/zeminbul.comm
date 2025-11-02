import * as React from 'react';
import { View } from '../types';
import { CurrencyDollarIcon, CheckBadgeIcon, LoaderIcon, XCircleIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { supabase } from '../utils/supabaseClient';

interface AddFundsScreenProps {
    onBack: () => void;
    onNavigate: (view: View) => void;
}

const fundPackages = [
    { amount: 50, popular: false },
    { amount: 100, popular: true },
    { amount: 250, popular: false },
    { amount: 500, popular: false },
];

const AddFundsScreen: React.FC<AddFundsScreenProps> = ({ onBack, onNavigate }) => {
    const [currentBalance, setCurrentBalance] = React.useState<number | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [processingPurchase, setProcessingPurchase] = React.useState<number | null>(null);
    const [purchaseError, setPurchaseError] = React.useState<string | null>(null);


    const fetchBalance = React.useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('balance')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error("Error fetching balance:", error);
            } else {
                setCurrentBalance(data.balance);
            }
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const handlePurchase = async (amount: number) => {
        setProcessingPurchase(amount);
        setPurchaseError(null);

        try {
            // In a real app, this would redirect to a payment provider.
            // Here, we simulate by calling a Supabase Edge Function.
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Kullanıcı bulunamadı.");

            const { error } = await supabase.functions.invoke('add-funds', {
                body: { amount },
            });

            if (error) throw error;

            setProcessingPurchase(null);
            onNavigate('paymentSuccess');

        } catch (error) {
            console.error("Purchase failed:", error);
            setPurchaseError((error as Error).message || "Bakiye yüklenemedi. Lütfen tekrar deneyin.");
            setProcessingPurchase(null);
        }
    };
    
    if (loading) {
         return (
             <div className="flex justify-center items-center h-screen bg-gray-100">
                <DrillingRigLoader />
             </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="p-4 border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center">
                <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-center text-gray-900 flex-grow">Bakiye Yükle</h1>
                <div className="w-10"></div>
            </header>
            <main className="p-4 space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Mevcut Bakiyeniz</p>
                    <p className="text-4xl font-extrabold text-gray-900 mt-2">
                        {currentBalance !== null ? currentBalance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : '...'}
                    </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 text-center mb-6">Paket Seçin</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {fundPackages.map((pkg) => (
                            <div 
                                key={pkg.amount} 
                                className={`relative border-2 rounded-xl p-4 text-center cursor-pointer transition-all ${processingPurchase !== null && processingPurchase !== pkg.amount ? 'opacity-50' : ''} ${pkg.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                            >
                                {pkg.popular && <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Popüler</div>}
                                <p className="text-4xl font-extrabold text-gray-900">₺{pkg.amount}</p>
                                <button 
                                    onClick={() => handlePurchase(pkg.amount)}
                                    disabled={processingPurchase !== null}
                                    className="mt-4 w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-2.5 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                >
                                    {processingPurchase === pkg.amount ? <LoaderIcon className="h-5 w-5 animate-spin" /> : <CurrencyDollarIcon className="h-5 w-5" />}
                                    <span>{processingPurchase === pkg.amount ? 'İşleniyor' : 'Satın Al'}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    {purchaseError && (
                        <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p className="font-bold">Hata</p>
                            <p>{purchaseError}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AddFundsScreen;