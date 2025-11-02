import * as React from 'react';
// import { supabase } from '../utils/supabaseClient';
import { LoaderIcon, ChevronRightIcon, ShieldCheckIcon, DocumentCheckIcon, TrashIcon, BriefcaseIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
// FIX: Use categories from context instead of a static import.
import { useCategories } from '../contexts/CategoriesContext';
import { View, Service } from '../types';

interface SettingsScreenProps {
    onBack: () => void;
    onLogout: () => void;
    onNavigate: (view: View) => void;
}

interface NotificationPreferences {
    email: {
        newJobs: {
            enabled: boolean;
            categories: string[]; // Array of service IDs
        };
        bidUpdates: boolean;
        messages: boolean;
    };
    push: {
        newJobs: {
            enabled: boolean;
            categories: string[];
        };
        bidUpdates: boolean;
        messages: boolean;
    };
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onLogout, onNavigate }) => {
    const { categories } = useCategories();
    const [prefs, setPrefs] = React.useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    React.useEffect(() => {
        // Initialize preferences once categories are loaded
        if (categories.length > 0) {
            const initialPrefs: NotificationPreferences = {
                email: {
                    newJobs: { enabled: true, categories: categories.map(s => s.id) },
                    bidUpdates: true,
                    messages: true,
                },
                push: {
                    newJobs: { enabled: true, categories: categories.map(s => s.id) },
                    bidUpdates: false,
                    messages: true,
                },
            };
            setPrefs(initialPrefs);
            setLoading(false);
        }
    }, [categories]);
    
    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        // DEV MODE: Simulate saving
        console.log("DEV MODE: Saving settings:", prefs);
        setTimeout(() => {
            setSuccess("Ayarlar başarıyla kaydedildi!");
            setSaving(false);
            setTimeout(() => setSuccess(null), 2000);
        }, 1000);
    };

    const handleMainToggle = (category: 'email' | 'push', key: 'newJobs' | 'bidUpdates' | 'messages') => {
        if (!prefs) return;
        setPrefs(prev => {
            if (!prev) return null;
            const currentVal = prev[category][key];
            if (typeof currentVal === 'boolean') {
                return {
                    ...prev,
                    [category]: {
                        ...prev[category],
                        [key]: !currentVal,
                    },
                };
            } else { // It's the newJobs object
                return {
                    ...prev,
                    [category]: {
                        ...prev[category],
                        newJobs: {
                            ...prev[category].newJobs,
                            enabled: !prev[category].newJobs.enabled,
                        }
                    }
                }
            }
        });
    };
    
    const handleCategoryToggle = (category: 'email' | 'push', serviceId: string) => {
        if (!prefs) return;
        setPrefs(prev => {
            if (!prev) return null;
            const currentCategories = prev[category].newJobs.categories;
            const newCategories = currentCategories.includes(serviceId)
                ? currentCategories.filter(id => id !== serviceId)
                : [...currentCategories, serviceId];
            
            return {
                ...prev,
                [category]: {
                    ...prev[category],
                    newJobs: {
                        ...prev[category].newJobs,
                        categories: newCategories,
                    }
                }
            };
        });
    };

    const handleSelectAll = (category: 'email' | 'push') => {
        if (!prefs) return;
        const areAllEnabled = 
            prefs[category].newJobs.enabled &&
            prefs[category].bidUpdates &&
            prefs[category].messages;
            
        const newState = !areAllEnabled;

        setPrefs(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [category]: {
                    ...prev[category],
                    newJobs: {
                        ...prev[category].newJobs,
                        enabled: newState,
                    },
                    bidUpdates: newState,
                    messages: newState,
                }
            }
        });
    };

    if (loading || !prefs) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <DrillingRigLoader />
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="p-4 border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center">
                <button onClick={onBack} className="text-gray-600 p-2 rounded-full hover:bg-gray-100 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-center text-gray-900 flex-grow">Ayarlar</h1>
                <div className="w-10"></div>
            </header>
            <main className="p-4 space-y-6">
                {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center">{error}</div>}
                {success && <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm text-center">{success}</div>}
                
                <SettingsSection title="E-posta Bildirimleri">
                    <ToggleRow 
                        label="Tümünü Aç / Kapat"
                        description="Tüm e-posta bildirimlerini etkinleştirin veya devre dışı bırakın."
                        enabled={prefs.email.newJobs.enabled && prefs.email.bidUpdates && prefs.email.messages}
                        onChange={() => handleSelectAll('email')}
                        disabled={saving}
                    />
                    <ToggleRow 
                        label="Yeni İş İlanları"
                        description="İlgi alanlarınıza uygun yeni iş ilanları hakkında e-posta alın."
                        enabled={prefs.email.newJobs.enabled}
                        onChange={() => handleMainToggle('email', 'newJobs')}
                        disabled={saving}
                    />
                     {prefs.email.newJobs.enabled && (
                        <div className="pl-6 py-3 bg-gray-50/70 -mx-4 px-4 border-y">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Kategori Bildirimleri</h4>
                            <div className="space-y-1">
                                {categories.map(service => (
                                    <ToggleRow 
                                        key={`${service.id}-email`}
                                        label={service.name}
                                        enabled={prefs.email.newJobs.categories.includes(service.id)}
                                        onChange={() => handleCategoryToggle('email', service.id)}
                                        disabled={saving}
                                        isSubItem={true}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <ToggleRow 
                        label="Teklif Güncellemeleri"
                        description="Tekliflerinizin durumu değiştiğinde (kabul, ret) e-posta alın."
                        enabled={prefs.email.bidUpdates}
                        onChange={() => handleMainToggle('email', 'bidUpdates')}
                        disabled={saving}
                    />
                     <ToggleRow 
                        label="Yeni Mesajlar"
                        description="Bir firmadan veya müşteriden yeni mesaj aldığınızda e-posta alın."
                        enabled={prefs.email.messages}
                        onChange={() => handleMainToggle('email', 'messages')}
                        disabled={saving}
                    />
                </SettingsSection>

                 <SettingsSection title="Anlık Bildirimler">
                    <ToggleRow 
                        label="Tümünü Aç / Kapat"
                        description="Tüm anlık bildirimleri etkinleştirin veya devre dışı bırakın."
                        enabled={prefs.push.newJobs.enabled && prefs.push.bidUpdates && prefs.push.messages}
                        onChange={() => handleSelectAll('push')}
                        disabled={saving}
                    />
                    <ToggleRow 
                        label="Yeni İş İlanları"
                        description="İlgi alanlarınıza uygun yeni iş ilanları hakkında anlık bildirim alın."
                        enabled={prefs.push.newJobs.enabled}
                        onChange={() => handleMainToggle('push', 'newJobs')}
                        disabled={saving}
                    />
                    {prefs.push.newJobs.enabled && (
                        <div className="pl-6 py-3 bg-gray-50/70 -mx-4 px-4 border-y">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Kategori Bildirimleri</h4>
                            <div className="space-y-1">
                                {categories.map(service => (
                                    <ToggleRow 
                                        key={`${service.id}-push`}
                                        label={service.name}
                                        enabled={prefs.push.newJobs.categories.includes(service.id)}
                                        onChange={() => handleCategoryToggle('push', service.id)}
                                        disabled={saving}
                                        isSubItem={true}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    <ToggleRow 
                        label="Teklif Güncellemeleri"
                        description="Tekliflerinizin durumu değiştiğinde anlık bildirim alın."
                        enabled={prefs.push.bidUpdates}
                        onChange={() => handleMainToggle('push', 'bidUpdates')}
                        disabled={saving}
                    />
                     <ToggleRow 
                        label="Yeni Mesajlar"
                        description="Yeni mesaj aldığınızda anlık bildirim alın."
                        enabled={prefs.push.messages}
                        onChange={() => handleMainToggle('push', 'messages')}
                        disabled={saving}
                    />
                </SettingsSection>

                <SettingsSection title="Veri ve Gizlilik">
                    <SettingsRow label="Gizlilik Politikası" icon={ShieldCheckIcon} onClick={() => onNavigate('privacyPolicy')} />
                    <SettingsRow label="Kullanım Koşulları" icon={DocumentCheckIcon} onClick={() => onNavigate('termsOfUse')} />
                    <SettingsRow label="Hizmet Politikası" icon={BriefcaseIcon} onClick={() => onNavigate('hizmetPolitikasi')} />
                    <DestructiveSettingsRow label="Hesabı Sil" icon={TrashIcon} onClick={() => { if(window.confirm('Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) { alert('Hesap silme işlemi simüle edildi.'); onLogout(); } }} />
                </SettingsSection>

                <div className="pt-4 flex justify-end">
                     <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? <><LoaderIcon className="h-5 w-5 animate-spin" /> Kaydediliyor...</> : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </main>
        </div>
    );
};

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-1">{title}</h2>
        <div className="divide-y divide-gray-200">
            {React.Children.map(children, (child) => (
                child ? <div className="child-wrapper">{child}</div> : null
            ))}
        </div>
        <style>{`.child-wrapper:first-child .toggle-row { border-top: none; } .child-wrapper:last-child .toggle-row { border-bottom: none; }`}</style>
    </div>
);

interface ToggleRowProps {
    label: string;
    description?: string;
    enabled: boolean;
    onChange: (enabled: boolean) => void;
    disabled?: boolean;
    isSubItem?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ label, description, enabled, onChange, disabled, isSubItem = false }) => {
    return (
        <div className={`flex justify-between items-center ${isSubItem ? 'py-3' : 'py-4'}`}>
            <div className="pr-4">
                <p className={`font-semibold ${isSubItem ? 'text-sm' : ''} text-gray-800`}>{label}</p>
                {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </div>
            <button
                type="button"
                className={`${enabled ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50`}
                role="switch"
                aria-checked={enabled}
                onClick={() => onChange(!enabled)}
                disabled={disabled}
            >
                <span className={`${enabled ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
            </button>
        </div>
    );
};

const SettingsRow: React.FC<{label: string, sublabel?: string, icon: React.FC<any>, onClick?: () => void}> = ({label, sublabel, icon: Icon, onClick}) => (
     <div
        onClick={onClick}
        className={`flex justify-between items-center py-3 border-b last:border-b-0 transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-50 -mx-4 px-4' : ''}`}
     >
        <div className="flex items-center">
            <Icon className="h-6 w-6 text-gray-500 mr-3" />
            <div>
                <p className="font-semibold">{label}</p>
                {sublabel && <p className="text-gray-500 text-sm">{sublabel}</p>}
            </div>
        </div>
        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
    </div>
);

const DestructiveSettingsRow: React.FC<{label: string, icon: React.FC<any>, onClick?: () => void}> = ({label, icon: Icon, onClick}) => (
     <div
        onClick={onClick}
        className={`flex justify-between items-center py-3 border-b last:border-b-0 transition-colors ${onClick ? 'cursor-pointer hover:bg-red-50 -mx-4 px-4' : ''}`}
     >
        <div className="flex items-center">
            <Icon className="h-6 w-6 text-red-500 mr-3" />
            <div>
                <p className="font-semibold text-red-600">{label}</p>
            </div>
        </div>
        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
    </div>
);


export default SettingsScreen;