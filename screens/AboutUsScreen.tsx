import * as React from 'react';
import { ScreenHeader } from '../components/shared/common';
import { Cog6ToothIcon, BriefcaseIcon, StarIcon, ChatBubbleBottomCenterTextIcon, ShieldCheckIcon, GlobeAltIcon, MagnifyingGlassIcon, LightningBoltIcon, UsersIcon } from '../components/icons';

interface AboutUsScreenProps {
    onBack: () => void;
}

// Custom hook for scroll animations
const useScrollAnimation = () => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, []);

    return { ref, isVisible };
};

const AnimatedSection: React.FC<{ children: React.ReactNode, className?: string, delay?: number }> = ({ children, className = '', delay = 0 }) => {
    const { ref, isVisible } = useScrollAnimation();
    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-1000 ease-out transform ${className} ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
            {children}
        </div>
    );
};

const AboutUsScreen: React.FC<AboutUsScreenProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
            <ScreenHeader onBack={onBack} title="Hakkımızda" />

            {/* Hero Section */}
            <div className="relative bg-gray-900 overflow-hidden h-80 flex items-center justify-center">
                <img 
                    src="https://images.pexels.com/photos/544971/pexels-photo-544971.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="Construction" 
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
                <div className="relative z-10 text-center px-4 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                        ZeminBul<span className="text-blue-500">.com</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                        Geoteknik mühendisliğinde güvenilir çözüm ortağınız.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 space-y-20">
                {/* Mission Section */}
                <AnimatedSection>
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Misyonumuz</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                İnşaat proje sahiplerini, güvenilir ve yetkin geoteknik mühendisliği firmalarıyla şeffaf ve verimli bir pazar yerinde buluşturarak, adil rekabeti teşvik etmek ve kaliteli işlerin yapılmasını sağlamak. Teknolojiyi kullanarak sektördeki standartları yükseltmeyi hedefliyoruz.
                            </p>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="relative w-64 h-64 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse-slow">
                                <GlobeAltIcon className="w-32 h-32 text-white" />
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Why Us Grid */}
                <AnimatedSection>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Neden ZeminBul?</h2>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Sektörün ihtiyaçlarına özel çözümler</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard 
                            icon={MagnifyingGlassIcon} 
                            title="Şeffaflık" 
                            desc="Gerçek yorumlar ve detaylı profillerle bilinçli kararlar verin." 
                            delay={0}
                        />
                        <FeatureCard 
                            icon={ShieldCheckIcon} 
                            title="Güven" 
                            desc="Onaylanmış belgeler ve referanslarla güvenilir iş ortakları." 
                            delay={100}
                        />
                        <FeatureCard 
                            icon={LightningBoltIcon} 
                            title="Hız" 
                            desc="Dakikalar içinde teklif toplayın, zamandan tasarruf edin." 
                            delay={200}
                        />
                        <FeatureCard 
                            icon={UsersIcon} 
                            title="Adil Rekabet" 
                            desc="Her ölçekteki firma için eşit görünürlük ve fırsat." 
                            delay={300}
                        />
                    </div>
                </AnimatedSection>

                {/* Platform Features */}
                <AnimatedSection>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 md:p-12">
                         <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Platform Özellikleri</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                             <div className="space-y-6">
                                <DetailItem 
                                    icon={Cog6ToothIcon}
                                    title="Makine Parkuru Takibi"
                                    desc="Firmaların ekipman kapasitesini ve teknik özelliklerini görüntüleyin."
                                />
                                <DetailItem 
                                    icon={BriefcaseIcon}
                                    title="Portfolyo Gösterimi"
                                    desc="Tamamlanan projeleri ve saha fotoğraflarını inceleyin."
                                />
                             </div>
                             <div className="space-y-6">
                                <DetailItem 
                                    icon={StarIcon}
                                    title="Gelişmiş Puanlama"
                                    desc="İş kalitesi, zamanlama ve iletişim kriterlerine göre değerlendirme."
                                />
                                <DetailItem 
                                    icon={ChatBubbleBottomCenterTextIcon}
                                    title="Gerçek Yorumlar"
                                    desc="Sadece hizmet almış kullanıcıların yapabildiği doğrulanmış yorumlar."
                                />
                             </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Call to Action */}
                <AnimatedSection>
                    <div className="text-center py-12 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-4">Bizimle Çalışmaya Hazır mısınız?</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Hemen ücretsiz üye olun ve projelerinizi hayata geçirin.</p>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105">
                            Bize Katılın
                        </button>
                    </div>
                </AnimatedSection>
            </main>
            
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 1s ease-out forwards;
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.FC<any>, title: string, desc: string, delay: number }> = ({ icon: Icon, title, desc, delay }) => (
    <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const DetailItem: React.FC<{ icon: React.FC<any>, title: string, desc: string }> = ({ icon: Icon, title, desc }) => (
    <div className="flex items-start p-4 rounded-xl hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors">
        <div className="flex-shrink-0 mr-4">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                <Icon className="w-5 h-5" />
            </div>
        </div>
        <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{desc}</p>
        </div>
    </div>
);

export default AboutUsScreen;