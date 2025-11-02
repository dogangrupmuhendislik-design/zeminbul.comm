import * as React from 'react';
import { LoaderIcon } from '../components/icons';
import { supabase } from '../utils/supabaseClient';

interface ResetPasswordScreenProps {
    onResetSuccess: () => void;
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onResetSuccess }) => {
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            return;
        }
        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
        } else {
            setSuccess("Şifreniz başarıyla güncellendi. Giriş ekranına yönlendiriliyorsunuz...");
            setTimeout(() => {
                onResetSuccess();
            }, 2500);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                     <div className="mb-4">
                        <span className="text-5xl font-extrabold tracking-tight text-gray-800">ZeminBul<span className="font-semibold text-gray-600">.com</span></span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Yeni Şifre Belirle</h1>
                    <p className="mt-2 text-gray-600">Lütfen hesabınız için yeni bir şifre oluşturun.</p>
                </div>
                
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    {success ? (
                         <p className="text-green-600 text-center bg-green-50 p-4 rounded-lg">{success}</p>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="text-sm font-bold text-gray-700 tracking-wide">Yeni Şifre</label>
                                <input 
                                    className="w-full text-base py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mt-1" 
                                    type="password" 
                                    placeholder="********"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                             <div>
                                <label className="text-sm font-bold text-gray-700 tracking-wide">Yeni Şifreyi Onayla</label>
                                <input 
                                    className="w-full text-base py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mt-1" 
                                    type="password" 
                                    placeholder="********"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div>
                                <button type="submit" className="w-full flex justify-center items-center bg-blue-600 text-gray-100 p-4 rounded-full tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-blue-700 disabled:opacity-75" disabled={loading}>
                                    {loading ? <LoaderIcon className="h-6 w-6 animate-spin"/> : 'Şifreyi Güncelle'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ResetPasswordScreen;