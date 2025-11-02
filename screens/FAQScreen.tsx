import * as React from 'react';
import { ChevronRightIcon } from '../components/icons';

interface FAQScreenProps {
    onBack: () => void;
}

interface FAQItem {
    question: string;
    answer: string;
}

const faqData: { category: string; items: FAQItem[] }[] = [
    {
        category: 'Müşteriler İçin',
        items: [
            {
                question: 'ZeminBul.com\'u kullanmak ücretli mi?',
                answer: 'Hayır, müşteriler için iş ilanı yayınlamak ve teklifleri görmek tamamen ücretsizdir. Sadece teklif veren firmaların profillerini detaylı incelemek gibi ek özellikler için Pro üyeliğe geçmeniz gerekebilir.',
            },
            {
                question: 'İlanıma ne kadar sürede teklif gelir?',
                answer: 'Teklif gelme süresi projenizin detaylarına, konumuna ve aciliyetine göre değişir. Genellikle ilan yayınlandıktan sonraki ilk 24 saat içinde teklifler gelmeye başlar.',
            },
            {
                question: 'Gelen tekliflerden birini kabul etmek zorunda mıyım?',
                answer: 'Hayır, hiçbir teklifi kabul etme zorunluluğunuz yoktur. Teklifleri inceleyip projeniz için en uygun bulduğunuz firmayla anlaşabilir veya hiçbirini seçmeyebilirsiniz.',
            },
            {
                question: 'Ödemeyi nasıl yapıyorum?',
                answer: 'Ödeme, anlaştığınız firma ile sizin aranızda belirlenen koşullara göre doğrudan firmaya yapılır. ZeminBul.com ödeme işlemlerine aracılık etmez.',
            },
        ],
    },
    {
        category: 'Firmalar İçin',
        items: [
            {
                question: 'Platforma nasıl üye olabilirim?',
                answer: 'Anasayfadaki "Kayıt Ol" butonuna tıklayıp "Firmayım" seçeneğini seçerek ve gerekli bilgileri doldurarak kolayca üye olabilirsiniz. Üyeliğinizin onaylanması için firma belgeleriniz incelenebilir.',
            },
            {
                question: 'Teklif vermek ücretli mi?',
                answer: 'Evet, ilanlara teklif vermek için küçük bir hizmet bedeli alınır. Bu bedel, teklif tutarınıza göre dinamik olarak hesaplanır ve teklifi gönderirken bakiyenizden düşülür. Bakiyenizi profil sayfanızdan yükleyebilirsiniz.',
            },
            {
                question: 'Teklifim kabul edilirse ne olur?',
                answer: 'Teklifiniz müşteri tarafından kabul edildiğinde hem size hem de müşteriye iletişim bilgileri açılır. Proje detaylarını görüşmek ve anlaşmayı tamamlamak için müşteriyle doğrudan iletişime geçebilirsiniz.',
            },
            {
                question: 'Profilimi nasıl daha çekici hale getirebilirim?',
                answer: 'Firma profilinizi eksiksiz doldurmak çok önemlidir. Firma logonuzu, detaylı bir açıklama, tamamladığınız işlerden oluşan bir portfolyo, makine parkurunuzu ve sertifikalarınızı ekleyerek müşterilerin güvenini kazanabilir ve daha fazla iş alabilirsiniz.',
            },
        ],
    },
];


const FAQScreen: React.FC<FAQScreenProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Header onBack={onBack} />
            <main className="p-4 space-y-6">
                {faqData.map((section) => (
                    <div key={section.category} className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">{section.category}</h2>
                        <div className="space-y-2">
                            {section.items.map((item, index) => (
                                <FAQAccordion key={index} question={item.question} answer={item.answer} />
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

const Header: React.FC<{ onBack: () => void }> = ({ onBack }) => (
    <header className="p-4 border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center">
        <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-xl font-bold text-center text-gray-900 flex-grow">Sıkça Sorulan Sorular</h1>
        <div className="w-10"></div>
    </header>
);

const FAQAccordion: React.FC<FAQItem> = ({ question, answer }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <div className="border-b last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4"
            >
                <h3 className="text-md font-semibold text-gray-800">{question}</h3>
                <ChevronRightIcon className={`h-5 w-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? '1000px' : '0px' }}
            >
                <p className="pb-4 text-gray-600 leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

export default FAQScreen;