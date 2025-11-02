import * as React from 'react';
import { Service } from '../types';
import { supabase } from '../utils/supabaseClient';
import { SERVICES } from '../constants'; // Import the fallback services

interface CategoriesContextType {
    categories: Service[];
    loading: boolean;
    error: string | null;
    refetchCategories: () => Promise<void>;
}

const CategoriesContext = React.createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = React.useState<Service[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchCategories = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // NOTE FOR DEVELOPER: This feature requires a 'services' table in Supabase.
            // The table should contain columns: id (uuid), name (text), description (text), icon_name (text), imageUrl (text).
            // You can populate it initially from the data in 'constants.ts'.
            const { data, error: dbError } = await supabase
                .from('services')
                .select('*')
                .order('name', { ascending: true });
            
            if (dbError || !data || data.length === 0) {
                throw new Error(dbError?.message || "No categories found in the database.");
            }

            setCategories(data as Service[]);
        } catch (e) {
            const errorMessage = "Veritabanından kategoriler yüklenemedi, varsayılan veriler kullanılıyor. (Admin panelinden yönetmek için 'services' tablosunu Supabase'de oluşturun.)";
            console.warn(errorMessage, e);
            setError(errorMessage);
            // Fallback to the hardcoded services if the DB call fails
            setCategories(SERVICES);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return (
        <CategoriesContext.Provider value={{ categories, loading, error, refetchCategories: fetchCategories }}>
            {children}
        </CategoriesContext.Provider>
    );
};

export const useCategories = (): CategoriesContextType => {
    const context = React.useContext(CategoriesContext);
    if (context === undefined) {
        throw new Error('useCategories must be used within a CategoriesProvider');
    }
    return context;
};