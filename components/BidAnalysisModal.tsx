import * as React from 'react';
import { BidAnalysisResponse } from '../types';
import { BrainCircuitIcon, XCircleIcon, CheckBadgeIcon, StarIcon } from './icons';
import DrillingRigLoader from './DrillingRigLoader';

interface BidAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    analysisResult: BidAnalysisResponse | null;
    error: string | null;
}

const BidAnalysisModal: React.FC<BidAnalysisModalProps> = ({ isOpen, onClose, isLoading, analysisResult, error }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-2xl relative p-6 max-h-[90vh] flex flex-col animate-fade-in-scale"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BrainCircuitIcon className="h-7 w-7 text-blue-600" />
                        <span>AI Teklif Analizi</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <DrillingRigLoader />
                            <p className="mt-4 text-lg font-semibold text-gray-700">Teklifler analiz ediliyor...</p>
                            <p className="text-gray-500">Lütfen bekleyin, bu işlem biraz sürebilir.</p>
                        </div>
                    )}
                    {error && (
                         <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                            <XCircleIcon className="h-16 w-16 text-red-400" />
                            <h3 className="mt-4 text-xl font-bold text-red-700">Analiz Başarısız</h3>
                            <p className="mt-2 text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
                            <button onClick={onClose} className="mt-6 bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300">
                                Kapat
                            </button>
                        </div>
                    )}
                    {analysisResult && (
                        <div className="space-y-6">
                             <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
                                <h3 className="font-bold text-blue-800 text-lg flex items-center gap-2">
                                    <StarIcon className="h-5 w-5"/>
                                    AI Tavsiyesi
                                </h3>
                                <p className="mt-2 text-blue-700 leading-relaxed">{analysisResult.recommendation}</p>
                            </div>
                            <div className="space-y-4">
                                {analysisResult.analysis.map((item, index) => (
                                    <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-lg text-gray-900">{item.provider_name}</h4>
                                                <p className="text-xl font-extrabold text-blue-600">{item.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                                            </div>
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">{item.best_for}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h5 className="font-semibold text-green-700 flex items-center gap-1.5 mb-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                                    Artıları
                                                </h5>
                                                <ul className="space-y-1 text-sm text-gray-700 list-disc pl-5">
                                                    {item.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                                                </ul>
                                            </div>
                                             <div>
                                                <h5 className="font-semibold text-red-700 flex items-center gap-1.5 mb-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                                    Eksileri
                                                </h5>
                                                <ul className="space-y-1 text-sm text-gray-700 list-disc pl-5">
                                                    {item.cons.map((con, i) => <li key={i}>{con}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t mt-auto">
                    <button 
                        onClick={onClose}
                        className="w-full bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Kapat
                    </button>
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

export default BidAnalysisModal;