import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import { StarIcon, OutlineStarIcon, CheckBadgeIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { ScreenHeader } from '../components/shared/common';

interface RateExperienceScreenProps {
    jobId: string;
    providerId: string;
    onBack: () => void;
}

const ratingCriteria = [
    { id: 'communication', label: 'İletişim' },
    { id: 'professionalism', label: 'Profesyonellik' },
    { id: 'quality', label: 'İş Kalitesi' },
    { id: 'timeline', label: 'Zamanlama' },
];

const RateExperienceScreen: React.FC<RateExperienceScreenProps> = ({ jobId, providerId, onBack }) => {
    const [ratings, setRatings] = React.useState<Record<string, number>>({});
    const [comment, setComment] = React.useState('');
    const [jobTitle, setJobTitle] = React.useState('');
    const [providerName, setProviderName] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState(false);

    React.useEffect(() => {
        const fetchJobAndProvider = async () => {
            setLoading(true);
            const { data: jobData } = await supabase.from('job_listings').select('title').eq('id', jobId).single();
            const { data: providerData } = await supabase.from('profiles').select('company_name').eq('id', providerId).single();
            
            if (jobData) setJobTitle(jobData.title);
            if (providerData) setProviderName(providerData.company_name);
            setLoading(false);
        };
        fetchJobAndProvider();
    }, [jobId, providerId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (Object.keys(ratings).length < ratingCriteria.length) {
            setError("Lütfen tüm kriterler için puanlama yapın.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Kullanıcı bulunamadı.");
            
            const { error: insertError } = await supabase.from('ratings').insert({
                job_id: jobId,
                rater_id: user.id,
                rated_id: providerId,
                rating_by: 'customer',
                ratings: ratings,
                comment: comment || null
            });

            if (insertError) throw insertError;
            
            // In a real-world scenario, you would have a database trigger or edge function
            // to recalculate the average rating on the provider's profile to avoid race conditions.
            // For now, we'll simulate this update.
             const { data: existingRatings } = await supabase.from('ratings').select('ratings').eq('rated_id', providerId);
             if(existingRatings && existingRatings.length > 0) {
                 const totalRatings = existingRatings.length;
                 const sumOfAverageRatings = existingRatings.reduce((sum: number, r: { ratings: Record<string, number> }) => {
                     const values = Object.values(r.ratings);
                     if (values.length === 0) {
                         return sum;
                     }
                     const ratingSum = values.reduce((a: number, b: number) => a + Number(b), 0);
                     return sum + (ratingSum / values.length);
                 }, 0);
                 const newAvg = totalRatings > 0 ? sumOfAverageRatings / totalRatings : 0;
                 
                 await supabase.from('profiles').update({
                     average_rating: newAvg,
                     rating_count: totalRatings
                 }).eq('id', providerId);
             }


            setSuccess(true);
            setTimeout(() => onBack(), 2500);

        } catch (err) {
            console.error(err);
            setError("Değerlendirme gönderilirken bir hata oluştu: " + (err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <DrillingRigLoader />;

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-center p-4">
                <CheckBadgeIcon className="h-20 w-20 text-green-500" />
                <h1 className="text-3xl font-bold mt-4">Teşekkürler!</h1>
                <p className="mt-2 text-lg text-gray-700">Değerlendirmeniz başarıyla alındı. Geri bildiriminiz platformumuzu daha iyi hale getirmemize yardımcı oluyor.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <ScreenHeader title="Deneyimi Değerlendir" onBack={onBack} />
            <main className="p-4">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                    <div className="text-center">
                        <h2 className="text-xl font-bold">"{jobTitle}" işi için</h2>
                        <p className="text-gray-600">"{providerName}" firmasını değerlendirin</p>
                    </div>

                    {ratingCriteria.map(criterion => (
                        <StarRatingInput
                            key={criterion.id}
                            label={criterion.label}
                            value={ratings[criterion.id] || 0}
                            onChange={(value) => setRatings(prev => ({ ...prev, [criterion.id]: value }))}
                        />
                    ))}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yorumunuz (Opsiyonel)</label>
                        <textarea
                            rows={5}
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Deneyiminizle ilgili detayları paylaşın..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
                    </button>
                </form>
            </main>
        </div>
    );
};

interface StarRatingInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
}
const StarRatingInput: React.FC<StarRatingInputProps> = ({ label, value, onChange }) => (
    <div className="py-2">
        <label className="block text-md font-semibold text-gray-800 mb-2">{label}</label>
        <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1;
                return (
                    <button
                        key={ratingValue}
                        type="button"
                        onClick={() => onChange(ratingValue)}
                        className="p-1 text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                        {ratingValue <= value ? (
                            <StarIcon className="h-8 w-8 text-yellow-400" />
                        ) : (
                            <OutlineStarIcon className="h-8 w-8" />
                        )}
                    </button>
                );
            })}
        </div>
    </div>
);

export default RateExperienceScreen;