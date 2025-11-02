import * as React from 'react';

interface TermsOfUseScreenProps {
    onBack: () => void;
}

const TermsOfUseScreen: React.FC<TermsOfUseScreenProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="p-4 border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center">
                <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-center text-gray-900 flex-grow">Kullanım Koşulları</h1>
                <div className="w-10"></div>
            </header>
            <main className="p-6">
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800">1. Taraflar ve Tanımlar</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Bu Kullanım Koşulları, ZeminBul.com platformunu ("Platform") kullanan tüm bireysel ve kurumsal kullanıcılar ("Kullanıcı") ile platform sahibi arasındaki ilişkiyi düzenler.
                    </p>
                    
                    <h2 className="text-2xl font-bold text-gray-800 pt-4">2. Platformun Amacı</h2>
                    <p className="text-gray-700 leading-relaxed">
                        ZeminBul.com, geoteknik mühendisliği hizmetlerine ihtiyaç duyan müşteriler ile bu hizmetleri sunan profesyonel firmaları bir araya getiren bir pazar yeridir. Platform, taraflar arasında bir anlaşma veya sözleşme tarafı değildir. Sadece aracılık hizmeti sunar.
                    </p>
                    
                    <h2 className="text-2xl font-bold text-gray-800 pt-4">3. Kullanıcı Yükümlülükleri</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Kullanıcılar, platforma sağladıkları tüm bilgilerin (iletişim bilgileri, proje detayları, firma bilgileri vb.) doğru ve güncel olduğunu taahhüt eder. Platformun yasa dışı veya etik olmayan amaçlarla kullanılması kesinlikle yasaktır.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 pt-4">4. Sorumluluğun Sınırlandırılması</h2>
                    <p className="text-gray-700 leading-relaxed">
                        ZeminBul.com, kullanıcılar arasındaki anlaşmazlıklardan, işin kalitesinden, ödemelerin yapılmasından veya herhangi bir zarardan sorumlu tutulamaz. Platform, yalnızca tarafların birbirini bulmasına olanak tanır.
                    </p>
                    
                    <h2 className="text-2xl font-bold text-gray-800 pt-4">5. Değişiklikler</h2>
                    <p className="text-gray-700 leading-relaxed">
                        ZeminBul.com, bu kullanım koşullarını dilediği zaman değiştirme hakkını saklı tutar. Değişiklikler platformda yayınlandığı andan itibaren geçerli olur.
                    </p>
                    
                     <p className="text-gray-500 text-sm pt-6">
                        Son Güncelleme: 24 Temmuz 2024
                    </p>
                </div>
            </main>
        </div>
    );
};

export default TermsOfUseScreen;