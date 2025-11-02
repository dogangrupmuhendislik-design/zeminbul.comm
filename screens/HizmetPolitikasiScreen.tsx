import * as React from 'react';
import { ScreenHeader } from '../components/shared/common';
import { DocumentCheckIcon } from '../components/icons';

interface HizmetPolitikasiScreenProps {
    onBack: () => void;
}

const HizmetPolitikasiScreen: React.FC<HizmetPolitikasiScreenProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <ScreenHeader onBack={onBack} title="Hizmet Politikası" />
            
            <main className="max-w-4xl mx-auto p-6 lg:p-10">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
                    
                    {/* Header Image/Icon */}
                    <div className="bg-gradient-to-r from-green-600 to-green-800 p-10 text-center">
                        <DocumentCheckIcon className="w-20 h-20 text-white mx-auto opacity-90 mb-4" />
                        <h1 className="text-3xl font-bold text-white">Hizmet Politikası</h1>
                        <p className="text-green-100 mt-2">Adil, şeffaf ve güvenilir bir platform için kurallarımız.</p>
                    </div>

                    <div className="p-8 lg:p-12 space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
                        <Section number="1" title="Hizmetin Kapsamı">
                            ZeminBul.com, geoteknik mühendisliği alanında hizmet arayan "Müşteri"ler ile bu hizmetleri sunan "Firma"ları bir araya getiren bir teknoloji platformudur. Platform, taraflar arasında bir iş ilişkisi kurulmasına aracılık eder ancak bu ilişkinin doğrudan bir tarafı, yüklenicisi veya işvereni değildir.
                        </Section>

                        <Section number="2" title="Müşteri Sorumlulukları">
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Oluşturulan iş ilanlarında doğru, eksiksiz ve yanıltıcı olmayan bilgiler vermek.</li>
                                <li>Teklifleri değerlendirirken firmaların profillerini ve yetkinliklerini incelemek.</li>
                                <li>Anlaşılan firmalarla yapılacak sözleşmelerden ve ödeme yükümlülüklerinden bireysel olarak sorumlu olmak.</li>
                            </ul>
                        </Section>
                        
                        <Section number="3" title="Firma Sorumlulukları">
                             <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li>Profil bilgilerinde ve verilen tekliflerde doğru ve profesyonel bilgiler sunmak.</li>
                                <li>Teklif verilen işin gerektirdiği yasal yetkinliklere, lisanslara ve sigortalara sahip olmak.</li>
                                <li>Kabul edilen işleri, kalite standartlarına ve zaman çerçevesine uygun tamamlamak.</li>
                            </ul>
                        </Section>

                        <Section number="4" title="Yasaklanmış Faaliyetler">
                            Platformda spam içerik oluşturmak, yanlış bilgi vermek, diğer kullanıcıları taciz etmek, sistemi manipüle etmeye çalışmak ve yasa dışı faaliyetlerde bulunmak kesinlikle yasaktır. İhlal durumunda hesaplar askıya alınabilir.
                        </Section>
                        
                         <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500">
                            Son Güncelleme: 24 Temmuz 2024
                        </div>
                    </div>
                </div>
            </main>
             <style>{`
                 @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

const Section: React.FC<{number: string, title: string, children: React.ReactNode}> = ({ number, title, children }) => (
    <div>
        <h2 className="flex items-center text-xl font-bold text-gray-900 dark:text-white mb-3">
            <span className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm mr-3">
                {number}
            </span>
            {title}
        </h2>
        <div className="pl-11">
            {children}
        </div>
    </div>
);

export default HizmetPolitikasiScreen;