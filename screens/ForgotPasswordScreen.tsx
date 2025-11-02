import * as React from 'react';
import { LoaderIcon, EnvelopeIcon, ArrowLeftIcon, CheckBadgeIcon } from '../components/icons';
import { supabase } from '../utils/supabaseClient';

interface ForgotPasswordScreenProps {
    onBack: () => void;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onBack }) => {
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const handleSendLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });

        if (error) {
            setError(error.message);
        } else {
            setSuccess(`Şifre sıfırlama linki ${email} adresine gönderildi. Lütfen gelen kutunuzu kontrol edin.`);
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-gray-50 to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-black z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-md">
                <button onClick={onBack} className="absolute top-6 left-6 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition-colors">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>

                <div className="text-center mb-8">
                    <span className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">ZeminBul<span className="font-semibold text-gray-600 dark:text-gray-300">.com</span></span>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-6">Şifrenizi mi Unuttunuz?</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Endişelenmeyin, olur böyle şeyler! Sıfırlama linki için e-postanızı girin.</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                    {success ? (
                        <div className="text-center">
                            <CheckBadgeIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Link Gönderildi!</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">{success}</p>
                            <button onClick={onBack} className="mt-6 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors">
                                Giriş Ekranına Dön
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSendLink} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300">E-posta Adresi</label>
                                <div className="relative mt-2">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                        <EnvelopeIcon className="h-5 w-5" />
                                    </span>
                                    <input 
                                        id="email"
                                        className="w-full text-base py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:border-blue-500" 
                                        type="email" 
                                        placeholder="email@adresiniz.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                            <div className="pt-2">
                                <button type="submit" className="w-full flex justify-center items-center bg-blue-600 text-white p-4 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-blue-700 disabled:opacity-75" disabled={loading}>
                                    {loading ? <LoaderIcon className="h-6 w-6 animate-spin"/> : 'Sıfırlama Linki Gönder'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordScreen;