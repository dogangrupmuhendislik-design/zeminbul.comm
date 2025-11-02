import * as React from 'react';
import { ScreenHeader } from '../components/shared/common';
import { ShieldCheckIcon } from '../components/icons';

interface PrivacyPolicyScreenProps {
    onBack: () => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <ScreenHeader onBack={onBack} title="Gizlilik Politikası" />
            
            <main className="max-w-4xl mx-auto p-6 lg:p-10">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
                    
                    {/* Header Image/Icon */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-10 text-center">
                        <ShieldCheckIcon className="w-20 h-20 text-white mx-auto opacity-90 mb-4" />
                        <h1 className="text-3xl font-bold text-white">Gizlilik Politikası</h1>
                        <p className="text-blue-100 mt-2">Verilerinizin güvenliği bizim için en önemli önceliktir.</p>
                    </div>

                    <div className="p-8 lg:p-12 space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
                        <Section number="1" title="Giriş">
                            ZeminBul.com olarak, kullanıcılarımızın gizliliğine büyük önem veriyoruz. Bu gizlilik politikası, platformumuzu kullandığınızda hangi kişisel verileri topladığımızı, bu verileri nasıl kullandığımızı ve haklarınızın neler olduğunu açık ve şeffaf bir şekilde açıklamaktadır.
                        </Section>

                        <Section number="2" title="Topladığımız Veriler">
                            <ul className="list-disc pl-5 space-y-2 mt-2">
                                <li><strong>Hesap Bilgileri:</strong> Kayıt sırasında adınız, e-posta adresiniz, telefon numaranız ve firma bilgileriniz.</li>
                                <li><strong>İlan Bilgileri:</strong> Yayınladığınız iş ilanlarının detayları, proje açıklamaları ve konum verileri.</li>
                                <li><strong>Kullanım Verileri:</strong> Platformu nasıl kullandığınıza dair anonimleştirilmiş istatistiksel veriler (ziyaret edilen sayfalar, oturum süreleri vb.).</li>
                            </ul>
                        </Section>
                        
                        <Section number="3" title="Verilerin Kullanımı">
                            Topladığımız veriler; hizmetlerimizi sunmak, sizinle iletişim kurmak, platformu kişiselleştirmek, güvenliği sağlamak ve yasal yükümlülüklerimizi yerine getirmek amacıyla kullanılır. Verileriniz, yasal zorunluluklar dışında izniniz olmadan üçüncü partilerle pazarlama amacıyla asla paylaşılmaz.
                        </Section>

                        <Section number="4" title="Çerezler (Cookies)">
                             Kullanıcı deneyimini geliştirmek için çerezler kullanıyoruz. Çerez tercihlerinizi tarayıcı ayarlarınızdan istediğiniz zaman değiştirebilirsiniz.
                        </Section>

                        <Section number="5" title="Haklarınız">
                            Kişisel verilerinize erişme, düzeltme talep etme, silme (unutulma hakkı) veya işlenmesini kısıtlama hakkına sahipsiniz. Bu haklarınızı kullanmak için <a href="#" className="text-blue-600 hover:underline">destek@zeminbul.com</a> adresi üzerinden bizimle iletişime geçebilirsiniz.
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
            <span className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm mr-3">
                {number}
            </span>
            {title}
        </h2>
        <div className="pl-11">
            {children}
        </div>
    </div>
);

export default PrivacyPolicyScreen;