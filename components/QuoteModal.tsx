import * as React from 'react';
import { JobListing, Profile } from '../types';
import { supabase } from '../utils/supabaseClient';
import { PaperAirplaneIcon, InformationCircleIcon, LoaderIcon, CheckBadgeIcon, BrainCircuitIcon, XCircleIcon } from './icons';
import { generateBidNotes } from '../services/geminiService';


interface QuoteModalProps {
    job: JobListing | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (quoteDetails: { amount: string, notes: string }) => Promise<void>;
    initialAmount?: string;
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export const QuoteModal: React.FC<QuoteModalProps> = ({ job, isOpen, onClose, onSubmit, initialAmount }) => {
    const [amount, setAmount] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [commission, setCommission] = React.useState(0);
    const [submissionStatus, setSubmissionStatus] = React.useState<SubmissionStatus>('idle');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [currentBalance, setCurrentBalance] = React.useState<number | null>(null);
    const [loadingBalance, setLoadingBalance] = React.useState(true);
    const [generatingNotes, setGeneratingNotes] = React.useState(false);


    const COMMISSION_RATE = 0.001; // 0.1%

    const fetchBalance = React.useCallback(async () => {
        setLoadingBalance(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('balance')
                .eq('id', user.id)
                .single();
            if (error) {
                console.error("Error fetching balance:", error);
                setCurrentBalance(0);
            } else {
                setCurrentBalance(data.balance);
            }
        }
        setLoadingBalance(false);
    }, []);

    React.useEffect(() => {
        if (isOpen) {
            setAmount(initialAmount || '');
            setNotes('');
            setSubmissionStatus('idle');
            setErrorMessage('');
            fetchBalance();
        }
    }, [isOpen, initialAmount, fetchBalance]);

    React.useEffect(() => {
        const numericAmount = parseFloat(amount);
        if (!isNaN(numericAmount) && numericAmount > 0) {
            const calculatedCommission = numericAmount * COMMISSION_RATE;
            setCommission(calculatedCommission);
        } else {
            setCommission(0);
        }
    }, [amount]);

    const isBalanceInsufficient = currentBalance !== null && currentBalance < commission && parseFloat(amount) > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!amount || parseFloat(amount) <= 0) {
            setErrorMessage('Lütfen geçerli bir teklif tutarı girin.');
            setSubmissionStatus('error');
            setTimeout(() => { setSubmissionStatus('idle'); setErrorMessage(''); }, 2000);
            return;
        }

        if (isBalanceInsufficient || currentBalance === null) {
            setErrorMessage(`Teklif vermek için yeterli bakiyeniz yok. Gerekli tutar: ${commission.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`);
            setSubmissionStatus('error');
            return;
        }

        setSubmissionStatus('submitting');
        setErrorMessage('');
        try {
            await onSubmit({ amount, notes });
            
            const newBalance = (currentBalance || 0) - commission;
            setCurrentBalance(newBalance);

            setSubmissionStatus('success');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error("Quote submission process failed:", error);
            setSubmissionStatus('error');
            setErrorMessage((error as Error).message || "Teklif gönderilemedi. Lütfen tekrar deneyin.");
        }
    };
    
    const handleGenerateNotes = async () => {
        if (!job) return;
        setGeneratingNotes(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Kullanıcı bulunamadı.");
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (!profile) throw new Error("Profil bulunamadı.");

            const generated = await generateBidNotes(job, profile);
            setNotes(generated);
        } catch (error) {
            console.error(error);
        } finally {
            setGeneratingNotes(false);
        }
    };


    if (!isOpen || !job) {
        return null;
    }

    const isBusy = submissionStatus === 'submitting' || submissionStatus === 'success' || generatingNotes;

    const getButtonContent = () => {
        switch (submissionStatus) {
            case 'submitting':
                return (<><LoaderIcon className="h-5 w-5 animate-spin" /><span>Gönderiliyor...</span></>);
            case 'success':
                return (<><CheckBadgeIcon className="h-5 w-5" /><span>Başarılı!</span></>);
            case 'error':
                 return (<><PaperAirplaneIcon className="h-5 w-5" /><span>Tekrar Dene</span></>);
            default:
                return (<><PaperAirplaneIcon className="h-5 w-5" /><span>Teklifi Gönder</span></>);
        }
    };
    
    const getButtonClass = () => {
        switch (submissionStatus) {
            case 'submitting':
                return 'bg-blue-600 opacity-75 cursor-not-allowed';
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500 hover:bg-red-600';
            default:
                return 'bg-blue-600 hover:bg-blue-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Teklif Ver: {job.title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <XCircleIcon className="h-6 w-6" />
                    </button>
                </div>
                
                {submissionStatus === 'success' ? (
                    <div className="text-center py-8">
                        <CheckBadgeIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Teklifiniz Gönderildi!</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">Müşteri teklifinizi inceledikten sonra size geri dönüş yapacaktır.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        {isBalanceInsufficient && (
                            <div className="bg-red-50 p-3 rounded-md text-red-700 text-sm border border-red-200">
                               {errorMessage}
                            </div>
                        )}
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Teklif Tutarı (TL)</label>
                            <input 
                                type="number"
                                id="amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Örn: 150000"
                                required
                                disabled={isBusy}
                            />
                             <p className="text-xs text-gray-500 mt-1">Hizmet bedeli ({COMMISSION_RATE * 100}%): {commission.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                        </div>
                        <div>
                            <div className="flex justify-between items-center">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Notlarınız (Opsiyonel)</label>
                                <button type="button" onClick={handleGenerateNotes} disabled={generatingNotes || isBusy} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                    <BrainCircuitIcon className="h-4 w-4" />
                                    {generatingNotes ? 'Oluşturuluyor...' : 'AI ile Otomatik Not Oluştur'}
                                </button>
                            </div>
                            <textarea
                                id="notes"
                                rows={4}
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Teklifinizle ilgili ek detaylar, işin nasıl yapılacağı, zamanlama vb."
                                disabled={isBusy}
                            />
                        </div>
                        {errorMessage && !isBalanceInsufficient && <p className="text-red-500 text-sm">{errorMessage}</p>}
                        <div className="flex justify-end gap-3 pt-2">
                            <button type="button" onClick={onClose} disabled={isBusy} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">İptal</button>
                            <button type="submit" disabled={isBusy || isBalanceInsufficient} className={`font-semibold px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2 ${getButtonClass()}`}>
                                {getButtonContent()}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
