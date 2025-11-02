import * as React from 'react';
import { ScreenHeader } from '../components/shared/common';
import { MagnifyingGlassIcon, UserIcon, CurrencyDollarIcon, BriefcaseIcon, ShieldCheckIcon, DocumentCheckIcon, ChevronRightIcon, ChatBubbleBottomCenterTextIcon } from '../components/icons';
import { View } from '../types';

interface HelpCenterScreenProps {
    onBack: () => void;
    onNavigate: (view: View) => void;
}

const HelpCenterScreen: React.FC<HelpCenterScreenProps> = ({ onBack, onNavigate }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    const categories = [
        { id: 'account', title: 'Hesap & Profil', icon: UserIcon, desc: 'Kayıt, giriş ve profil ayarları.' },
        { id: 'payments', title: 'Ödemeler & Bakiye', icon: CurrencyDollarIcon, desc: 'Ödeme yöntemleri ve bakiye yükleme.' },
        { id: 'jobs', title: 'İlanlar & Teklifler', icon: BriefcaseIcon, desc: 'İlan verme ve teklif süreci.' },
        { id: 'security', title: 'Güvenlik & Gizlilik', icon: ShieldCheckIcon, desc: 'Şifre güvenliği ve veri politikası.' },
        { id: 'verification', title: 'Doğrulama', icon: DocumentCheckIcon, desc: 'Firma ve belge doğrulama süreçleri.' },
    ];

    const faqs = [
        { q: "Nasıl ilan veririm?", a: "Anasayfadaki 'İlan Ver' butonuna tıklayıp kategori seçtikten sonra detayları girerek ücretsiz ilan verebilirsiniz." },
        { q: "Firma doğrulaması ne kadar sürer?", a: "Yüklediğiniz belgeler ekibimiz tarafından incelenir. Genellikle 24 saat içinde sonuçlanır." },
        { q: "Teklif vermek ücretli mi?", a: "Evet, teklif vermek için küçük bir hizmet bedeli alınır. Bu bedel bakiyenizden düşülür." },
        { q: "Şifremi unuttum, ne yapmalıyım?", a: "Giriş ekranındaki 'Şifremi Unuttum' bağlantısını kullanarak e-posta adresinize sıfırlama linki gönderebilirsiniz." },
    ];

    const filteredFaqs = faqs.filter(faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
            <ScreenHeader onBack={onBack} title="Yardım Merkezi" />

            {/* Search Hero */}
            <div className="bg-blue-600 dark:bg-gray-800 py-16 px-6 text-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">Size nasıl yardımcı olabiliriz?</h1>
                <div className="max-w-2xl mx-auto relative z-10">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-6 w-6 text-gray-400" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Bir soru veya konu arayın..." 
                            className="w-full py-4 pl-12 pr-4 rounded-full shadow-lg border-none focus:ring-4 focus:ring-blue-400/50 text-gray-900 placeholder-gray-500 transition-all"
                        />
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">
                
                {/* Quick Support Card */}
                 <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-12 flex items-center justify-between animate-fade-in-up">
                    <div className="flex items-center gap-4">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600 dark:text-green-400">
                            <ChatBubbleBottomCenterTextIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Hala yardıma mı ihtiyacınız var?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Destek ekibimizle iletişime geçin.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate('contactUs')}
                        className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-lg font-bold hover:opacity-90 transition-opacity"
                    >
                        Bize Ulaşın
                    </button>
                </div>

                {/* Categories Grid */}
                {!searchQuery && (
                    <>
                    <h2 className="text-2xl font-bold mb-6 ml-2">Konular</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {categories.map((cat, idx) => (
                            <div 
                                key={cat.id} 
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-700 group animate-fade-in-up"
                                style={{ animationDelay: `${idx * 100}ms` }}
                                onClick={() => onNavigate('faq')}
                            >
                                <cat.icon className="w-10 h-10 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
                                <h3 className="font-bold text-lg mb-1">{cat.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{cat.desc}</p>
                            </div>
                        ))}
                    </div>
                    </>
                )}

                {/* FAQ Section */}
                <h2 className="text-2xl font-bold mb-6 ml-2">Sıkça Sorulan Sorular</h2>
                <div className="space-y-4">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((faq, idx) => (
                            <AccordionItem key={idx} question={faq.q} answer={faq.a} />
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-8">Aramanızla eşleşen bir sonuç bulunamadı.</p>
                    )}
                </div>

            </main>

             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

const AccordionItem: React.FC<{ question: string, answer: string }> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
                <span className="font-semibold text-gray-900 dark:text-white">{question}</span>
                <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 pt-0 text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700">
                    {answer}
                </div>
            </div>
        </div>
    );
};

export default HelpCenterScreen;