
import { createClient } from '@supabase/supabase-js';

// Safely access environment variables to prevent runtime errors if env is not defined
const env = (import.meta as any).env || {};

// GÜVENLİK: Anahtarlar sadece environment variable'lardan alınır.
// Asla kaynak koda hardcoded (açık metin) olarak yazılmamalıdır.
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Helper to check if Supabase is properly configured
export const isConfigured = !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co';

if (!isConfigured) {
    console.warn(
        'Supabase URL veya Anon Key bulunamadı! Lütfen .env dosyanızı kontrol edin.\n' +
        'Gerekli değişkenler: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY'
    );
}

// Crash önleme: Eğer env değişkenleri yoksa, boş string yerine geçerli formatta
// bir placeholder kullanarak uygulamanın beyaz ekranda çökmesini engelliyoruz.
// Bu durumda ağ istekleri başarısız olacaktır ama uygulama açılacaktır.
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(url, key);
