
import * as React from 'react';
import { UserRole, PortfolioItem, Machine, UploadedDocument } from '../types';
import { supabase } from '../utils/supabaseClient';
import { LoaderIcon, XCircleIcon, PlusCircleIcon, BuildingOffice2Icon, UserIcon, CheckBadgeIcon, ClockIcon, MapPinIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { useCategories } from '../contexts/CategoriesContext';
import { ICON_MAP } from '../constants';

interface EditProfileScreenProps {
    userRole: UserRole;
    onBack: () => void;
}

const documentTypes: { id: UploadedDocument['type']; name: string }[] = [
    { id: 'tax_certificate', name: 'Vergi Levhası' },
    { id: 'trade_registry', name: 'Ticaret Sicil Gazetesi' },
    { id: 'qualification_certificate', name: 'Mesleki Yeterlilik Belgesi' },
];

const REGIONS = [
    'Marmara Bölgesi', 'Ege Bölgesi', 'Akdeniz Bölgesi', 
    'İç Anadolu Bölgesi', 'Karadeniz Bölgesi', 
    'Doğu Anadolu Bölgesi', 'Güneydoğu Anadolu Bölgesi'
];

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ userRole, onBack }) => {
    const [profile, setProfile] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);
    const { categories } = useCategories();
    
    // Common fields
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');

    // Customer specific fields
    const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

    // Provider specific fields
    const [description, setDescription] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [website, setWebsite] = React.useState('');
    const [portfolio, setPortfolio] = React.useState<PortfolioItem[]>([]);
    const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
    const [selectedServices, setSelectedServices] = React.useState<string[]>([]);
    const [certifications, setCertifications] = React.useState<string[]>([]);
    const [awards, setAwards] = React.useState<string[]>([]);
    const [serviceRegions, setServiceRegions] = React.useState<string[]>([]);
    const [machinePark, setMachinePark] = React.useState<Machine[]>([]);
    const [uploadedDocuments, setUploadedDocuments] = React.useState<UploadedDocument[]>([]);
    const [fileUploads, setFileUploads] = React.useState<Record<UploadedDocument['type'], File | null>>({
        tax_certificate: null,
        trade_registry: null,
        qualification_certificate: null,
    });
    const [uploading, setUploading] = React.useState<UploadedDocument['type'] | null>(null);


    const fetchProfile = React.useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (error) {
            console.error("Error fetching profile:", error);
        } else if (data) {
            setProfile(data);
            setEmail(data.email || '');
            
            // Populate fields based on role or generic data availability
            if (userRole === 'customer') {
                setName(data.name || '');
                setAvatarUrl(data.avatar_url || null);
            } else {
                // Provider or Admin acting as provider-like
                setName(data.company_name || data.name || '');
                setDescription(data.description || '');
                setPhone(data.phone || '');
                setWebsite(data.website || '');
                setPortfolio(data.portfolio || []);
                setLogoUrl(data.logo_url || null);
                setSelectedServices(data.services_offered || []);
                setCertifications(data.certifications || []);
                setAwards(data.awards || []);
                setServiceRegions(data.service_area?.regions || []);
                setMachinePark(data.machine_park || []);
                setUploadedDocuments(data.uploaded_documents || []);
            }
        }
        setLoading(false);
    }, [userRole]);

    React.useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("Authentication error.");
            setSaving(false);
            return;
        }

        let updates: any = {};
        let successMessage = "Profil başarıyla güncellendi!";
        
        if (userRole === 'customer') {
            updates = { name };
        } else { // Provider
            updates = {
                portfolio,
                services_offered: selectedServices,
                certifications,
                awards,
                service_area: { regions: serviceRegions },
                machine_park: machinePark,
            };
            
            const pending_data = {
                company_name: name,
                description,
                phone,
                website,
                logo_url: logoUrl, 
            };
            
            // In a real scenario, changing critical info might require re-verification
            // For this demo, we update pending_data but also direct fields for immediate effect if allowed
            // Or we just update pending_data and wait for admin.
            // Here we update both for simplicity unless it's critical identity info.
            updates.pending_data = pending_data;
            updates.profile_status = 'pending_review';
            
            // We also update non-critical fields immediately
            updates.description = description;
            updates.phone = phone;
            updates.website = website;
            
            successMessage = "Profil değişiklikleriniz kaydedildi ve kritik güncellemeler onaya gönderildi!";
        }
        
        const { error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess(successMessage);
            fetchProfile(); // Re-fetch to get latest status
            setTimeout(() => setSuccess(null), 3000);
        }
        setSaving(false);
    }

    const handleFileChange = (id: UploadedDocument['type'], file: File | null) => {
        setError(null);
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setError('Sadece PDF, JPG ve PNG formatları kabul edilmektedir.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                 setError('Dosya boyutu 5MB\'dan küçük olmalıdır.');
                 return;
            }
            setFileUploads(prev => ({ ...prev, [id]: file }));
        } else {
            setFileUploads(prev => ({ ...prev, [id]: null }));
        }
    };

    const handleFileUpload = async (documentType: UploadedDocument['type']) => {
        const file = fileUploads[documentType];
        if (!file) return;

        setUploading(documentType);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Kullanıcı bulunamadı.");
            
            const fileExt = file.name.split('.').pop();
            const fileName = `${documentType}-${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`;
            
            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('documents')
                .getPublicUrl(filePath);
            
            const newDocument: UploadedDocument = {
                type: documentType,
                fileName: file.name,
                fileUrl: publicUrl,
                status: 'pending',
                uploadedAt: new Date().toISOString()
            };

            const updatedDocuments = [
                ...uploadedDocuments.filter(doc => doc.type !== documentType),
                newDocument
            ];
            
            const { error: dbError } = await supabase
                .from('profiles')
                .update({ uploaded_documents: updatedDocuments })
                .eq('id', user.id);

            if (dbError) throw dbError;
            
            setUploadedDocuments(updatedDocuments);
            setFileUploads(prev => ({ ...prev, [documentType]: null }));
        } catch (err) {
            setError("Dosya yüklenemedi: " + (err as Error).message);
        } finally {
            setUploading(null);
        }
    };

    const toggleRegion = (region: string) => {
        setServiceRegions(prev => 
            prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
        );
    };
    
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <DrillingRigLoader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-24">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-10 flex items-center">
                <button onClick={onBack} className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100 flex-grow">Profili Düzenle</h1>
                <div className="w-10"></div>
            </header>
            <main className="p-4 max-w-3xl mx-auto">
                <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm space-y-6">
                    {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md">{error}</p>}
                    {success && <p className="text-green-500 text-sm text-center bg-green-50 p-3 rounded-md">{success}</p>}

                    {/* Common Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {userRole === 'provider' ? 'Firma Adı' : 'Ad Soyad'}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-posta Adresi</label>
                            <input
                                type="email"
                                value={email}
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm dark:bg-gray-600 dark:text-gray-400 p-2 border cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez.</p>
                        </div>
                    </div>

                    {/* Provider Specific Fields */}
                    {userRole === 'provider' && (
                        <>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Firma Hakkında</label>
                                <textarea
                                    rows={4}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                                    placeholder="Firmanızı, tecrübenizi ve uzmanlık alanlarınızı anlatın..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefon</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                                        placeholder="+90 5XX XXX XX XX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Web Sitesi</label>
                                    <input
                                        type="url"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
                                        placeholder="https://www.firmaniz.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hizmet Verilen Bölgeler</label>
                                <div className="flex flex-wrap gap-2">
                                    {REGIONS.map(region => (
                                        <button
                                            key={region}
                                            type="button"
                                            onClick={() => toggleRegion(region)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                                serviceRegions.includes(region)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            {region}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Firma Belgeleri (Doğrulama)</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Kabul edilen formatlar: PDF, JPG, PNG. Maksimum boyut: 5MB.</p>
                                {documentTypes.map(({ id, name }) => {
                                    const currentDoc = uploadedDocuments.find(d => d.type === id);
                                    const file = fileUploads[id];
                                    return (
                                    <div key={id} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border dark:border-gray-600">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">{name}</p>
                                            {currentDoc && <DocumentStatusBadge status={currentDoc.status} />}
                                        </div>
                                        <div className="mt-2 flex items-center gap-4">
                                            <input
                                                id={`file-${id}`}
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(id, e.target.files ? e.target.files[0] : null)}
                                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleFileUpload(id)}
                                                disabled={!file || uploading === id}
                                                className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {uploading === id ? <LoaderIcon className="h-4 w-4 animate-spin"/> : 'Yükle'}
                                            </button>
                                        </div>
                                         {currentDoc?.status === 'rejected' && currentDoc.rejectionReason && (
                                            <p className="text-xs text-red-600 bg-red-100 p-2 mt-2 rounded-md">Reddetme nedeni: {currentDoc.rejectionReason}</p>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                        </>
                     )}
                    
                    <div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? <><LoaderIcon className="h-5 w-5 animate-spin" /> Kaydediliyor...</> : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

const DocumentStatusBadge: React.FC<{status: UploadedDocument['status']}> = ({ status }) => {
    const styles = {
        pending: { text: 'İnceleniyor', icon: ClockIcon, classes: 'bg-yellow-100 text-yellow-800' },
        approved: { text: 'Onaylandı', icon: CheckBadgeIcon, classes: 'bg-green-100 text-green-800' },
        rejected: { text: 'Reddedildi', icon: XCircleIcon, classes: 'bg-red-100 text-red-800' },
    };
    const { text, icon: Icon, classes } = styles[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${classes}`}>
            <Icon className="h-4 w-4" />
            {text}
        </span>
    );
}

export default EditProfileScreen;
