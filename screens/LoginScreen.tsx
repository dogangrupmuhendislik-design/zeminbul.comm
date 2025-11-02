
import * as React from 'react';
import { UserRole } from '../types';
import { BriefcaseIcon, UserIcon, LoaderIcon, EnvelopeIcon, LockClosedIcon, ArrowLeftIcon } from '../components/icons';
import { supabase, isConfigured } from '../utils/supabaseClient';


interface LoginScreenProps {
  onLoginSuccess: (role: UserRole) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onCancel: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onNavigateToRegister, onNavigateToForgotPassword, onCancel }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured) {
        setError("Supabase bağlantı ayarları eksik! Lütfen projenin ana dizininde .env dosyasının olduğundan ve VITE_SUPABASE_URL ile VITE_SUPABASE_ANON_KEY değerlerinin doğru girildiğinden emin olun.");
        return;
    }

    setLoading(true);
    setError(null);

    try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
             if (signInError.message === 'Failed to fetch') {
                 throw new Error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
             }
             throw signInError;
        }
        
        if (data.user) {
           const { data: profile, error: profileError } = await supabase
             .from('profiles')
             .select('role')
             .eq('id', data.user.id)
             .single();
            
            if (profileError) {
                 console.error("Profile fetch error:", profileError);
                 setError("Kullanıcı profili yüklenemedi.");
            } else if (profile) {
                onLoginSuccess(profile.role);
            } else {
                setError("Kullanıcı profili bulunamadı.");
            }
        }
    } catch (err: any) {
        setError(err.message || "Giriş yapılırken bir hata oluştu.");
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-gray-50 to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-black z-50 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md">
        <button onClick={onCancel} className="absolute top-6 left-6 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full transition-colors">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>

        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100">ZeminBul<span className="font-semibold text-gray-600 dark:text-gray-300">.com</span></span>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-6">Tekrar hoş geldiniz!</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Hesabınıza giriş yapın.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">E-posta Adresi</label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <EnvelopeIcon className="h-5 w-5" />
                </span>
                <input 
                  className="w-full text-base py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:border-blue-500" 
                  type="email" 
                  placeholder="email@adresiniz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Şifre</label>
                <button 
                    type="button" 
                    onClick={onNavigateToForgotPassword} 
                    className="text-sm text-blue-600 hover:underline focus:outline-none font-semibold dark:text-blue-400"
                >
                    Şifremi Unuttum?
                </button>
              </div>
              <div className="relative mt-2">
                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <LockClosedIcon className="h-5 w-5" />
                </span>
                <input 
                  className="w-full text-base py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:border-blue-500" 
                  type="password" 
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center font-semibold">{error}</p>
                </div>
            )}
            <div className="pt-2">
              <button type="submit" className="w-full flex justify-center items-center bg-blue-600 text-white p-4 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-blue-700 disabled:opacity-75" disabled={loading}>
                {loading ? <LoaderIcon className="h-6 w-6 animate-spin"/> : 'Giriş Yap'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
                Hesabınız yok mu? <button onClick={onNavigateToRegister} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Kayıt Olun</button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
