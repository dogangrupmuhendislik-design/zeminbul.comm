import * as React from 'react';
import { LoaderIcon, CheckBadgeIcon } from './icons';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void>;
    itemType?: 'İlanı' | 'Profili';
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, itemType = 'İlanı' }) => {
    const [reason, setReason] = React.useState('');
    const [status, setStatus] = React.useState<SubmissionStatus>('idle');
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen) {
            setReason('');
            setStatus('idle');
            setError(null);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Lütfen raporlamak için bir neden belirtin.');
            return;
        }

        setStatus('submitting');
        setError(null);

        try {
            await onSubmit(reason);
            setStatus('success');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Error submitting report:", err);
            setError((err as Error).message || "Rapor gönderilirken bir hata oluştu.");
            setStatus('error');
        }
    };

    if (!isOpen) return null;
    
    const isBusy = status === 'submitting' || status === 'success';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{itemType} Rapor Et</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-1">Lütfen bu {itemType.toLowerCase()} neden uygunsuz bulduğunuzu açıklayın.</p>

                {status === 'success' ? (
                    <div className="text-center py-8">
                        <CheckBadgeIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Raporunuz Alındı!</h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">Geri bildiriminiz için teşekkür ederiz. Ekibimiz durumu en kısa sürede inceleyecektir.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                        <textarea
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            rows={5}
                            placeholder="Örn: İlan spam içeriyor, profil bilgileri hatalı, dolandırıcılık şüphesi..."
                            required
                            disabled={isBusy}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div className="flex justify-end gap-3">
                            <button type="button" onClick={onClose} disabled={isBusy} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">İptal</button>
                            <button type="submit" disabled={isBusy} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
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

export default ReportModal;
