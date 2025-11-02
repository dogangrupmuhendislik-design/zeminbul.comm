import * as React from 'react';
import { Service, WizardStep, WizardField } from '../types';
import { WIZARD_STEPS } from '../constants';
import { MapPinIcon, ClockIcon, LoaderIcon, CheckBadgeIcon } from './icons';
import { useGeolocation } from '../hooks/useGeolocation';

interface QuoteWizardProps {
  service: Service;
  onClose: () => void;
  onSubmit: (quoteRequest: any) => Promise<void>;
  isProUser?: boolean;
  initialData?: any;
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

const QuoteWizard: React.FC<QuoteWizardProps> = ({ service, onClose, onSubmit, isProUser, initialData }) => {
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);
  const [formData, setFormData] = React.useState<Record<string, any>>({});
  const [submissionStatus, setSubmissionStatus] = React.useState<SubmissionStatus>('idle');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  
  React.useEffect(() => {
    if (initialData) {
      const prefillData: Record<string, any> = { ...initialData };
      if (initialData.quantity) prefillData.quantity = { value: initialData.quantity, unit: 'Metre' };
      if (initialData.diameter) prefillData.diameter = { value: initialData.diameter, unit: 'cm' };
      if (initialData.depth) prefillData.depth = { value: initialData.depth, unit: 'm' };
      if (initialData.location) prefillData.location = { text: initialData.location };
      setFormData(prefillData);
    }
  }, [initialData]);

  const steps = WIZARD_STEPS.default;
  const currentStepData = steps[currentStepIndex];

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    currentStepData.fields.forEach(field => {
      if (field.proOnly && !isProUser) return;
      
      if (field.required) {
        const value = formData[field.id];
        let isEmpty = false;

        if (value === undefined || value === null) {
          isEmpty = true;
        } else if (typeof value === 'string' && value.trim() === '') {
          isEmpty = true;
        } else if (field.type === 'unit-input') {
          if (!value.value || String(value.value).trim() === '') {
            isEmpty = true;
          }
        } else if (field.type === 'location') {
          if (!value.text || String(value.text).trim() === '') {
            isEmpty = true;
          }
        }
        
        if (isEmpty) {
          newErrors[field.id] = `${field.label} alanı zorunludur.`;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }
    }
  };

  const handleBack = () => {
    setErrors({});
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    } else {
        onClose(); // Go back to service selection
    }
  };

  const handleFormChange = React.useCallback((id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[id];
            return newErrors;
        });
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) {
        return;
    }
    setSubmissionStatus('submitting');
    try {
        await onSubmit({ service, ...formData });
        setSubmissionStatus('success');
        setTimeout(() => {
            onClose();
        }, 1500); // Wait for animation before closing
    } catch(error) {
        console.error("Submission failed:", error);
        setSubmissionStatus('error');
        // Reset after a delay
        setTimeout(() => setSubmissionStatus('idle'), 2000);
    }
  };
  
  const progress = ((currentStepIndex + 2) / (steps.length + 1)) * 100;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isBusy = submissionStatus === 'submitting' || submissionStatus === 'success';

  const getButtonContent = () => {
    if (!isLastStep) return 'İleri';
    switch (submissionStatus) {
        case 'submitting':
            return <><LoaderIcon className="h-6 w-6 animate-spin" /><span>Yayınlanıyor...</span></>;
        case 'success':
            return <><CheckBadgeIcon className="h-6 w-6" /><span>Başarılı!</span></>;
        case 'error':
            return 'Tekrar Dene';
        default:
            return 'İlanı Yayınla';
    }
  };

  const getButtonClass = () => {
      if (!isLastStep) return 'bg-blue-600 hover:bg-blue-700';
      switch (submissionStatus) {
          case 'submitting':
              return 'bg-blue-600 opacity-75 cursor-not-allowed';
          case 'success':
              return 'bg-green-500';
          case 'error':
              return 'bg-red-500 hover:bg-red-600';
          default:
              return 'bg-blue-600 hover:bg-blue-700';
      }
  };


  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col" role="dialog" aria-modal="true">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
        <div className="flex items-center">
            <button onClick={handleBack} className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" disabled={isBusy}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex-grow text-center text-sm text-gray-500 dark:text-gray-400">
                Adım {currentStepIndex + 2}/{steps.length + 1}
            </div>
            <button onClick={onClose} className="text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" disabled={isBusy}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 mt-2">
            <div className="bg-blue-600 h-1" style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
        </div>
      </header>
      
      <main className="flex-grow p-6 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentStepData.title}</h1>
          {currentStepData.subtitle && <p className="mt-2 text-gray-600 dark:text-gray-300">{currentStepData.subtitle}</p>}
          
          <div className="mt-8 space-y-6">
            {currentStepData.fields.map(field => {
                if (field.proOnly && !isProUser) {
                    return null;
                }
                return (
                    <div key={field.id}>
                        <FormField field={field} value={formData[field.id]} onChange={handleFormChange} disabled={isBusy} />
                        {errors[field.id] && <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>}
                    </div>
                );
            })}
          </div>

          <div className="mt-12">
              <button
                onClick={isLastStep ? handleSubmit : handleNext}
                disabled={isBusy}
                className={`w-full flex items-center justify-center gap-2 text-white text-lg font-semibold py-4 rounded-lg transition-colors ${getButtonClass()}`}
              >
                {getButtonContent()}
              </button>
          </div>
        </div>
      </main>
    </div>
  );
};

interface FormFieldProps {
    field: WizardField;
    value: any;
    onChange: (id: string, value: any) => void;
    disabled?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, disabled }) => {
    switch (field.type) {
        case 'unit-input':
            const [inputValue, setInputValue] = React.useState(() => {
                if (value?.value) return value.value;
                return '';
            });

            const [unit, setUnit] = React.useState(() => {
                if (value?.unit) return value.unit;
                return field.units?.[0];
            });
            
            React.useEffect(() => { // Handle pre-fill from initialData
                if (value?.value !== inputValue) setInputValue(value?.value || '');
                if (value?.unit && value?.unit !== unit) setUnit(value?.unit);
            }, [value]);

            React.useEffect(() => {
                onChange(field.id, { value: inputValue, unit });
            }, [inputValue, unit, field.id, onChange]);

            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="flex items-center justify-between mt-2 py-2 border-b border-gray-200 dark:border-gray-700">
                        <input
                            type="number"
                            placeholder={field.placeholder}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={disabled}
                            className="border-none p-0 focus:ring-0 text-gray-900 dark:text-gray-100 text-lg bg-transparent disabled:opacity-50"
                        />
                        <div className="flex rounded-md">
                            {field.units?.map((u, index) => (
                                <button
                                    key={u}
                                    type="button"
                                    onClick={() => setUnit(u)}
                                    disabled={disabled}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors shadow-sm
                                        ${unit === u 
                                            ? 'bg-blue-600 text-white border-blue-600 z-10' 
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}
                                        ${index === 0 ? 'rounded-l-md' : '-ml-px'}
                                        ${index === (field.units?.length || 0) - 1 ? 'rounded-r-md' : ''}
                                        disabled:opacity-50
                                    `}
                                >
                                    {u}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );

        case 'scope':
            return (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="space-y-4 mt-2">
                        {field.options?.map(option => (
                            <div
                                key={option.id}
                                onClick={() => !disabled && onChange(field.id, option.id)}
                                className={`p-4 border rounded-lg transition-all ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${value === option.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500' : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500'}`}
                            >
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{option.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm">{option.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'text':
        case 'textarea':
             return (
                <div>
                    <label className="block font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                        <textarea
                            rows={5}
                            required={field.required}
                            placeholder={field.placeholder}
                            value={value || ''}
                            onChange={(e) => onChange(field.id, e.target.value)}
                            disabled={disabled}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        />
                    ) : (
                        <input
                            required={field.required}
                            placeholder={field.placeholder}
                            value={value || ''}
                            onChange={(e) => onChange(field.id, e.target.value)}
                            disabled={disabled}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        />
                    )}
                </div>
            );

        case 'location':
            const { location, loading, error, requestLocation } = useGeolocation();
            
            React.useEffect(() => {
                if (location) {
                    onChange(field.id, { text: `${location.latitude}, ${location.longitude}`, latitude: location.latitude, longitude: location.longitude });
                }
            }, [location, field.id, onChange]);

            return (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="relative">
                        <MapPinIcon className="h-5 w-5 text-gray-400 absolute top-3.5 left-3" />
                        <input
                            type="text"
                            placeholder={field.placeholder}
                            value={value?.text || ''}
                            onChange={e => onChange(field.id, { text: e.target.value })}
                            disabled={disabled}
                            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
                        />
                    </div>
                    <div className="my-4 text-center text-gray-500 dark:text-gray-400 text-sm">veya</div>
                    <button
                        type="button"
                        onClick={requestLocation}
                        disabled={loading || disabled}
                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/30"
                    >
                        {loading ? 'Konum Alınıyor...' : <> <ClockIcon className="h-5 w-5" /> Tam Konumumu Kullan </>}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                </div>
            );
        case 'toggle':
            return (
                 <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                        <label className="font-medium text-gray-900 dark:text-gray-100">{field.label}</label>
                        {field.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{field.description}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={() => !disabled && onChange(field.id, !value)}
                        className={`${value ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors disabled:opacity-50`}
                        role="switch"
                        aria-checked={value || false}
                        disabled={disabled}
                    >
                        <span className={`${value ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                    </button>
                </div>
            );
        default:
            return null;
    }
}

export default QuoteWizard;