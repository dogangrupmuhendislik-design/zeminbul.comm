import * as React from 'react';
import { View } from '../types';
import { CheckBadgeIcon, StarIcon, LoaderIcon } from '../components/icons';

interface ProPlanScreenProps {
    onBack: () => void;
    onNavigate: (view: View) => void;
}

const ProPlanScreen: React.FC<ProPlanScreenProps> = ({ onBack, onNavigate }) => {
    const [loadingPlan, setLoadingPlan] = React.useState<'monthly' | 'yearly' | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    const handleSelectPlan = (plan: 'monthly' | 'yearly') => {
        setLoadingPlan(plan);
        setError(null);

        console.log(`DEV MODE: Simulating subscription to ${plan} plan.`);
        // Simulate API call and success since payment system is removed
        setTimeout(() => {
            setLoadingPlan(null);
            onNavigate('paymentSuccess');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header onBack={onBack} />
            <main className="p-6">
                <div className="text-center max-w-2xl mx-auto">
                    <StarIcon className="h-16 w-16 mx-auto text-yellow-400" />
                    <h1 className="text-3xl font-extrabold text-gray-900 mt-4">ZeminBul Pro'ya Yükseltin</h1>
                    <p className="mt-3 text-lg text-gray-600">
                        Sınırsız ilan yayınlayarak ve teklif veren firmaların profillerini inceleyerek projelerinizde tam potansiyelinizi ortaya çıkarın.
                    </p>
                </div>

                 {error && (
                    <div className="mt-6 max-w-md mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                        <p className="font-bold">Hata</p>
                        <p>{error}</p>
                    </div>
                )}

                <div className="mt-10 max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                    <PlanCard
                        title="Aylık Plan"
                        price="199"
                        period="/ay"
                        features={[
                            'Sınırsız İş İlanı Verme',
                            'Teklif Veren Firma Profillerini Görüntüleme',
                            'Öncelikli Müşteri Desteği',
                            'İlanlar için "Acil" Rozeti',
                        ]}
                        onSelect={() => handleSelectPlan('monthly')}
                        isLoading={loadingPlan === 'monthly'}
                        isPopular={false}
                    />
                    <PlanCard
                        title="Yıllık Plan"
                        price="1.899"
                        period="/yıl"
                        features={[
                            'Sınırsız İş İlanı Verme',
                            'Teklif Veren Firma Profillerini Görüntüleme',
                            'Öncelikli Müşteri Desteği',
                            'İlanlar için "Acil" Rozeti',
                        ]}
                        onSelect={() => handleSelectPlan('yearly')}
                        isLoading={loadingPlan === 'yearly'}
                        isPopular={true}
                        badgeText="2 Ay Tasarruf Edin"
                    />
                </div>
            </main>
        </div>
    );
};

const Header: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <header className="p-4 border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center">
        <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-xl font-bold text-center text-gray-900 flex-grow">Pro Üyelik</h1>
        <div className="w-10"></div>
    </header>
);

interface PlanCardProps {
    title: string;
    price: string;
    period: string;
    features: string[];
    onSelect: () => void;
    isLoading: boolean;
    isPopular: boolean;
    badgeText?: string;
}

const PlanCard: React.FC<PlanCardProps> = ({ title, price, period, features, onSelect, isLoading, isPopular, badgeText }) => (
    <div className={`bg-white rounded-2xl p-8 shadow-lg border-2 ${isPopular ? 'border-blue-500' : 'border-transparent'}`}>
        {isPopular && (
            <div className="text-center mb-6">
                <span className="bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">{badgeText || 'En Popüler'}</span>
            </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900 text-center">{title}</h2>
        <div className="mt-4 text-center">
            <span className="text-5xl font-extrabold text-gray-900">₺{price}</span>
            <span className="text-lg font-medium text-gray-500">{period}</span>
        </div>
        <ul className="mt-8 space-y-4">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <CheckBadgeIcon className="h-6 w-6 text-green-500 flex-shrink-0 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                </li>
            ))}
        </ul>
        <button
            onClick={onSelect}
            disabled={isLoading}
            className={`w-full mt-10 font-bold py-4 px-4 rounded-lg transition-colors text-lg flex items-center justify-center gap-2 disabled:opacity-70 ${isPopular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
        >
            {isLoading ? <><LoaderIcon className="h-6 w-6 animate-spin"/> Yönlendiriliyor...</> : 'Planı Seç'}
        </button>
    </div>
);


export default ProPlanScreen;