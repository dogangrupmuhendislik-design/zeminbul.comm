import * as React from 'react';
import { View, UserRole, Service } from '../types';
import { 
  MagnifyingGlassIcon, 
  MapPinIcon, 
  ArrowRightIcon, 
  StarIcon, 
  CheckBadgeIcon, 
  BriefcaseIcon, 
  UserIcon,
  SunIcon,
  MoonIcon,
  SparklesIcon,
  XCircleIcon,
  PaperAirplaneIcon,
  LoaderIcon
} from '../components/icons';
import { useCategories } from '../contexts/CategoriesContext';
import { continueChatToPost } from '../services/geminiService';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { ICON_MAP } from '../constants';

interface CustomerDashboardProps {
  requireAuth: (callback: () => void) => void;
  onNavigate: (view: View, id?: string | null, data?: any) => void;
  userRole: UserRole | null;
  onAuthRequest: (action: 'login' | 'register' | null, role?: UserRole) => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
  requireAuth, 
  onNavigate, 
  userRole, 
  onAuthRequest,
  theme,
  onThemeChange
}) => {
  const { categories, loading } = useCategories();
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [initialChatQuery, setInitialChatQuery] = React.useState('');

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    setInitialChatQuery(query);
    setIsChatOpen(true);
  };

  const handleCategorySelect = (service: Service) => {
    requireAuth(() => {
      onNavigate('postJob', null, { category_id: service.id });
    });
  };

  if (loading) return <DrillingRigLoader />;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Header 
        userRole={userRole} 
        onAuthRequest={onAuthRequest} 
        onNavigate={onNavigate} 
        theme={theme} 
        onThemeChange={onThemeChange} 
      />
      
      <main className="flex-grow">
        <Hero onSearch={handleSearchSubmit} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SectionHeader title="Popüler Hizmetler" subtitle="En çok tercih edilen zemin ve geoteknik hizmetleri" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mt-8">
            {categories.map((category) => (
              <CategoryCard 
                key={category.id} 
                service={category} 
                onClick={() => handleCategorySelect(category)} 
              />
            ))}
          </div>
        </div>

        <HowItWorksSection />
        
        {/* Provider CTA */}
        {!userRole && (
            <div className="bg-gray-50 dark:bg-gray-800 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-8 md:mb-0 md:mr-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Hizmet Veren misiniz?</h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-xl">
                        ZeminBul.com'a katılın, işinizi büyütün. Binlerce potansiyel müşteriye ulaşın ve teklif vererek yeni işler kazanın.
                    </p>
                </div>
                <button 
                    onClick={() => onAuthRequest('register', 'provider')}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-lg text-lg whitespace-nowrap"
                >
                    Hizmet Veren Ol
                </button>
            </div>
            </div>
        )}
      </main>

      <Footer onNavigate={onNavigate} />
      
      <ChatToPostModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        initialQuery={initialChatQuery}
        onNavigate={onNavigate}
        requireAuth={requireAuth}
      />
    </div>
  );
};

// --- Sub-components ---

const Header: React.FC<{
  userRole: UserRole | null; 
  onAuthRequest: (action: 'login' | 'register' | null, role?: UserRole) => void;
  onNavigate: (view: View) => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}> = ({ userRole, onAuthRequest, onNavigate, theme, onThemeChange }) => (
  <header className="bg-white dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-20">
        <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
          <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            ZeminBul<span className="text-blue-600">.com</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <button onClick={() => onNavigate('hizmetPolitikasi')} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium">Nasıl Çalışır?</button>
          
          {/* Show specific role-based links */}
          {!userRole && (
              <button 
                  onClick={() => onAuthRequest('register', 'provider')}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium"
              >
                  Hizmet Ver
              </button>
          )}

          <div className="flex items-center space-x-4 border-l border-gray-200 dark:border-gray-700 pl-8">
             <button 
                onClick={onThemeChange} 
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle Theme"
            >
                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </button>

            {!userRole ? (
              <>
                <button onClick={() => onAuthRequest('login')} className="text-gray-900 dark:text-gray-100 font-bold hover:text-blue-600 dark:hover:text-blue-400">Giriş Yap</button>
                <button onClick={() => onAuthRequest('register', 'customer')} className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-full font-bold transition-colors shadow-sm">Kayıt Ol</button>
              </>
            ) : (
               <button onClick={() => onNavigate('profile')} className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold hover:text-blue-600 dark:hover:text-blue-400">
                   <UserIcon className="h-5 w-5" />
                   Hesabım
               </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Button Placeholder */}
        <div className="md:hidden flex items-center gap-2">
            <button 
                onClick={onThemeChange} 
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </button>
            <button onClick={() => !userRole ? onAuthRequest('login') : onNavigate('profile')} className="text-gray-600 dark:text-gray-300 p-2">
                <UserIcon className="h-6 w-6" />
            </button>
        </div>
      </div>
    </div>
  </header>
);

const Hero: React.FC<{ onSearch: (q: string) => void }> = ({ onSearch }) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="relative bg-gray-900 overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
          alt="Construction Site" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
          Geoteknik Hizmetleri İçin <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">En İyi Firmaları Bul</span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl">
          Hizmet seç, detayları belirle, onaylı firmalardan dakikalar içinde teklif al.
        </p>
        
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-full p-2 shadow-2xl flex items-center">
            <div className="pl-6 text-gray-400">
                <MagnifyingGlassIcon className="h-6 w-6" />
            </div>
            <form onSubmit={handleSubmit} className="flex-grow">
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ne yaptırmak istiyorsun? (Örn: Zemin Etüdü)" 
                    className="w-full p-4 text-lg text-gray-900 dark:text-gray-100 bg-transparent border-none focus:ring-0 placeholder-gray-400"
                />
            </form>
            <button 
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg transition-transform hover:scale-105 ml-2"
            >
                Bul
            </button>
        </div>
        
        <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-300">
            <span className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">Popüler:</span>
            <button onClick={() => onSearch('Forekazık')} className="hover:text-white hover:underline">Forekazık</button>
            <button onClick={() => onSearch('Zemin Etüdü')} className="hover:text-white hover:underline">Zemin Etüdü</button>
            <button onClick={() => onSearch('Ankraj')} className="hover:text-white hover:underline">Ankraj</button>
        </div>
      </div>
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center mb-12">
    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
    {subtitle && <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>}
  </div>
);

const CategoryCard: React.FC<{ service: Service; onClick: () => void }> = ({ service, onClick }) => {
  const Icon = ICON_MAP[service.icon_name] || BriefcaseIcon;
  return (
    <div 
        onClick={onClick}
        className="group flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
        <Icon className="h-8 w-8 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
      </div>
      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{service.name}</h3>
    </div>
  );
};

const HowItWorksSection: React.FC = () => (
  <div className="bg-gray-50 dark:bg-gray-800 py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader title="Nasıl Çalışır?" subtitle="ZeminBul ile projenizi hayata geçirmek çok kolay" />
      
      <div className="grid md:grid-cols-3 gap-10 mt-12">
        <StepCard 
          number="1" 
          title="Talep Oluştur" 
          description="İhtiyacın olan hizmeti seç ve proje detaylarını belirten kısa formumuzu doldur."
          icon={PaperAirplaneIcon}
        />
        <StepCard 
          number="2" 
          title="Teklifleri Al" 
          description="Projeni inceleyen onaylı ve uzman firmalardan hızlıca fiyat teklifleri al."
          icon={CheckBadgeIcon}
        />
        <StepCard 
          number="3" 
          title="Karar Ver" 
          description="Gelen teklifleri ve firma profillerini karşılaştır, sana en uygun olanı seç."
          icon={StarIcon}
        />
      </div>
    </div>
  </div>
);

const StepCard: React.FC<{ number: string; title: string; description: string; icon: React.FC<any> }> = ({ number, title, description, icon: Icon }) => (
  <div className="relative p-8 bg-white dark:bg-gray-700 rounded-2xl shadow-sm text-center z-10">
    <div className="w-12 h-12 bg-blue-600 text-white text-xl font-bold rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg absolute -top-6 left-1/2 transform -translate-x-1/2">
      {number}
    </div>
    <div className="mt-4 flex justify-center mb-4 text-blue-600 dark:text-blue-400">
        <Icon className="h-12 w-12" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
      {description}
    </p>
  </div>
);

const Footer: React.FC<{ onNavigate: (view: View) => void }> = ({ onNavigate }) => (
  <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="col-span-1 md:col-span-2">
        <span className="text-2xl font-extrabold tracking-tight text-white cursor-pointer" onClick={() => onNavigate('home')}>
          ZeminBul<span className="text-blue-500">.com</span>
        </span>
        <p className="mt-4 text-gray-400 max-w-xs leading-relaxed">
          Türkiye'nin en kapsamlı geoteknik ve zemin mühendisliği pazar yeri. Projeniz için en doğru çözümü burada bulun.
        </p>
      </div>
      
      <div>
        <h4 className="text-lg font-bold mb-4">Kurumsal</h4>
        <ul className="space-y-2 text-gray-400">
          <li><button onClick={() => onNavigate('aboutUs')} className="hover:text-white transition-colors text-left w-full">Hakkımızda</button></li>
          <li><button onClick={() => onNavigate('careers')} className="hover:text-white transition-colors text-left w-full">Kariyer</button></li>
          <li><button onClick={() => onNavigate('contactUs')} className="hover:text-white transition-colors text-left w-full">İletişim</button></li>
        </ul>
      </div>
      
      <div>
        <h4 className="text-lg font-bold mb-4">Destek</h4>
        <ul className="space-y-2 text-gray-400">
          <li><button onClick={() => onNavigate('helpCenter')} className="hover:text-white transition-colors text-left w-full">Yardım Merkezi</button></li>
          <li><button onClick={() => onNavigate('hizmetPolitikasi')} className="hover:text-white transition-colors text-left w-full">Hizmet Politikası</button></li>
          <li><button onClick={() => onNavigate('privacyPolicy')} className="hover:text-white transition-colors text-left w-full">Gizlilik Politikası</button></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
      &copy; {new Date().getFullYear()} ZeminBul.com. Tüm hakları saklıdır.
    </div>
  </footer>
);

// --- ChatToPostModal ---

interface ChatToPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialQuery: string;
    onNavigate: (view: View, id?: string | null, data?: any) => void;
    requireAuth: (cb: () => void) => void;
}

const ChatToPostModal: React.FC<ChatToPostModalProps> = ({ isOpen, onClose, initialQuery, onNavigate, requireAuth }) => {
    const [messages, setMessages] = React.useState<{role: 'user' | 'model', parts: {text: string}[]}[]>([]);
    const [inputValue, setInputValue] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isComplete, setIsComplete] = React.useState(false);
    const [extractedData, setExtractedData] = React.useState<any>(null);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isOpen && initialQuery && messages.length === 0) {
            handleSendMessage(initialQuery);
        }
    }, [isOpen, initialQuery]);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const newMessages = [...messages, { role: 'user' as const, parts: [{ text }] }];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            const result = await continueChatToPost(newMessages);
            
            if (result.isComplete && result.extractedData) {
                setExtractedData(result.extractedData);
                setIsComplete(true);
                setMessages(prev => [...prev, { role: 'model', parts: [{ text: result.nextQuestion || "Harika! Bilgileri topladım. Şimdi ilanı oluşturmaya geçebiliriz." }] }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', parts: [{ text: result.nextQuestion }] }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin." }] }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateListing = () => {
        requireAuth(() => {
            onClose();
            onNavigate('postJob', null, { ...extractedData, category_id: initialQuery }); 
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-2xl">
                    <div className="flex items-center gap-2 text-white">
                        <SparklesIcon className="h-6 w-6" />
                        <h3 className="font-bold text-lg">ZeminBul Asistan</h3>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-600'
                            }`}>
                                <p className="text-sm leading-relaxed">{msg.parts[0].text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="bg-white dark:bg-gray-700 p-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-600 flex items-center gap-2">
                                <LoaderIcon className="h-4 w-4 animate-spin text-blue-600" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">Yazıyor...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area or Action Button */}
                <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
                    {isComplete ? (
                        <button 
                            onClick={handleCreateListing}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <CheckBadgeIcon className="h-5 w-5" />
                            İlanı Oluştur
                        </button>
                    ) : (
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
                            className="flex gap-2"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Cevabınızı yazın..."
                                className="flex-grow p-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 dark:text-white placeholder-gray-500"
                                autoFocus
                                disabled={isLoading}
                            />
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim() || isLoading}
                                className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <PaperAirplaneIcon className="h-6 w-6" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;