
import * as React from 'react';
import { ScreenHeader } from '../components/shared/common';
import { BriefcaseIcon, UserIcon, CheckBadgeIcon, GlobeAltIcon, StarIcon, ChevronRightIcon, XCircleIcon, LoaderIcon } from '../components/icons';
import { supabase } from '../utils/supabaseClient';
import { CareerJob } from '../types';

interface CareersScreenProps {
    onBack: () => void;
}

// Fallback data in case table doesn't exist or fetch fails
const fallbackJobs: Partial<CareerJob>[] = [
    {
        id: '1',
        title: "Senior Frontend Geliştirici",
        type: "Tam Zamanlı",
        location: "Uzaktan",
        description: "React, TypeScript ve modern web teknolojilerinde deneyimli, kullanıcı deneyimine önem veren ekip arkadaşı arıyoruz.",
        requirements: ["5+ yıl deneyim", "React & Tailwind CSS uzmanlığı", "UI/UX prensiplerine hakimiyet"]
    },
    {
        id: '2',
        title: "Saha Operasyon Uzmanı",
        type: "Tam Zamanlı",
        location: "İstanbul",
        description: "İnşaat projelerini yerinde inceleyecek, firmalarla iletişimi yönetecek ve kalite kontrol süreçlerini takip edecek uzman.",
        requirements: ["İnşaat/Jeoloji Mühendisliği mezunu", "B sınıfı ehliyet", "Seyahat engeli olmayan"]
    },
    {
        id: '3',
        title: "Müşteri Başarı Yöneticisi",
        type: "Yarı Zamanlı",
        location: "Uzaktan",
        description: "Kullanıcılarımızın platformu en verimli şekilde kullanmalarını sağlayacak, sorunlarına çözüm üretecek iletişimci.",
        requirements: ["Mükemmel sözlü ve yazılı iletişim", "Problem çözme yeteneği", "Empati yeteneği yüksek"]
    }
];


const CareersScreen: React.FC<CareersScreenProps> = ({ onBack }) => {
    const [activeJob, setActiveJob] = React.useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [selectedJobTitle, setSelectedJobTitle] = React.useState('');
    
    // Data State
    const [jobs, setJobs] = React.useState<Partial<CareerJob>[]>([]);
    const [isLoadingJobs, setIsLoadingJobs] = React.useState(true);

    // Form State
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [cvLink, setCvLink] = React.useState('');
    const [coverLetter, setCoverLetter] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState(false);

    React.useEffect(() => {
        const fetchJobs = async () => {
            setIsLoadingJobs(true);
            try {
                const { data, error } = await supabase
                    .from('career_jobs')
                    .select('*')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false });
                
                if (error) {
                    console.warn("Error fetching career jobs (table might not exist), using fallback data:", error.message);
                    setJobs(fallbackJobs);
                } else if (data && data.length > 0) {
                    setJobs(data);
                } else {
                    setJobs(fallbackJobs); // Use fallback if empty list returned (optional choice)
                }
            } catch (e) {
                console.warn("Exception fetching jobs:", e);
                setJobs(fallbackJobs);
            } finally {
                setIsLoadingJobs(false);
            }
        };

        fetchJobs();
    }, []);

    const toggleJob = (index: number) => {
        setActiveJob(activeJob === index ? null : index);
    };

    const handleApplyClick = (jobTitle: string) => {
        setSelectedJobTitle(jobTitle);
        setIsModalOpen(true);
        setSuccess(false);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Reset form
        setName('');
        setEmail('');
        setPhone('');
        setCvLink('');
        setCoverLetter('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
             const { error: submitError } = await supabase.from('job_applications').insert({
                job_title: selectedJobTitle,
                applicant_name: name,
                email,
                phone,
                cv_link: cvLink,
                cover_letter: coverLetter,
                status: 'pending'
             });

             if (submitError) throw submitError;

             setSuccess(true);
             setTimeout(() => {
                 handleCloseModal();
             }, 2000);
        } catch (err: any) {
            console.error(err);
            setError("Başvuru gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const benefits = [
        { icon: GlobeAltIcon, title: "Uzaktan Çalışma", desc: "Esnek saatler ve istediğin yerden çalışma özgürlüğü." },
        { icon: StarIcon, title: "Rekabetçi Maaş", desc: "Sektör standartlarının üzerinde maaş ve yan haklar." },
        { icon: UserIcon, title: "Kişisel Gelişim", desc: "Eğitim bütçesi ve sürekli öğrenme kültürü." },
        { icon: CheckBadgeIcon, title: "Harika Ekip", desc: "Destekleyici, yetenekli ve eğlenceli çalışma arkadaşları." },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
            <ScreenHeader onBack={onBack} title="Kariyer" />

            {/* Hero Section */}
            <div className="py-20 px-6 text-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="inline-block p-3 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-6 animate-bounce-slow">
                    <BriefcaseIcon className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                    Geleceği <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Birlikte İnşa Edelim</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    ZeminBul.com ekibine katılın, inşaat teknolojilerini dönüştüren ekibin bir parçası olun.
                </p>
            </div>

            <main className="max-w-5xl mx-auto px-6 pb-24">
                
                {/* Benefits Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-lg transition-shadow duration-300">
                            <benefit.icon className="w-10 h-10 text-blue-500 mb-4" />
                            <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Open Positions */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold mb-8 text-center">Açık Pozisyonlar</h2>
                    
                    {isLoadingJobs ? (
                        <div className="flex justify-center py-10">
                             <LoaderIcon className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : jobs.length > 0 ? (
                        jobs.map((job, idx) => (
                            <div 
                                key={job.id || idx} 
                                className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-800 shadow-sm"
                            >
                                <button 
                                    onClick={() => toggleJob(idx)}
                                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                >
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.title}</h3>
                                        <div className="flex gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-blue-700 dark:text-blue-300 font-medium">{job.type}</span>
                                            <span className="flex items-center gap-1 px-3 py-1"><GlobeAltIcon className="w-4 h-4"/> {job.location}</span>
                                        </div>
                                    </div>
                                    <ChevronRightIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${activeJob === idx ? 'rotate-90' : ''}`} />
                                </button>
                                
                                <div className={`px-6 pb-6 transition-all duration-300 ease-in-out overflow-hidden ${activeJob === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{job.description}</p>
                                        <h4 className="font-semibold mb-2">Aranan Özellikler:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 mb-6">
                                            {job.requirements?.map((req, rIdx) => (
                                                <li key={rIdx}>{req}</li>
                                            ))}
                                        </ul>
                                        <button 
                                            onClick={() => handleApplyClick(job.title || 'Başvuru')}
                                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors w-full sm:w-auto"
                                        >
                                            Başvur
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                         <div className="text-center py-8 text-gray-500">
                             Şu anda açık pozisyon bulunmamaktadır.
                         </div>
                    )}
                </div>

                {/* General Application CTA */}
                 <div className="mt-16 text-center bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-2">Sana uygun bir pozisyon yok mu?</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Genel başvurulara her zaman açığız. CV'ni bize gönder, uygun pozisyon açıldığında haberleşelim.</p>
                    <a href="mailto:kariyer@zeminbul.com" className="text-blue-600 dark:text-blue-400 font-bold hover:underline text-lg">kariyer@zeminbul.com</a>
                </div>

            </main>

            {/* Application Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-scale">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Başvuru: {selectedJobTitle}</h3>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                <XCircleIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {success ? (
                                <div className="text-center py-8">
                                    <CheckBadgeIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <h4 className="text-2xl font-bold text-gray-800 dark:text-white">Başvurunuz Alındı!</h4>
                                    <p className="text-gray-600 dark:text-gray-300 mt-2">İlginiz için teşekkür ederiz. En kısa sürede size dönüş yapacağız.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Soyad</label>
                                        <input 
                                            type="text" 
                                            required 
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-posta</label>
                                            <input 
                                                type="email" 
                                                required 
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                                            <input 
                                                type="tel" 
                                                required 
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CV Linki (LinkedIn, Drive, vs.)</label>
                                        <input 
                                            type="url" 
                                            required 
                                            placeholder="https://..."
                                            value={cvLink}
                                            onChange={e => setCvLink(e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ön Yazı (Opsiyonel)</label>
                                        <textarea 
                                            rows={4}
                                            value={coverLetter}
                                            onChange={e => setCoverLetter(e.target.value)}
                                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>

                                    {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                                    <div className="pt-4">
                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {loading ? <><LoaderIcon className="animate-spin w-5 h-5" /> Gönderiliyor...</> : 'Başvuruyu Tamamla'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

             <style>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite ease-in-out;
                }
                @keyframes fade-in-scale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default CareersScreen;