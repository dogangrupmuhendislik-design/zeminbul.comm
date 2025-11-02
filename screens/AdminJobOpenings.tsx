
import * as React from 'react';
import { View, CareerJob } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { BriefcaseIcon, PlusCircleIcon, XCircleIcon, CheckBadgeIcon, LoaderIcon, TrashIcon, WrenchScrewdriverIcon } from '../components/icons';

interface AdminJobOpeningsProps {
    onNavigate: (view: View, id?: string) => void;
}

const AdminJobOpenings: React.FC<AdminJobOpeningsProps> = ({ onNavigate }) => {
    const [jobs, setJobs] = React.useState<CareerJob[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingJob, setEditingJob] = React.useState<CareerJob | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    // Form Fields
    const [title, setTitle] = React.useState('');
    const [type, setType] = React.useState('Tam Zamanlı');
    const [location, setLocation] = React.useState('Uzaktan');
    const [description, setDescription] = React.useState('');
    const [requirementsStr, setRequirementsStr] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    const fetchJobs = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('career_jobs')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
             // If table doesn't exist or other error, handle gracefully.
             // In a real scenario, you might want to create the table via SQL editor if it's missing.
             console.warn("Could not fetch career jobs:", error.message);
             setJobs([]); 
        } else {
            setJobs(data as CareerJob[]);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleOpenModal = (job?: CareerJob) => {
        if (job) {
            setEditingJob(job);
            setTitle(job.title);
            setType(job.type);
            setLocation(job.location);
            setDescription(job.description);
            setRequirementsStr(job.requirements ? job.requirements.join('\n') : '');
        } else {
            setEditingJob(null);
            setTitle('');
            setType('Tam Zamanlı');
            setLocation('Uzaktan');
            setDescription('');
            setRequirementsStr('');
        }
        setIsModalOpen(true);
        setError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingJob(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        const requirements = requirementsStr.split('\n').filter(r => r.trim() !== '');

        try {
            const payload = {
                title,
                type,
                location,
                description,
                requirements,
                is_active: true, // Default to active
            };

            let error;
            if (editingJob) {
                const { error: updateError } = await supabase
                    .from('career_jobs')
                    .update(payload)
                    .eq('id', editingJob.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('career_jobs')
                    .insert(payload);
                error = insertError;
            }

            if (error) throw error;

            fetchJobs();
            handleCloseModal();

        } catch (err: any) {
            console.error("Error saving job:", err);
            setError(err.message || "Kaydedilirken bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Bu pozisyonu silmek istediğinizden emin misiniz?")) {
            const { error } = await supabase.from('career_jobs').delete().eq('id', id);
            if (error) {
                alert("Silinirken hata oluştu: " + error.message);
            } else {
                fetchJobs();
            }
        }
    };

    const handleToggleActive = async (job: CareerJob) => {
        // Optimistic update
        setJobs(current => current.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j));

        const { error } = await supabase
            .from('career_jobs')
            .update({ is_active: !job.is_active })
            .eq('id', job.id);
        
        if (error) {
            console.error("Status update failed:", error);
            fetchJobs(); // Revert
        }
    };

    if (loading) return <DrillingRigLoader />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Açık Pozisyon Yönetimi</h2>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusCircleIcon className="h-5 w-5" /> Pozisyon Ekle
                </button>
            </div>

            {jobs.length > 0 ? (
                <div className="grid gap-4">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                                        {job.is_active ? 'Yayında' : 'Pasif'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{job.type} • {job.location}</p>
                            </div>
                            
                            <div className="flex gap-2 w-full md:w-auto">
                                <button 
                                    onClick={() => handleToggleActive(job)}
                                    className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${job.is_active ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                                >
                                    {job.is_active ? 'Pasife Al' : 'Yayınla'}
                                </button>
                                <button 
                                    onClick={() => handleOpenModal(job)}
                                    className="flex-1 md:flex-none bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                                >
                                    <WrenchScrewdriverIcon className="h-4 w-4" /> Düzenle
                                </button>
                                <button 
                                    onClick={() => handleDelete(job.id)}
                                    className="flex-1 md:flex-none bg-red-100 text-red-800 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                                >
                                    <TrashIcon className="h-4 w-4" /> Sil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-xl shadow-md">
                    <BriefcaseIcon className="h-16 w-16 mx-auto text-gray-300" />
                    <h3 className="mt-4 text-xl font-semibold text-gray-800">İlan Yok</h3>
                    <p className="mt-2 text-gray-500">Henüz eklenmiş bir kariyer ilanı bulunmuyor.</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-gray-900">{editingJob ? 'Pozisyonu Düzenle' : 'Yeni Pozisyon Ekle'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><XCircleIcon className="h-6 w-6"/></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon Başlığı</label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onChange={e => setTitle(e.target.value)} 
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Tipi</label>
                                    <select 
                                        value={type} 
                                        onChange={e => setType(e.target.value)} 
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    >
                                        <option>Tam Zamanlı</option>
                                        <option>Yarı Zamanlı</option>
                                        <option>Proje Bazlı</option>
                                        <option>Staj</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Konum</label>
                                    <input 
                                        type="text" 
                                        value={location} 
                                        onChange={e => setLocation(e.target.value)} 
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        placeholder="Örn: İstanbul veya Uzaktan"
                                        required 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                                <textarea 
                                    rows={4} 
                                    value={description} 
                                    onChange={e => setDescription(e.target.value)} 
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gereksinimler (Her satıra bir madde)</label>
                                <textarea 
                                    rows={5} 
                                    value={requirementsStr} 
                                    onChange={e => setRequirementsStr(e.target.value)} 
                                    className="w-full p-2 border border-gray-300 rounded-lg font-mono text-sm"
                                    placeholder="Örn:\n5+ yıl deneyim\nReact uzmanlığı\n..."
                                />
                            </div>

                            {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm text-center">{error}</p>}

                            <div className="pt-4 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal} 
                                    className="px-4 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium"
                                    disabled={isSaving}
                                >
                                    İptal
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 font-bold flex items-center gap-2 disabled:opacity-70"
                                    disabled={isSaving}
                                >
                                    {isSaving ? <><LoaderIcon className="h-4 w-4 animate-spin"/> Kaydediliyor...</> : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminJobOpenings;
