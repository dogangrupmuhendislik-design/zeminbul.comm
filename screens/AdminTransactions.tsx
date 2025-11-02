import * as React from 'react';
import { View, Transaction, Profile } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { CurrencyDollarIcon, StarIcon, PaperAirplaneIcon, ArrowDownCircleIcon, UserIcon, ArrowUpIcon, LoaderIcon, XCircleIcon } from '../components/icons';

interface AdminTransactionsProps {
    onNavigate: (view: View, id?: string) => void;
}

type FullTransaction = Transaction & {
    profiles: Partial<Pick<Profile, 'name' | 'company_name' | 'role'>>
};

const AdminTransactions: React.FC<AdminTransactionsProps> = ({ onNavigate }) => {
    const [transactions, setTransactions] = React.useState<FullTransaction[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [typeFilter, setTypeFilter] = React.useState<'all' | Transaction['type']>('all');
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const fetchTransactions = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('transactions')
            .select('*, profiles(name, company_name, role)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching transactions:", error);
        } else {
            setTransactions(data as FullTransaction[]);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filteredTransactions = React.useMemo(() => {
        return transactions.filter(tx => {
            const typeMatch = typeFilter === 'all' || tx.type === typeFilter;
            const searchTermLower = searchTerm.toLowerCase();
            const userName = (tx.profiles?.role === 'provider' ? tx.profiles?.company_name : tx.profiles?.name) || '';
            const searchMatch = !searchTerm || userName.toLowerCase().includes(searchTermLower) || tx.description.toLowerCase().includes(searchTermLower);
            return typeMatch && searchMatch;
        });
    }, [transactions, typeFilter, searchTerm]);

    const handleExportCSV = () => {
        const headers = ['ID', 'Tarih', 'Kullanıcı ID', 'Kullanıcı Adı', 'Tip', 'Açıklama', 'Tutar'];
        const rows = filteredTransactions.map(tx => [
            tx.id,
            new Date(tx.created_at).toISOString(),
            tx.user_id,
            (tx.profiles.role === 'provider' ? tx.profiles.company_name : tx.profiles.name) || '',
            tx.type,
            `"${tx.description.replace(/"/g, '""')}"`,
            tx.amount
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "islemler.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleAddTransactionSuccess = () => {
        setIsModalOpen(false);
        fetchTransactions(); // Refresh the list
    };

    if (loading) {
        return <DrillingRigLoader />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
                <input
                    type="text"
                    placeholder="Kullanıcı adı veya açıklama ara..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value as any)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                    >
                        <option value="all">Tüm İşlem Tipleri</option>
                        <option value="deposit">Bakiye Yükleme</option>
                        <option value="fee">Komisyon</option>
                        <option value="earning">Kazanç</option>
                        <option value="subscription">Abonelik</option>
                        <option value="adjustment">Manuel Ayarlama</option>
                    </select>
                     <button onClick={handleExportCSV} className="sm:w-auto flex-shrink-0 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700">
                        CSV Olarak Aktar
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="sm:w-auto flex-shrink-0 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700">
                        Manuel İşlem Ekle
                    </button>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                    <TransactionItem key={tx.id} transaction={tx} onNavigate={onNavigate} />
                )) : (
                    <p className="p-8 text-center text-gray-500">Filtrelerle eşleşen işlem bulunamadı.</p>
                )}
                </div>
            </div>
            {isModalOpen && <ManualTransactionModal onClose={() => setIsModalOpen(false)} onSuccess={handleAddTransactionSuccess} />}
        </div>
    );
};

const TransactionItem: React.FC<{ transaction: FullTransaction, onNavigate: (view: View, id?: string) => void }> = ({ transaction, onNavigate }) => {
    const isIncome = ['deposit', 'earning'].includes(transaction.type) || (transaction.type === 'adjustment' && transaction.amount > 0);
    // FIX: Add 'adjustment' type to handle all transaction types and prevent crashes.
    const details = {
        deposit: { icon: ArrowDownCircleIcon, color: 'text-green-500', bg: 'bg-green-50' },
        earning: { icon: ArrowUpIcon, color: 'text-green-500', bg: 'bg-green-50' },
        fee: { icon: PaperAirplaneIcon, color: 'text-orange-500', bg: 'bg-orange-50' },
        subscription: { icon: StarIcon, color: 'text-purple-500', bg: 'bg-purple-50' },
        adjustment: { icon: CurrencyDollarIcon, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    }[transaction.type];
    
    if (!details) return null;
    const Icon = details.icon;
    const userName = (transaction.profiles.role === 'provider' ? transaction.profiles.company_name : transaction.profiles.name) || 'Bilinmeyen Kullanıcı';
    
    return (
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50/50">
            <div className="flex items-center mb-2 sm:mb-0">
                <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center mr-4 ${details.bg}`}>
                    <Icon className={`h-6 w-6 ${details.color}`} />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">{transaction.description}</p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 cursor-pointer" onClick={() => onNavigate('adminUserDetail', transaction.user_id)}>
                        <UserIcon className="h-4 w-4" />
                        <span className="hover:underline">{userName}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end sm:gap-6 mt-2 sm:mt-0">
                <p className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleString('tr-TR')}</p>
                <p className={`font-bold text-lg ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                    {isIncome ? '+' : ''}{transaction.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
            </div>
        </div>
    );
};

const ManualTransactionModal: React.FC<{ onClose: () => void, onSuccess: () => void }> = ({ onClose, onSuccess }) => {
    const [users, setUsers] = React.useState<Profile[]>([]);
    const [selectedUser, setSelectedUser] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [reason, setReason] = React.useState('');
    const [type, setType] = React.useState<'deposit' | 'withdrawal'>('deposit');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        // FIX: The `Profile` type requires the `role` property. Added `role` to the select query to ensure the fetched user data matches the expected type.
        supabase.from('profiles').select('id, name, company_name, role').then(({ data }) => setUsers(data as Profile[] || []));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !amount || !reason) {
            setError('Lütfen tüm alanları doldurun.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const numericAmount = parseFloat(amount) * (type === 'deposit' ? 1 : -1);
            
            const { data: profile, error: fetchError } = await supabase.from('profiles').select('balance').eq('id', selectedUser).single();
            if (fetchError) throw fetchError;
            
            const newBalance = (profile.balance || 0) + numericAmount;

            const { error: updateError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', selectedUser);
            if (updateError) throw updateError;
            
            const { error: transactionError } = await supabase.from('transactions').insert({
                user_id: selectedUser,
                amount: numericAmount,
                type: 'adjustment',
                description: `Manuel Ayarlama: ${reason}`,
            });
            if (transactionError) throw transactionError;

            onSuccess();
        } catch (err) {
            setError('İşlem başarısız: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Manuel Finansal İşlem</h3>
                    <button onClick={onClose}><XCircleIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Kullanıcı</label>
                        <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg mt-1">
                            <option value="">Kullanıcı Seçin</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.company_name || u.name}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setType('deposit')} className={`flex-1 py-2 rounded-lg ${type === 'deposit' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Bakiye Ekle</button>
                        <button type="button" onClick={() => setType('withdrawal')} className={`flex-1 py-2 rounded-lg ${type === 'withdrawal' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}>Bakiye Düş</button>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Tutar (TL)</label>
                        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg mt-1" />
                    </div>
                     <div>
                        <label className="text-sm font-medium">Açıklama / Sebep</label>
                        <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg mt-1" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300">İptal</button>
                        <button type="submit" disabled={loading} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                            {loading && <LoaderIcon className="h-4 w-4 animate-spin" />} İşlemi Onayla
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default AdminTransactions;