import * as React from 'react';
import { JobListing, Transaction, View } from '../../types';
import { ChevronRightIcon, MapPinIcon, ArrowDownCircleIcon, PaperAirplaneIcon, StarIcon, Cog6ToothIcon } from '../icons';

export const ProfileSection: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">{title}</h3>
        {children}
    </div>
);

export const SettingsRow: React.FC<{label: string, sublabel?: string, icon: React.FC<any>, onClick?: () => void}> = ({label, sublabel, icon: Icon, onClick}) => (
     <div
        onClick={onClick}
        className={`flex justify-between items-center py-3 border-b dark:border-gray-700 last:border-b-0 transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-4 px-4' : ''}`}
     >
        <div className="flex items-center">
            <Icon className="h-6 w-6 text-gray-500 dark:text-gray-400 mr-4" />
            <div>
                <p className="font-semibold text-gray-800 dark:text-gray-100">{label}</p>
                {sublabel && <p className="text-gray-500 dark:text-gray-400 text-sm">{sublabel}</p>}
            </div>
        </div>
        {onClick && <ChevronRightIcon className="h-5 w-5 text-gray-400" />}
    </div>
);

export const KeyValueRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b dark:border-gray-700 last:border-b-0">
        <span className="text-gray-500 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-800 dark:text-gray-200">{value}</span>
    </div>
);

export const IconInfoRow: React.FC<{ icon: React.FC<any>; text: string }> = ({ icon: Icon, text }) => (
    <div className="flex items-center text-gray-600 dark:text-gray-300 mt-3">
        <Icon className="h-5 w-5 mr-2.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        <p className="text-sm">{text}</p>
    </div>
);

export const JobListSection: React.FC<{title: string, jobs: JobListing[], onNavigate: (view: View, jobId?: string) => void}> = ({ title, jobs, onNavigate }) => (
     <ProfileSection title={title}>
        <div className="space-y-3">
            {jobs && jobs.length > 0 ? jobs.map(job => (
                <div key={job.id} onClick={() => onNavigate('jobDetail', job.id)} className="border dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{job.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><MapPinIcon className="h-4 w-4"/>{job.location?.text}</p>
                </div>
            )) : <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Henüz bir ilanınız bulunmuyor.</p>}
        </div>
    </ProfileSection>
);

export const TransactionHistorySection: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
    <ProfileSection title="İşlem Geçmişi">
        {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
                {transactions.map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
            </div>
        ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">Henüz bir işlem geçmişiniz bulunmuyor.</p>
        )}
    </ProfileSection>
);

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const isIncome = transaction.type === 'deposit' || transaction.type === 'earning' || (transaction.type === 'adjustment' && transaction.amount > 0);
    const details = {
        earning: { icon: ArrowDownCircleIcon, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
        deposit: { icon: ArrowDownCircleIcon, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
        fee: { icon: PaperAirplaneIcon, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
        subscription: { icon: StarIcon, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
        adjustment: { icon: Cog6ToothIcon, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/30'}
    }[transaction.type];
    
    if (!details) {
        return null;
    }
    const Icon = details.icon;
    return (
        <div className="flex items-center py-2">
            <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center ${details.bg}`}><Icon className={`h-6 w-6 ${details.color}`} /></div>
            <div className="ml-3 flex-grow">
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{transaction.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(transaction.created_at).toLocaleString('tr-TR')}</p>
            </div>
            <p className={`font-bold text-sm ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{isIncome ? '+' : '-'}{Math.abs(transaction.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
        </div>
    );
};

export const StatItem: React.FC<{ icon: React.FC<any>, value: string | number, label: string, color?: string }> = ({ icon: Icon, value, label, color = 'blue' }) => {
    const colors: { [key: string]: string } = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/50 dark:text-green-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
    };
    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className={`mx-auto h-10 w-10 rounded-lg flex items-center justify-center ${colors[color] || colors.blue}`}>
                <Icon className="h-6 w-6" />
            </div>
            <p className="text-xl font-bold mt-2">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    );
};

export const ScreenHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
    <header className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-10 flex items-center">
        <button onClick={onBack} className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 flex-grow">{title}</h1>
        <div className="w-10"></div>
    </header>
);