import * as React from 'react';
import { JobListing, View } from '../types';
import { supabase } from '../utils/supabaseClient';
// FIX: Use categories from context instead of a static import.
import { useCategories } from '../contexts/CategoriesContext';
import { StarIcon, TrashIcon, MapPinIcon, UserIcon, LightningBoltIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';

interface AdminJobsProps {
    onNavigate: (view: View, id: string) => void;
}

const AdminJobs: React.FC<AdminJobsProps> = ({ onNavigate }) => {
    const [jobs, setJobs] = React.useState<(JobListing & { customer_name: string })[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [categoryFilter, setCategoryFilter] = React.useState<'all' | string>('all');
    const [searchTerm, setSearchTerm] = React.useState('');
    const { categories } = useCategories();

    React.useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('job_listings')
                .select(`
                    *,
                    profiles:author_id ( name )
                `);
            
            if (error) {
                console.error("Error fetching jobs for admin:", error.message);
            } else {
                const formattedJobs = data.map((j: any) => ({
                    ...j,
                    customer_name: j.profiles?.name || 'Bilinmeyen Kullanıcı'
                }));
                setJobs(formattedJobs);
            }
            setLoading(false);
        };
        fetchJobs();
    }, []);

    const filteredJobs = React.useMemo(() => {
        let tempJobs = [...jobs];

        if (categoryFilter !== 'all') {
            tempJobs = tempJobs.filter(job => job.category_id === categoryFilter);
        }

        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            tempJobs = tempJobs.filter(job => {
                const customerName = job.customer_name?.toLowerCase() || '';
                const jobTitle = job.title.toLowerCase();
                return jobTitle.includes(lowercasedTerm) || customerName.includes(lowercasedTerm);
            });
        }
        
        return tempJobs;
    }, [jobs, categoryFilter, searchTerm]);
    
    if (loading) {
        return <DrillingRigLoader />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
                <input
                    type="text"
                    placeholder="İlan başlığı veya müşteri adı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="all">Tüm Kategoriler</option>
                    {categories.map(service => <option key={service.id} value={service.id}>{service.name}</option>)}
                </select>
            </div>
            <div className="space-y-4">
                {filteredJobs.map(job => (
                    <div 
                        key={job.id} 
                        onClick={() => onNavigate('adminJobDetail', job.id)}
                        className={`bg-white p-4 rounded-xl shadow-md border-l-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 ${job.isUrgent ? 'border-red-500' : 'border-gray-200'}`}
                    >
                         <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                     <p className="font-bold text-gray-800">{job.title}</p>
                                     {job.isUrgent && (
                                        <span className="flex items-center gap-1 text-xs text-red-700 bg-red-100 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                                            <LightningBoltIcon className="h-3 w-3" />
                                            ACİL
                                        </span>
                                     )}
                                </div>
                                 <div className="flex items-center text-sm text-gray-500 font-medium">
                                    <UserIcon className="h-4 w-4 mr-1.5"/>
                                    <span>{job.customer_name}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <MapPinIcon className="h-4 w-4 mr-1.5"/>
                                    <span>{job.location?.text}</span>
                                </div>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                                {categories.find(s => s.id === job.category_id)?.name || job.category_id}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminJobs;