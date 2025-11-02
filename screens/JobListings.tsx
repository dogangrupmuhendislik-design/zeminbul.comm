import * as React from 'react';
import { JobListing, View } from '../types';
import { MapPinIcon, CurrencyDollarIcon, LightningBoltIcon, MagnifyingGlassIcon } from '../components/icons';
import DrillingRigLoader from '../components/DrillingRigLoader';
// FIX: Module '"file:///components/QuoteModal"' has no default export. Changed to named import.
import { QuoteModal } from '../components/QuoteModal';
import { supabase } from '../utils/supabaseClient';
import { useCategories } from '../contexts/CategoriesContext';

interface JobListingsProps {
    onNavigate: (view: View, jobId: string) => void;
}

const JobListings: React.FC<JobListingsProps> = ({ onNavigate }) => {
    const [jobs, setJobs] = React.useState<JobListing[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [quoteState, setQuoteState] = React.useState<{job: JobListing | null, amount: string}>({ job: null, amount: '' });

    // State for filters
    const [categoryFilter, setCategoryFilter] = React.useState('all');
    const [locationFilter, setLocationFilter] = React.useState('');
    const [keywordFilter, setKeywordFilter] = React.useState('');


    const fetchJobs = React.useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('job_listings')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching jobs:', error);
        } else {
            setJobs(data as JobListing[]);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);
    
    // Clear filters function
    const handleClearFilters = () => {
        setCategoryFilter('all');
        setLocationFilter('');
        setKeywordFilter('');
    };

    // Filtering logic
    const filteredJobs = React.useMemo(() => {
        return jobs.filter(job => {
            const categoryMatch = categoryFilter === 'all' || job.category_id === categoryFilter;
            const locationMatch = !locationFilter || (job.location && job.location.text.toLowerCase().includes(locationFilter.toLowerCase()));
            const keywordMatch = !keywordFilter || 
                job.title.toLowerCase().includes(keywordFilter.toLowerCase()) || 
                (job.details && job.details.toLowerCase().includes(keywordFilter.toLowerCase()));
            
            return categoryMatch && locationMatch && keywordMatch;
        });
    }, [jobs, categoryFilter, locationFilter, keywordFilter]);

    const handleOpenQuoteModal = (job: JobListing) => {
        setQuoteState({ job, amount: '' });
    };

    const handleCloseQuoteModal = () => {
        setQuoteState({ job: null, amount: '' });
    };

    const handleQuoteSubmit = async (quoteDetails: { amount: string, notes: string }) => {
        if (!quoteState.job) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("User not logged in to submit a quote.");
            return;
        }

        const { error } = await supabase.from('bids').insert({
            job_id: quoteState.job.id,
            provider_id: user.id,
            amount: parseFloat(quoteDetails.amount),
            notes: quoteDetails.notes,
            status: 'pending'
        });
        
        if (error) {
            throw new Error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Header />
            <div className="p-4">
                <FilterSection 
                    category={categoryFilter}
                    setCategory={setCategoryFilter}
                    location={locationFilter}
                    setLocation={setLocationFilter}
                    keyword={keywordFilter}
                    setKeyword={setKeywordFilter}
                    onClear={handleClearFilters}
                />
                {loading ? (
                    <DrillingRigLoader />
                ) : (
                    <JobList jobs={filteredJobs} onQuote={handleOpenQuoteModal} onSelectJob={(jobId) => onNavigate('jobDetail', jobId)} />
                )}
            </div>
            <QuoteModal 
                job={quoteState.job}
                isOpen={!!quoteState.job}
                onClose={handleCloseQuoteModal}
                onSubmit={handleQuoteSubmit}
                initialAmount={quoteState.amount}
            />
        </div>
    );
};

const Header: React.FC = () => (
    <header className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">İş İlanları</h1>
    </header>
);

interface FilterSectionProps {
    category: string;
    setCategory: (value: string) => void;
    location: string;
    setLocation: (value: string) => void;
    keyword: string;
    setKeyword: (value: string) => void;
    onClear: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ category, setCategory, location, setLocation, keyword, setKeyword, onClear }) => {
    const { categories } = useCategories();
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-4">
            <h2 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">İş İlanlarını Filtrele</h2>
            <div className="space-y-4">
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                >
                    <option value="all">Tüm Kategoriler</option>
                    {categories.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                </select>
                <div className="relative">
                    <MapPinIcon className="h-5 w-5 text-gray-400 absolute top-3.5 left-4 pointer-events-none" />
                    <input 
                        type="text" 
                        placeholder="Şehir / Konum Ara" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                    />
                </div>
                <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-3.5 left-4 pointer-events-none" />
                    <input 
                        type="text" 
                        placeholder="Anahtar Kelime Ara (örn: forekazık)" 
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
                    />
                </div>
                <button 
                    onClick={onClear}
                    className="w-full bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors dark:bg-gray-600 dark:hover:bg-gray-500"
                >
                    Filtreleri Temizle
                </button>
            </div>
        </div>
    );
};


interface JobCardProps {
    job: JobListing;
    onQuote: (job: JobListing) => void;
    onSelectJob: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onQuote, onSelectJob }) => {
    const { categories } = useCategories();
    return (
        <div className={`bg-white dark:bg-gray-800 border ${job.isUrgent ? 'border-red-500 dark:border-red-600' : 'border-gray-200 dark:border-gray-700'} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}>
            <div onClick={() => onSelectJob(job.id)} className="cursor-pointer mb-4">
                <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 pr-2">{job.title}</h3>
                    <div className="flex-shrink-0 flex items-center gap-2">
                        {job.isUrgent && (
                            <span className="flex items-center gap-1 text-xs text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 font-bold px-2 py-1 rounded-full whitespace-nowrap">
                                <LightningBoltIcon className="h-4 w-4" />
                                ACİL
                            </span>
                        )}
                        <span className="text-xs text-white bg-blue-500 font-semibold px-2 py-1 rounded-full whitespace-nowrap">{categories.find(s => s.id === job.category_id)?.name || job.category_id}</span>
                    </div>
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2">
                    <MapPinIcon className="h-4 w-4 mr-1.5" />
                    <p className="text-sm">{job.location?.text}</p>
                </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => onQuote(job)}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                    <CurrencyDollarIcon className="h-5 w-5" />
                    Teklif Ver
                </button>
            </div>
        </div>
    );
};


interface JobListProps {
    jobs: JobListing[];
    onQuote: (job: JobListing) => void;
    onSelectJob: (jobId: string) => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, onQuote, onSelectJob }) => (
    <div className="space-y-3">
        {jobs.length > 0 ? (
            jobs.map(job => (
                <JobCard key={job.id} job={job} onQuote={onQuote} onSelectJob={onSelectJob} />
            ))
        ) : (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Filtrelerinize uygun iş ilanı bulunamadı.</p>
            </div>
        )}
    </div>
);

export default JobListings;