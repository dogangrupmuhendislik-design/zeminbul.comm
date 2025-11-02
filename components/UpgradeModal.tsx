import * as React from 'react';
import { StarIcon } from './icons';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    featureName: string;
    description: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, featureName, description, icon: Icon }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-modal-title"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md relative p-8 text-center transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
                onClick={e => e.stopPropagation()}
            >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 -mt-16 border-4 border-white shadow-lg">
                    <Icon className="h-9 w-9 text-white" />
                </div>
                
                <h2 id="upgrade-modal-title" className="text-2xl font-bold text-gray-900 mt-6">{featureName}</h2>
                <p className="mt-2 text-gray-600">
                    {description}
                </p>

                <div className="mt-8 space-y-3">
                    <button
                        onClick={onUpgrade}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                        Pro Plana Yükselt
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Kapat
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                @keyframes fade-in-scale {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in-scale {
                    animation: fade-in-scale 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default UpgradeModal;