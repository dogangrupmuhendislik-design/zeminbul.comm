import * as React from 'react';
import { LoaderIcon, CheckBadgeIcon } from './icons';

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string, details: string) => Promise<void>;
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

const disputeReasons = [
    'Ödeme Sorunu',
    'İş Kalitesi Yetersiz',
    'İletişim Problemi',
    'Anlaşmaya Uyulmadı',
    'Diğer'
];

const DisputeModal: React.FC<DisputeModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = React.useState(disputeReasons[0]);
    const [details, setDetails] = React.useState('');
    const [status, setStatus] = React.useState<SubmissionStatus>('idle');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            setReason(disputeReasons[0]);
            setDetails('');
            setStatus('idle');
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!details.trim()) {
            setError('Lütfen yaşadığınız sorunu detaylı olarak açıklayın.');
            return;
        }

        setStatus('submitting');
        setError(null);

        try {
            await onSubmit(reason, details);
            setStatus('success');
            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (err) {
            console.error("Error submitting dispute:", err);
            setError((err as Error).message || "Rapor gönderilirken bir hata oluştu.");
            setStatus('error');
        }
    };

    if (!isOpen) return null;
    
    const isBusy = status === 'submitting' || status === 'success';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Sorun Bildir</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">İşle ilgili yaşadığınız anlaşmazlığı yönetici ekibimize bildirin.</p>

                {status === 'success' ? (
                    <div className="text-center py-8">
                        <CheckBadgeIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Anlaşmazlık Raporunuz Alındı!</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">Ekibimiz durumu en kısa sürede inceleyerek size geri dönüş yapacaktır.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                         <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Sorunun Konusu</label>
                            <select
                                id="reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                disabled={isBusy}
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                {disputeReasons.map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <textarea
                            value={details}
                            onChange={e => setDetails(e.target.value)}
                            rows={6}
                            placeholder="Lütfen yaşadığınız durumu detaylı bir şekilde anlatın. Tarihler, kişiler ve olaylar hakkında bilgi vermeniz süreci hızlandıracaktır."
                            required
                            disabled={isBusy}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={onClose} disabled={isBusy} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">İptal</button>
                            <button type="submit" disabled={isBusy} className="bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2">
                                {isBusy && <LoaderIcon className="h-4 w-4 animate-spin" />}
                                Raporu Gönder
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DisputeModal;
