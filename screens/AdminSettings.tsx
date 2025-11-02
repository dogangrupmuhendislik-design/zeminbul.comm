import * as React from 'react';
import { View, Service, ContactSettings } from '../types';
import { CurrencyDollarIcon, Cog6ToothIcon, PaperAirplaneIcon, PlusCircleIcon, XCircleIcon, LoaderIcon, EnvelopeIcon } from '../components/icons';
import { supabase } from '../utils/supabaseClient';
import { useCategories } from '../contexts/CategoriesContext';
import { ICON_MAP } from '../constants';

interface AdminSettingsProps {
    onNavigate: (view: View, id?: string) => void;
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onNavigate }) => {
    const [settings, setSettings] = React.useState<Record<string, string>>({
        commission_rate: '0.1',
        pro_monthly_price: '199',
        pro_yearly_price: '1899',
        announcement: ''
    });
    
    // Contact Settings State
    const [contactSettings, setContactSettings] = React.useState<Partial<ContactSettings>>({
        address: '',
        email: '',
        live_support_text: '',
        subjects: []
    });
    const [contactSubjectsStr, setContactSubjectsStr] = React.useState('');
    
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    
    const { categories, refetchCategories } = useCategories();
    const [localCategories, setLocalCategories] = React.useState<Service[]>([]);

    React.useEffect(() => {
        setLocalCategories(JSON.parse(JSON.stringify(categories))); // Deep copy
    }, [categories]);
    
    React.useEffect(() => {
        const fetchContactSettings = async () => {
            const { data, error } = await supabase
                .from('contact_settings')
                .select('*')
                .maybeSingle(); // Use maybeSingle to avoid error if empty
            
            if (data) {
                setContactSettings(data);
                setContactSubjectsStr(data.subjects ? data.subjects.join(', ') : '');
            } else if (error) {
                console.warn("Could not fetch contact settings:", error.message);
            }
        };
        fetchContactSettings();
    }, []);

    const handleSettingChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleContactSettingChange = (key: keyof ContactSettings, value: any) => {
        setContactSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveSettings = async (keysToSave: string[]) => {
        setSaving(true);
        console.log("DEV MODE: Simulating save for settings:", keysToSave.reduce((acc, key) => ({...acc, [key]: settings[key]}), {}));
        // Simulate API call as 'platform_settings' table does not exist
        setTimeout(() => {
            alert('Ayarlar kaydedildi! (Simülasyon)');
            setSaving(false);
        }, 1000);
    };
    
    const handleSaveContactSettings = async () => {
        setSaving(true);
        try {
            // Prepare subjects array
            const subjectsArray = contactSubjectsStr.split(',').map(s => s.trim()).filter(s => s !== '');
            
            const payload = {
                address: contactSettings.address,
                email: contactSettings.email,
                live_support_text: contactSettings.live_support_text,
                subjects: subjectsArray
            };

            // Check if a row exists, if so update it, else insert
            // Since we fetched it earlier, if we have an ID, we update.
            // However, usually there is only one row. We can just upsert based on an ID or create a new one.
            // A simple way for single-row config tables:
            const { data: existing } = await supabase.from('contact_settings').select('id').maybeSingle();
            
            let error;
            if (existing) {
                const { error: updateError } = await supabase
                    .from('contact_settings')
                    .update(payload)
                    .eq('id', existing.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('contact_settings')
                    .insert(payload);
                error = insertError;
            }

            if (error) throw error;
            alert("İletişim bilgileri güncellendi.");

        } catch (err: any) {
            console.error("Error saving contact settings:", err);
            alert("İletişim bilgileri kaydedilirken hata oluştu: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleAddCategory = () => {
        setLocalCategories([...localCategories, { id: `new-${Date.now()}`, name: '', description: '', icon_name: 'DrillIcon' }]);
    };

    const handleRemoveCategory = (id: string) => {
        if (!window.confirm("Bu kategoriyi silmek istediğinizden emin misiniz? (Simülasyon)")) return;
        setLocalCategories(localCategories.filter(c => c.id !== id));
        alert('Kategori silindi! (Simülasyon)');
    };

    const handleCategoryChange = (id: string, field: keyof Service, value: string) => {
        setLocalCategories(localCategories.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));
    };

    const handleSaveCategories = async () => {
        setSaving(true);
        console.log("DEV MODE: Simulating save for categories:", localCategories);
        // Simulate API call as 'services' table does not exist
        setTimeout(() => {
             alert('Kategoriler kaydedildi! (Simülasyon)');
             setSaving(false);
        }, 1000);
    };


    return (
        <div className="space-y-6">
            <SettingsSection
                title="Finansal Ayarlar"
                icon={CurrencyDollarIcon}
                description="Platformun gelir modelini yönetin."
            >
                <div className="space-y-4">
                    <SettingInput 
                        label="Teklif Komisyon Oranı (%)"
                        value={settings['commission_rate'] || ''}
                        onChange={e => handleSettingChange('commission_rate', e.target.value)}
                        type="number"
                        step="0.01"
                        description="Her başarılı tekliften alınacak yüzde."
                    />
                    <SettingInput 
                        label="Pro Üyelik (Aylık, TL)"
                        value={settings['pro_monthly_price'] || ''}
                        onChange={e => handleSettingChange('pro_monthly_price', e.target.value)}
                        type="number"
                    />
                    <SettingInput 
                        label="Pro Üyelik (Yıllık, TL)"
                        value={settings['pro_yearly_price'] || ''}
                        onChange={e => handleSettingChange('pro_yearly_price', e.target.value)}
                        type="number"
                    />
                     <button 
                        onClick={() => handleSaveSettings(['commission_rate', 'pro_monthly_price', 'pro_yearly_price'])}
                        disabled={saving}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                     >
                        {saving && <LoaderIcon className="h-4 w-4 animate-spin" />}
                        Finansal Ayarları Kaydet
                    </button>
                </div>
            </SettingsSection>

            <SettingsSection
                title="İletişim Bilgileri Yönetimi"
                icon={EnvelopeIcon}
                description="İletişim sayfasında görünen bilgileri düzenleyin."
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SettingInput 
                            label="Adres"
                            value={contactSettings.address || ''}
                            onChange={e => handleContactSettingChange('address', e.target.value)}
                            placeholder="Şirket adresi..."
                        />
                        <SettingInput 
                            label="E-posta"
                            value={contactSettings.email || ''}
                            onChange={e => handleContactSettingChange('email', e.target.value)}
                            placeholder="destek@zeminbul.com"
                        />
                    </div>
                     <SettingInput 
                        label="Canlı Destek Metni (Saatler)"
                        value={contactSettings.live_support_text || ''}
                        onChange={e => handleContactSettingChange('live_support_text', e.target.value)}
                        placeholder="Örn: Hafta içi 09:00 - 18:00"
                    />
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">İletişim Konuları (Virgülle ayırın)</label>
                         <textarea 
                            value={contactSubjectsStr}
                            onChange={e => setContactSubjectsStr(e.target.value)}
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="İstek, Öneri, Şikayet, Diğer"
                        />
                         <p className="mt-1 text-xs text-gray-500">İletişim formundaki konu seçenekleri.</p>
                    </div>

                    <button 
                        onClick={handleSaveContactSettings}
                        disabled={saving}
                        className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                     >
                        {saving && <LoaderIcon className="h-4 w-4 animate-spin" />}
                        İletişim Bilgilerini Kaydet
                    </button>
                </div>
            </SettingsSection>
            
            <SettingsSection
                title="Kategori Yönetimi"
                icon={Cog6ToothIcon}
                description="Hizmet kategorilerini düzenleyin."
            >
                <div className="space-y-3">
                    {localCategories.map(service => (
                        <div key={service.id} className="p-3 bg-gray-50 rounded-lg border space-y-2">
                           <div className="flex justify-between items-start">
                                <input 
                                    value={service.name} 
                                    onChange={e => handleCategoryChange(service.id, 'name', e.target.value)}
                                    className="font-semibold text-lg border-b w-full"
                                />
                               <button onClick={() => handleRemoveCategory(service.id)} className="p-1 text-gray-400 hover:text-red-500"><XCircleIcon className="h-5 w-5"/></button>
                           </div>
                           <textarea 
                                value={service.description}
                                onChange={e => handleCategoryChange(service.id, 'description', e.target.value)}
                                className="text-sm text-gray-600 w-full border-b"
                                rows={2}
                           />
                           <select 
                                value={service.icon_name} 
                                onChange={e => handleCategoryChange(service.id, 'icon_name', e.target.value)}
                                className="text-sm text-gray-600 w-full border-b bg-transparent"
                            >
                                {Object.keys(ICON_MAP).map(iconName => (
                                    <option key={iconName} value={iconName}>{iconName}</option>
                                ))}
                           </select>
                        </div>
                    ))}
                </div>
                 <button onClick={handleAddCategory} className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:border-gray-400 transition-colors">
                    <PlusCircleIcon className="h-5 w-5" />
                    Yeni Kategori Ekle
                </button>
                <button 
                    onClick={handleSaveCategories}
                    disabled={saving}
                    className="mt-4 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {saving && <LoaderIcon className="h-4 w-4 animate-spin" />}
                    Kategorileri Kaydet
                </button>
            </SettingsSection>

            <SettingsSection
                title="Duyuru Sistemi"
                icon={PaperAirplaneIcon}
                description="Tüm kullanıcılara gösterilecek bir duyuru yayınlayın."
            >
                <textarea
                    rows={4}
                    value={settings['announcement'] || ''}
                    onChange={e => handleSettingChange('announcement', e.target.value)}
                    placeholder="Örn: Platformda 28 Temmuz Pazar günü 02:00-04:00 saatleri arasında bakım çalışması yapılacaktır."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                 <button 
                    onClick={() => handleSaveSettings(['announcement'])}
                    disabled={saving}
                    className="mt-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {saving && <LoaderIcon className="h-4 w-4 animate-spin" />}
                    Duyuruyu Yayınla
                </button>
            </SettingsSection>
        </div>
    );
};

interface SettingsSectionProps {
    title: string;
    description: string;
    icon: React.FC<any>;
    children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, description, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-start mb-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-4">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <p className="text-gray-500">{description}</p>
            </div>
        </div>
        <div className="pt-4 border-t">
            {children}
        </div>
    </div>
);

interface SettingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
}

const SettingInput: React.FC<SettingInputProps> = ({ label, description, className, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input 
            {...props}
            className={`mt-1 w-full p-2 border border-gray-300 rounded-lg ${className || ''}`}
        />
        {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    </div>
);

export default AdminSettings;