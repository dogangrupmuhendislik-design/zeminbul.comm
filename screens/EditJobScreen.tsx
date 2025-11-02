import * as React from 'react';
import { JobListing } from '../types';
import { supabase } from '../utils/supabaseClient';
import { LoaderIcon, LightningBoltIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { ScreenHeader } from '../components/shared/common';

interface EditJobScreenProps {
    jobId: string;
    onBack: () => void;
}

const EditJobScreen: React.FC<EditJobScreenProps> = ({ jobId, onBack }) => {
    const [job, setJob] = React.useState<JobListing | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);
    
    const [title, setTitle] = React.useState('');
    const [details, setDetails] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [isUrgent, setIsUrgent] = React.useState(false);
    const [isPro, setIsPro] = React.useState(false);

    React.useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            setLoading(true);

            const { data: jobData, error: jobError } = await supabase
                .from('job_listings')
                .select('*')
                .eq('id', jobId)
                .single();
            
            if (jobError) {
                console.error("Error fetching job to edit:", jobError);
            } else {
                const fetchedJob = jobData as JobListing;
                setJob(fetchedJob);
                setTitle(fetchedJob.title);
                setDetails(fetchedJob.details || '');
                setLocation(fetchedJob.location?.text || '');
                setIsUrgent(fetchedJob.isUrgent || false);

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('is_pro')
                        .eq('id', user.id)
                        .single();
                    setIsPro(profile?.is_pro || false);
                }
            }
            setLoading(false);
        };
        fetchJob();
    }, [jobId]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);
        
        const { error: updateError } = await supabase
            .from('job_listings')
            .update({
                title,
                details,
                location: { text: location },
                isUrgent: isPro ? isUrgent : false,
            })
            .eq('id', jobId);

        if (updateError) {
            setError(updateError.message);
            setSaving(false);
        } else {
            setSuccess("İlan başarıyla güncellendi.");
            setSaving(false);
            setTimeout(() => {
                onBack();
            }, 1500);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <DrillingRigLoader />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-white">
                <ScreenHeader onBack={onBack} title="İlan Bulunamadı" />
                <p className="text-center p-8">Düzenlenecek ilan bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <ScreenHeader onBack={onBack} title="İlanı Düzenle" />
            <main className="p-4 pb-24">
                <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                    {success && <p className="text-green-600 bg-green-50 p-3 rounded-md text-sm text-center">{success}</p>}
                    {error && <p className="text-red-600 bg-red-50 p-3 rounded-md text-sm text-center">{error}</p>}
                    
                    <FormField label="İlan Başlığı" required>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="form-input"
                            required
                        />
                    </FormField>
                    
                    <FormField label="Proje Detayları" required>
                        <textarea
                            rows={8}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="form-input"
                            required
                        />
                    </FormField>

                    <FormField label="Konum">
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="form-input"
                        />
                    </FormField>
                    
                    {isPro && (
                        <FormField label="İlan Durumu">
                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                                <div className="flex items-center">
                                    <LightningBoltIcon className="h-6 w-6 text-red-500 mr-3" />
                                    <div>
                                        <label className="font-medium text-red-800 dark:text-red-200">İlanı 'Acil' Olarak İşaretle</label>
                                        <p className="text-sm text-red-700 dark:text-red-300">İlanınız daha fazla dikkat çeker.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsUrgent(!isUrgent)}
                                    className={`${isUrgent ? 'bg-red-500' : 'bg-gray-300'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors`}
                                    role="switch"
                                    aria-checked={isUrgent}
                                >
                                    <span className={`${isUrgent ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                                </button>
                            </div>
                        </FormField>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={saving}
                            className="bg-gray-200 text-gray-800 font-semibold py-2.5 px-5 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? <><LoaderIcon className="h-5 w-5 animate-spin" /> Kaydediliyor...</> : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>
                </form>
            </main>
            <style>{`.form-input { display: block; width: 100%; padding: 0.5rem 0.75rem; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.5rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); } .form-input:focus { outline: none; box-shadow: 0 0 0 2px #3B82F6; border-color: #3B82F6; } .dark .form-input { background-color: #1f2937; border-color: #4b5563; color: #d1d5db; }`}</style>
        </div>
    );
};

const FormField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
    </div>
);

export default EditJobScreen;