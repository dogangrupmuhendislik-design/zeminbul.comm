
import * as React from 'react';
import { View, Service } from '../types';
import { supabase } from '../utils/supabaseClient';
import { useCategories } from '../contexts/CategoriesContext';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { LoaderIcon, PhotoIcon, CheckBadgeIcon } from '../components/icons';
import { ICON_MAP } from '../constants';

interface AdminCategoriesScreenProps {
    onNavigate: (view: View, id?: string) => void;
}

const AdminCategoriesScreen: React.FC<AdminCategoriesScreenProps> = ({ onNavigate }) => {
    const { categories, loading, error, refetchCategories } = useCategories();
    
    if (loading) {
        return <DrillingRigLoader />;
    }

    if (error) {
        return <div className="p-4 text-red-500 bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Kategori Yönetimi</h2>
            <div className="space-y-4">
                {categories.map(service => (
                    <CategoryCard key={service.id} service={service} onUpdate={refetchCategories} />
                ))}
            </div>
        </div>
    );
};

const CategoryCard: React.FC<{ service: Service, onUpdate: () => void }> = ({ service, onUpdate }) => {
    const [file, setFile] = React.useState<File | null>(null);
    const [selectedIcon, setSelectedIcon] = React.useState<string>(service.icon_name || 'BriefcaseIcon');
    const [uploading, setUploading] = React.useState(false);
    const [uploadSuccess, setUploadSuccess] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            
            // Security: Validate File Type
            if (!selectedFile.type.startsWith('image/')) {
                setError('Sadece resim dosyaları (JPG, PNG) yüklenebilir.');
                setFile(null);
                return;
            }

            setFile(selectedFile);
            setError(null);
            setUploadSuccess(false);
        }
    };
    
    const handleSave = async () => {
        setUploading(true);
        setError(null);
        setUploadSuccess(false);

        try {
            let publicUrl = service.imageUrl;

            // 1. Upload image if a new file is selected
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${service.id}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('category-images')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: true,
                    });

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('category-images')
                    .getPublicUrl(filePath);
                
                publicUrl = urlData.publicUrl;
            }

            // 2. Update Database (Image URL + Icon Name)
            const { error: dbError } = await supabase
                .from('services')
                .update({ 
                    imageUrl: publicUrl,
                    icon_name: selectedIcon 
                })
                .eq('id', service.id);

            if (dbError) throw dbError;

            setUploadSuccess(true);
            setFile(null);
            onUpdate(); // Refetch to update UI
            setTimeout(() => setUploadSuccess(false), 3000);

        } catch (err: any) {
            console.error("Save failed:", err);
            let errorMessage = "Kaydetme başarısız.";
            if (err.message && err.message.includes("new row violates row-level security policy")) {
                errorMessage = "Yükleme reddedildi. RLS politikalarını kontrol edin.";
            } else if (err.statusCode === 404 || (err.message && err.message.includes("Bucket not found"))) {
                errorMessage = "'category-images' bucket'ı bulunamadı.";
            } else {
                errorMessage = err.message;
            }
            setError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    // Dynamic Icon Component for Preview
    const SelectedIconComponent = ICON_MAP[selectedIcon] || ICON_MAP['BriefcaseIcon'];

    return (
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200/80">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Image Preview */}
                <div className="flex-shrink-0 w-full md:w-32 h-32 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-200">
                    {file ? (
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover opacity-80" />
                    ) : service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                           <PhotoIcon className="h-12 w-12" />
                        </div>
                    )}
                    {/* Icon Overlay Preview */}
                    <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-12 h-12 bg-blue-500/80 rounded-full flex items-center justify-center text-white backdrop-blur-sm shadow-sm">
                            <SelectedIconComponent className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="flex-grow w-full space-y-4">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">{service.name}</h3>
                        <p className="text-sm text-gray-500">{service.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* File Input */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Arka Plan Fotoğrafı</label>
                            <input
                                id={`file-${service.id}`}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        {/* Icon Selector */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Kategori İkonu</label>
                            <div className="relative">
                                <select
                                    value={selectedIcon}
                                    onChange={(e) => setSelectedIcon(e.target.value)}
                                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white"
                                >
                                    {Object.keys(ICON_MAP).map((iconName) => (
                                        <option key={iconName} value={iconName}>{iconName}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SelectedIconComponent className="h-5 w-5 text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleSave}
                            disabled={uploading || uploadSuccess}
                            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-all"
                        >
                            {uploading ? (
                                <><LoaderIcon className="h-4 w-4 animate-spin" /> Kaydediliyor...</>
                            ) : uploadSuccess ? (
                                <><CheckBadgeIcon className="h-4 w-4" /> Başarılı</>
                            ) : (
                                "Değişiklikleri Kaydet"
                            )}
                        </button>
                    </div>
                     {error && <p className="text-xs text-red-600 mt-2 bg-red-50 p-2 rounded">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminCategoriesScreen;
