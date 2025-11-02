import * as React from 'react';
import { View } from '../types';
import { ArrowLeftIcon } from '../components/icons';

interface AdminLayoutProps {
    children: React.ReactNode;
    onNavigate: (view: View) => void;
    title: string;
    onBack?: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onNavigate, title, onBack }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16">
                        {onBack ? (
                            <>
                                <button onClick={onBack} className="mr-4 -ml-2 p-2 rounded-full hover:bg-gray-100 text-gray-600">
                                    <ArrowLeftIcon className="h-6 w-6" />
                                </button>
                                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                            </>
                        ) : (
                             <div className="flex-shrink-0">
                                <span className="text-xl font-extrabold tracking-tight text-gray-800">ZeminBul<span className="font-semibold text-gray-600"> / Admin</span></span>
                             </div>
                        )}
                    </div>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                   {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
