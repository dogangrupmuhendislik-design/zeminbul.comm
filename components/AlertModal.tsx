import * as React from 'react';

interface AlertModalProps {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    cancelText?: string;
    onCancel?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({ icon: Icon, title, message, confirmText, onConfirm, cancelText, onCancel }) => {
    
    // Prevent background scroll when modal is open
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alert-modal-title"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm relative p-8 text-center transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
            >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 -mt-16 border-4 border-white dark:border-gray-800">
                    <Icon className="h-9 w-9 text-blue-500 dark:text-blue-400" />
                </div>
                
                <h2 id="alert-modal-title" className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-6">{title}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {message}
                </p>

                <div className="mt-8 space-y-3">
                    <button
                        onClick={onConfirm}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        {confirmText}
                    </button>
                    {onCancel && cancelText && (
                        <button
                            onClick={onCancel}
                            className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            {cancelText}
                        </button>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                @keyframes fade-in-scale {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default AlertModal;
