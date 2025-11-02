import * as React from 'react';
import { Service } from '../types';
import { useCategories } from '../contexts/CategoriesContext';
import QuoteWizard from '../components/QuoteWizard';
import { supabase } from '../utils/supabaseClient';
import { ICON_MAP } from '../constants';

interface PostJobProps {
  onBack: () => void;
  initialService?: Service | null;
  initialData?: any;
}

const PostJob: React.FC<PostJobProps> = ({ onBack, initialService = null, initialData = null }) => {
  const [selectedService, setSelectedService] = React.useState<Service | null>(initialService);
  const [isPro, setIsPro] = React.useState(false);
  const { categories } = useCategories();

  React.useEffect(() => {
    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('profiles')
                .select('is_pro')
                .eq('id', user.id)
                .single();
            if (data) {
                setIsPro(data.is_pro);
            }
        }
    };
    fetchProfile();
  }, []);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
  };

  const handleCloseWizard = React.useCallback(() => {
    setSelectedService(null);
    if(initialService || initialData) { // Also go back if coming from chat-to-post
        onBack();
    }
  }, [initialService, initialData, onBack]);

  const handleQuoteSubmit = async (formData: any) => {
    const { service, ...wizard_answers } = formData;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        throw new Error("İlan oluşturmak için giriş yapmalısınız.");
    }
    
    // Create a location object if it's just a string
    const locationObject = typeof wizard_answers.location === 'string' 
        ? { text: wizard_answers.location } 
        : wizard_answers.location;

    const { error } = await supabase.from('job_listings').insert({
      author_id: user.id,
      category_id: service.id,
      title: wizard_answers.title,
      details: wizard_answers.details,
      location: locationObject,
      wizard_answers: wizard_answers,
      budget: wizard_answers.budget,
      isUrgent: isPro ? wizard_answers.isUrgent : false,
      status: 'pending_review', // Use 'pending_review' to align with DB enum/policy
    });

    if (error) {
        throw new Error(error.message);
    }
  };
  
  // If coming from Chat-to-Post, directly open the wizard
  if (initialData && !selectedService) {
      const suggestedService = categories.find(s => s.name.toLowerCase() === (initialData.category_id || '').toLowerCase()) || categories[0];
      return (
          <QuoteWizard
            service={suggestedService}
            onClose={handleCloseWizard}
            onSubmit={handleQuoteSubmit}
            isProUser={isPro}
            initialData={initialData}
          />
      );
  }


  if (selectedService) {
    return (
      <QuoteWizard
        service={selectedService}
        onClose={handleCloseWizard}
        onSubmit={handleQuoteSubmit}
        isProUser={isPro}
        initialData={initialData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 flex items-center">
         <button onClick={onBack} className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex-grow">
            <h1 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">Hangi hizmete ihtiyacın var?</h1>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">İlk adımı atalım ve ihtiyacın olan hizmeti seçelim.</p>
        </div>
         <div className="w-10"></div>
      </header>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {categories.map(service => (
            <ServiceCard key={service.id} service={service} onSelect={handleSelectService} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => {
    const Icon = ICON_MAP[service.icon_name];
    return (
        <div
            onClick={() => onSelect(service)}
            className="group relative rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col items-center justify-center text-center aspect-square"
            style={{ backgroundImage: `url(${service.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            role="button"
            aria-label={`Select ${service.name} service`}
        >
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors"></div>
            <div className="relative z-10 p-4 flex flex-col items-center">
                {Icon && <Icon className="h-12 w-12 text-white mb-3" />}
                <h2 className="font-semibold text-white">{service.name}</h2>
            </div>
        </div>
    );
};

export default PostJob;