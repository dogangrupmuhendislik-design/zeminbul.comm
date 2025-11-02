
import * as React from 'react';
import { UserRole } from '../types';
import { LoaderIcon, EnvelopeIcon, LockClosedIcon, ArrowLeftIcon, UserIcon, BriefcaseIcon } from '../components/icons';
import { supabase, isConfigured } from '../utils/supabaseClient';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
  onCancel: () => void;
  onNavigateToTerms: () => void;
  onNavigateToPolicy: () => void;
  onNavigateToServicePolicy: () => void;
  initialRole?: UserRole;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegisterSuccess, onNavigateToLogin, onCancel, onNavigateToTerms, onNavigateToPolicy, onNavigateToServicePolicy, initialRole = 'customer' }) => {
  const [role, setRole] = React.useState<UserRole>(initialRole);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfigured) {
        setError("Supabase bağlantı ayarları eksik! Lütfen projenin ana dizininde .env dosyasının olduğundan ve VITE_SUPABASE_URL ile VITE_SUPABASE_ANON_KEY değerlerinin doğru girildiğinden emin olun.");
        return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor!");
      return;
    }
    if (!termsAccepted) {
      setError("Kayıt olmak için kullanım koşullarını ve gizlilik politikasını kabul etmelisiniz.");
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
        // GÜNCELLEME: Verileri doğrudan 'options.data' içine koyuyoruz.
        // Bu sayede Supabase Trigger'ı bu verileri okuyup profili otomatik oluşturacak.
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: role,
                    name: role === 'customer' ? name : '',
                    company_name: role === 'provider' ? name : '',
                }
            }
        });

        if (signUpError) {
            if (signUpError.message === 'Failed to fetch') {
                 throw new Error("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı ve .env dosyasındaki URL ayarlarını kontrol edin.");
            }
            throw signUpError;
        }

        if (user) {
            // Manuel profil oluşturma kodu (insert into profiles) KALDIRILDI.
            // Profil oluşturma işini tamamen veritabanındaki Trigger'a bırakıyoruz.
            // Bu, "new row violates RLS policy" hatasını çözer.
            onRegisterSuccess();
        }
    } catch (err: any) {
        console.error("Registration error:", err);
        setError(err.message || "Kayıt işlemi sırasında beklenmedik bir hata oluştu.");
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-6">Yeni Hesap Oluştur</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Projeniz için en iyi firmaları bulun.</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleRegister} className="space-y-5">
            
            <div className="relative grid grid-cols-2 gap-2 p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                <span className={`absolute top-1.5 h-10 bg-white dark:bg-gray-900 rounded-full shadow-md transition-transform duration-300 ease-in-out ${role === 'customer' ? 'left-1.5 w-[calc(50%-6px)]' : 'left-[calc(50%+3px)] w-[calc(50%-6px)]'}`}></span>
                <button type="button" onClick={() => setRole('customer')} className="relative z-10 py-2 rounded-full text-sm font-semibold transition-colors duration-300">
                    Müşteriyim
                </button>
                <button type="button" onClick={() => setRole('provider')} className="relative z-10 py-2 rounded-full text-sm font-semibold transition-colors duration-300">
                    Firmayım
                </button>
            </div>

            <InputWithIcon
                icon={role === 'customer' ? UserIcon : BriefcaseIcon}
                label={role === 'customer' ? 'Ad Soyad' : 'Firma Adı'}
                type="text"
                placeholder={role === 'customer' ? 'Ahmet Yılmaz' : 'Geoteknik A.Ş.'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            <InputWithIcon
                icon={EnvelopeIcon}
                label="E-posta Adresi"
                type="email"
                placeholder="email@adresiniz.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <InputWithIcon
                icon={LockClosedIcon}
                label="Şifre"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <InputWithIcon
                icon={LockClosedIcon}
                label="Şifreyi Onayla"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
            />
            
            <div className="flex items-start">
                <input id="terms" name="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"/>
                <div className="ml-3 text-sm">
                    <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                        <button type="button" onClick={(e) => { e.preventDefault(); onNavigateToTerms(); }} className="text-blue-600 hover:underline">Kullanım Koşullarını</button>,{' '}
                        <button type="button" onClick={(e) => { e.preventDefault(); onNavigateToPolicy(); }} className="text-blue-600 hover:underline">Gizlilik Politikasını</button> ve{' '}
                        <button type="button" onClick={(e) => { e.preventDefault(); onNavigateToServicePolicy(); }} className="text-blue-600 hover:underline">Hizmet Politikasını</button> okudum ve kabul ediyorum.
                    </label>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm text-center font-semibold">{error}</p>
                </div>
            )}

            <div className="pt-2">
              <button type="submit" className="w-full flex justify-center items-center bg-blue-600 text-white p-4 rounded-lg tracking-wide font-semibold shadow-lg cursor-pointer transition ease-in duration-300 hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
                {loading ? <LoaderIcon className="h-6 w-6 animate-spin"/> : 'Hesap Oluştur'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
              Zaten bir hesabınız var mı? <button onClick={onNavigateToLogin} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Giriş Yapın</button>
          </p>
        </div>
      </div>
    </div>
  );
};

const InputWithIcon: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon: React.FC<any>, label: string }> = ({ icon: Icon, label, ...props }) => (
    <div>
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</label>
        <div className="relative mt-2">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Icon className="h-5 w-5" />
            </span>
            <input 
                className="w-full text-base py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:border-blue-500" 
                {...props}
            />
        </div>
    </div>
);


export default RegisterScreen;
