import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import { LoaderIcon, CheckBadgeIcon, MapPinIcon, EnvelopeIcon, ChatBubbleBottomCenterTextIcon } from '../components/icons';
import { ScreenHeader } from '../components/shared/common';
import { ContactSettings } from '../types';

interface ContactUsScreenProps {
    onBack: () => void;
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

const defaultContactInfo: ContactSettings = {
    id: 'default',
    address: 'Teknopark İstanbul, Sanayi Mh. Teknoloji Blv. No:1 Pendik/İstanbul',
    email: 'destek@zeminbul.com',
    phone: '+90 216 000 00 00',
    live_support_text: 'Hafta içi 09:00 - 18:00',
    subjects: ['İstek', 'Öneri', 'Şikayet', 'Diğer']
};

const ContactUsScreen: React.FC<ContactUsScreenProps> = ({ onBack }) => {
    const [contactInfo, setContactInfo] = React.useState<ContactSettings>(defaultContactInfo);
    const [subject, setSubject] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [status, setStatus] = React.useState<SubmissionStatus>('idle');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data, error } = await supabase
                    .from('contact_settings')
                    .select('*')
                    .maybeSingle();
                
                if (data) {
                    setContactInfo(data);
                    // Set initial subject
                    if(data.subjects && data.subjects.length > 0) {
                        setSubject(data.subjects[0]);
                    } else {
                        setSubject('Diğer');
                    }
                } else {
                    setSubject(defaultContactInfo.subjects[0]);
                }
            } catch (err) {
                console.warn("Could not fetch contact info, using defaults:", err);
                setSubject(defaultContactInfo.subjects[0]);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            setError('Lütfen bir mesaj girin.');
            return;
        }

        setStatus('submitting');
        setError(null);

        // DEV MODE: Simulate submission since 'tickets' table creation is not enforced yet on user side but we might have admin messages table
        // In a real scenario, this would insert into 'tickets' or 'admin_messages'
        setTimeout(async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                 setError("Mesaj göndermek için giriş yapmalısınız.");
                 setStatus('error');
                 return;
            }
            
            // Here we would ideally insert into 'tickets' table
             console.log("Simulating ticket submission:", { user_id: user.id, subject, message });

            setStatus('success');
            setTimeout(() => {
                onBack();
            }, 2000);
        }, 1000);
    };

    const isBusy = status === 'submitting' || status === 'success';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <ScreenHeader onBack={onBack} title="Bize Ulaşın" />
            
            <main className="max-w-6xl mx-auto p-6 lg:p-12">
                <div className="grid md:grid-cols-2 gap-12 items-start">
                    
                    {/* Left Side: Contact Info */}
                    <div className="space-y-8 animate-fade-in-left">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">İletişime Geçin</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                Sorularınız, önerileriniz veya iş birlikleri için bizimle her zaman iletişime geçebilirsiniz. Ekibimiz en kısa sürede size dönüş yapacaktır.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <ContactInfoCard 
                                icon={MapPinIcon} 
                                title="Adres" 
                                content={contactInfo.address} 
                            />
                            <ContactInfoCard 
                                icon={EnvelopeIcon} 
                                title="E-posta" 
                                content={contactInfo.email} 
                                isLink
                                href={`mailto:${contactInfo.email}`}
                            />
                            <ContactInfoCard 
                                icon={ChatBubbleBottomCenterTextIcon} 
                                title="Canlı Destek" 
                                content={contactInfo.live_support_text} 
                            />
                        </div>
                    </div>

                    {/* Right Side: Form */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl animate-fade-in-up">
                        {status === 'success' ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mb-6 animate-bounce-small">
                                    <CheckBadgeIcon className="h-10 w-10 text-green-500" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Mesajınız Alındı!</h2>
                                <p className="text-gray-600 dark:text-gray-300 mt-3">Geri bildiriminiz için teşekkür ederiz. En kısa sürede size dönüş yapacağız.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>}
                                
                                <div>
                                    <label htmlFor="subject" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Konu</label>
                                    <div className="relative">
                                        <select
                                            id="subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            disabled={isBusy}
                                            className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none text-gray-900 dark:text-white"
                                        >
                                            {contactInfo.subjects && contactInfo.subjects.length > 0 
                                                ? contactInfo.subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)
                                                : <option>Genel</option>
                                            }
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mesajınız</label>
                                    <textarea
                                        id="message"
                                        rows={6}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Size nasıl yardımcı olabiliriz?"
                                        required
                                        disabled={isBusy}
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900 dark:text-white"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isBusy}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                                >
                                    {status === 'submitting' ? (
                                        <>
                                            <LoaderIcon className="h-5 w-5 animate-spin" /> Gönderiliyor...
                                        </>
                                    ) : 'Mesajı Gönder'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
            
            <style>{`
                @keyframes fade-in-left {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-left {
                    animation: fade-in-left 0.8s ease-out forwards;
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards 0.2s; 
                    opacity: 0; /* Start invisible */
                }
                 @keyframes bounce-small {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-small {
                    animation: bounce-small 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
};

const ContactInfoCard: React.FC<{ icon: React.FC<any>, title: string, content: string, isLink?: boolean, href?: string }> = ({ icon: Icon, title, content, isLink, href }) => (
    <div className="flex items-start p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4">
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
            {isLink ? (
                <a href={href} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{content}</a>
            ) : (
                <p className="text-gray-600 dark:text-gray-400">{content}</p>
            )}
        </div>
    </div>
);

export default ContactUsScreen;