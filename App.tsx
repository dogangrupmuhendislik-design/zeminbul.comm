
import * as React from 'react';
import { supabase, isConfigured } from './utils/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { View, UserRole, Profile } from './types';
import { CategoriesProvider } from './contexts/CategoriesContext';

// Screens
import CustomerDashboard from './screens/CustomerDashboard';
import ProviderDashboard from './screens/ProviderDashboard';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import ProfileScreen from './screens/Profile';
import EditProfileScreen from './screens/EditProfileScreen';
import PostJobScreen from './screens/PostJob';
import JobListingsScreen from './screens/JobListings';
import JobDetailScreen from './screens/JobDetail';
import BidsScreen from './screens/BidsScreen';
import MyListingsScreen from './screens/MyListingsScreen';
import EditJobScreen from './screens/EditJobScreen';
import AddFundsScreen from './screens/AddFundsScreen';
import PaymentSuccessScreen from './screens/PaymentSuccessScreen';
import PaymentCancelScreen from './screens/PaymentCancelScreen';
import ProPlanScreen from './screens/ProPlanScreen';
import FAQScreen from './screens/FAQScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsOfUseScreen from './screens/TermsOfUseScreen';
import HizmetPolitikasiScreen from './screens/HizmetPolitikasiScreen';
import VerificationRequestScreen from './screens/VerificationRequestScreen';
import NotificationsScreen from './screens/Notifications';
import MessagesScreen from './screens/MessagesScreen';
import ChatScreen from './screens/ChatScreen';
import RateExperienceScreen from './screens/RateExperienceScreen';
import AboutUsScreen from './screens/AboutUsScreen';
import ContactUsScreen from './screens/ContactUsScreen';
import ProviderProfileScreen from './screens/ProviderProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import CareersScreen from './screens/CareersScreen';
import HelpCenterScreen from './screens/HelpCenterScreen';


// Admin Screens
import AdminLayout from './screens/AdminLayout';
import AdminDashboard from './screens/AdminDashboard';
import AdminUsers from './screens/AdminUsers';
import AdminJobs from './screens/AdminJobs';
import AdminUserDetail from './screens/AdminUserDetail';
import AdminJobDetail from './screens/AdminJobDetail';
import AdminVerificationScreen from './screens/AdminVerificationScreen';
import AdminTransactions from './screens/AdminTransactions';
import AdminSettings from './screens/AdminSettings';
import AdminPendingJobs from './screens/AdminPendingJobs';
import AdminReports from './screens/AdminReports';
import AdminAnalytics from './screens/AdminAnalytics';
import AdminPendingProfiles from './screens/AdminPendingProfiles';
import AdminDisputesScreen from './screens/AdminDisputesScreen';
import AdminVerificationRequestsScreen from './screens/AdminVerificationRequestsScreen';
import AdminDocumentVerificationScreen from './screens/AdminDocumentVerificationScreen';
import AdminInternalMessagesScreen from './screens/AdminInternalMessagesScreen';
import AdminChatScreen from './screens/AdminChatScreen';
import AdminAllMessagesScreen from './screens/AdminAllMessagesScreen';
import AdminViewChatScreen from './screens/AdminViewChatScreen';
import AdminCategoriesScreen from './screens/AdminCategoriesScreen';
import AdminTickets from './screens/AdminMessages';
import AdminJobApplications from './screens/AdminJobApplications';
import AdminJobOpenings from './screens/AdminJobOpenings';

// Global components
import BottomNavbar from './components/BottomNavbar';
import OfflineBanner from './components/OfflineBanner';
import AlertModal from './components/AlertModal';
import { QuestionMarkCircleIcon } from './components/icons';
import DrillingRigLoader from './components/DrillingRigLoader';


const App: React.FC = () => {
    // State
    const [session, setSession] = React.useState<Session | null>(null);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [loading, setLoading] = React.useState(true);
    
    // Navigation state
    const [view, setView] = React.useState<View>('home');
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const [activeData, setActiveData] = React.useState<any | null>(null);
    const [viewHistory, setViewHistory] = React.useState<({ view: View, id: string | null, data: any | null })[]>([]);
    
    // Auth modal state
    const [authAction, setAuthAction] = React.useState<'login' | 'register' | null>(null);
    const [authRole, setAuthRole] = React.useState<UserRole>('customer');
    const [alert, setAlert] = React.useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
    const [hasNewMessages, setHasNewMessages] = React.useState(false);

    // Theme state
    const [theme, setTheme] = React.useState<'light' | 'dark'>(
        localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light'
    );

    // Theme effect
    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.querySelector('body')?.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.querySelector('body')?.classList.remove('dark');
            localStorage.theme = 'light';
        }
    }, [theme]);

    const handleThemeChange = () => setTheme(theme === 'light' ? 'dark' : 'light');

    // Safety Timeout Effect
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (loading) {
                console.warn("Safety timeout triggered: Force stopping loading state to prevent infinite loop.");
                setLoading(false);
            }
        }, 7000); // 7 seconds timeout

        return () => clearTimeout(timer);
    }, [loading]);

    // Auth effect
    React.useEffect(() => {
        let isMounted = true;

        const initAuth = async () => {
            try {
                // If keys are missing, don't even try to fetch, just set loaded and return
                if (!isConfigured) {
                    console.log("Supabase not configured, skipping auth check.");
                    if (isMounted) setLoading(false);
                    return;
                }

                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (!isMounted) return;

                setSession(session);

                if (session?.user) {
                    const { data, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    
                    if (profileError) {
                        console.error('Error fetching profile:', profileError);
                        setProfile(null);
                    } else {
                        setProfile(data);
                    }
                } else {
                    setProfile(null);
                }
            } catch (err) {
                console.error("Supabase initialization failed (check .env or network):", err);
                // In case of fetch error (e.g. missing keys/network), prevent crash by assuming no session
                if (isMounted) {
                    setSession(null);
                    setProfile(null);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initAuth();

        // Only subscribe if configured
        if (isConfigured) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
                if (!isMounted) return;
                setSession(session);
                if (session?.user) {
                    try {
                        const { data, error } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single();
                        
                        if (error) {
                            console.error('Error fetching profile on auth change:', error);
                            setProfile(null);
                        } else {
                            setProfile(data);
                        }
                    } catch (err) {
                         console.error("Profile fetch error:", err);
                         setProfile(null);
                    }
                } else {
                    setProfile(null);
                }
            });

            return () => {
                isMounted = false;
                subscription.unsubscribe();
            };
        } else {
            return () => { isMounted = false; };
        }
    }, []);

    // Handle password recovery flow
    React.useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('type=recovery')) {
            setView('resetPassword');
        }
    }, []);


    // Navigation handlers
    const handleNavigate = (newView: View, id: string | null = null, data: any = null) => {
        setViewHistory(prev => [...prev, { view, id: activeId, data: activeData }]);
        setView(newView);
        setActiveId(id);
        setActiveData(data);
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        const lastView = viewHistory.pop();
        if (lastView) {
            setView(lastView.view);
            setActiveId(lastView.id);
            setActiveData(lastView.data);
            setViewHistory([...viewHistory]);
        } else {
            // Default back action if history is empty
            handleNavigate('home');
        }
    };

    const requireAuth = (callback: () => void) => {
        if (session) {
            callback();
        } else {
            setAuthAction('login');
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
        handleNavigate('home');
    };

    const handleAuthRequest = (action: 'login' | 'register' | null, role: UserRole = 'customer') => {
        setAuthAction(action);
        setAuthRole(role);
    };
    
    // Render logic
    const renderView = () => {
        if (loading) return <DrillingRigLoader />;

        // Security Guard: Redirect unauthorized users trying to access admin pages
        if (view.startsWith('admin') && profile?.role !== 'admin') {
            // setTimeout is used to avoid state update during render
            setTimeout(() => handleNavigate('home'), 0);
            return <DrillingRigLoader />; // Show loader while redirecting
        }

        // Handle admin views
        if (profile?.role === 'admin' && view.startsWith('admin')) {
             const isAdminRoot = view === 'adminDashboard';
             return (
                 <AdminLayout onNavigate={handleNavigate} title={isAdminRoot ? '' : view.replace('admin', '')} onBack={isAdminRoot ? undefined : handleBack}>
                     {
                         {
                             'adminDashboard': <AdminDashboard onNavigate={handleNavigate} />,
                             'adminUsers': <AdminUsers onNavigate={handleNavigate} />,
                             'adminJobs': <AdminJobs onNavigate={handleNavigate} />,
                             'adminUserDetail': <AdminUserDetail userId={activeId!} />,
                             'adminJobDetail': <AdminJobDetail jobId={activeId!} />,
                             'adminVerification': <AdminVerificationScreen onNavigate={handleNavigate} />,
                             'adminTransactions': <AdminTransactions onNavigate={handleNavigate} />,
                             'adminSettings': <AdminSettings onNavigate={handleNavigate} />,
                             'adminPendingJobs': <AdminPendingJobs onNavigate={handleNavigate} />,
                             'adminReports': <AdminReports onNavigate={handleNavigate} />,
                             'adminAnalytics': <AdminAnalytics onNavigate={handleNavigate} />,
                             'adminPendingProfiles': <AdminPendingProfiles onNavigate={handleNavigate} />,
                             'adminVerificationRequests': <AdminVerificationRequestsScreen onNavigate={handleNavigate} />,
                             'adminDocumentVerifications': <AdminDocumentVerificationScreen onNavigate={handleNavigate} />,
                             'adminDisputes': <AdminDisputesScreen onNavigate={handleNavigate} />,
                             'adminTickets': <AdminTickets onNavigate={handleNavigate} />,
                             'adminInternalMessages': <AdminInternalMessagesScreen onNavigate={handleNavigate} />,
                             'adminChat': <AdminChatScreen recipientId={activeId!} currentAdminId={profile.id} />,
                             'adminAllMessages': <AdminAllMessagesScreen onNavigate={handleNavigate} />,
                             'adminViewChat': <AdminViewChatScreen conversationId={activeId!} />,
                             'adminCategories': <AdminCategoriesScreen onNavigate={handleNavigate} />,
                             'adminJobApplications': <AdminJobApplications onNavigate={handleNavigate} />,
                             'adminJobOpenings': <AdminJobOpenings onNavigate={handleNavigate} />,
                         }[view] || <AdminDashboard onNavigate={handleNavigate} />
                     }
                 </AdminLayout>
             );
        }

        switch (view) {
            case 'home':
                if (profile?.role === 'provider') return <ProviderDashboard onNavigate={handleNavigate} />;
                if (profile?.role === 'admin') {
                    handleNavigate('adminDashboard');
                    return null;
                }
                return <CustomerDashboard requireAuth={requireAuth} onNavigate={handleNavigate} userRole={profile?.role || null} onAuthRequest={handleAuthRequest} theme={theme} onThemeChange={handleThemeChange} />;
            case 'profile':
                if (!profile) { handleNavigate('home'); return null; }
                return <ProfileScreen userRole={profile.role} onLogout={handleLogout} onNavigate={handleNavigate} theme={theme} onThemeChange={handleThemeChange}/>;
            case 'editProfile':
                if (!profile) { handleNavigate('home'); return null; }
                return <EditProfileScreen userRole={profile.role} onBack={handleBack} />;
            case 'postJob':
                if (profile?.role === 'provider') return <JobListingsScreen onNavigate={(v, id) => handleNavigate(v, id)} />;
                return <PostJobScreen onBack={handleBack} initialService={activeData as any} initialData={activeData} />;
            case 'jobDetail': return <JobDetailScreen jobId={activeId!} userRole={profile?.role || null} onBack={handleBack} onNavigate={handleNavigate} />;
            case 'bids':
                if (!profile) { handleNavigate('home'); return null; }
                return <BidsScreen jobId={activeId!} userRole={profile.role} onBack={handleBack} onNavigate={handleNavigate} />;
            case 'myListings': return <MyListingsScreen onNavigate={handleNavigate} />;
            case 'editJob': return <EditJobScreen jobId={activeId!} onBack={handleBack} />;
            case 'addFunds': return <AddFundsScreen onBack={handleBack} onNavigate={handleNavigate} />;
            case 'paymentSuccess': return <PaymentSuccessScreen onNavigate={handleNavigate} />;
            case 'paymentCancel': return <PaymentCancelScreen onNavigate={handleNavigate} />;
            case 'proPlan': return <ProPlanScreen onBack={handleBack} onNavigate={handleNavigate} />;
            case 'faq': return <FAQScreen onBack={handleBack} />;
            case 'helpCenter': return <HelpCenterScreen onBack={handleBack} onNavigate={handleNavigate} />;
            case 'careers': return <CareersScreen onBack={handleBack} />;
            case 'privacyPolicy': return <PrivacyPolicyScreen onBack={handleBack} />;
            case 'termsOfUse': return <TermsOfUseScreen onBack={handleBack} />;
            case 'hizmetPolitikasi': return <HizmetPolitikasiScreen onBack={handleBack} />;
            case 'verificationRequest': return <VerificationRequestScreen onBack={handleBack} />;
            case 'notifications':
                if (!profile) { handleNavigate('home'); return null; }
                return <NotificationsScreen userRole={profile.role} onNavigate={handleNavigate} />;
            case 'messages': return <MessagesScreen onNavigate={handleNavigate} onViewMessages={() => setHasNewMessages(false)} />;
            case 'chat': return <ChatScreen conversationId={activeId!} onBack={handleBack} />;
            case 'rateExperience': return <RateExperienceScreen jobId={activeId!} providerId={activeData} onBack={handleBack} />;
            case 'aboutUs': return <AboutUsScreen onBack={handleBack} />;
            case 'contactUs': return <ContactUsScreen onBack={handleBack} />;
            case 'providerProfile': return <ProviderProfileScreen providerId={activeId!} onBack={handleBack} />;
            case 'settings': return <SettingsScreen onBack={handleBack} onLogout={handleLogout} onNavigate={handleNavigate} />;
            case 'forgotPassword': return <ForgotPasswordScreen onBack={() => { setAuthAction('login'); setView('home'); }} />;
            case 'resetPassword': return <ResetPasswordScreen onResetSuccess={() => { setView('home'); setAuthAction('login'); }} />;
            
            default: return <div>Not Found: {view}</div>;
        }
    };
    
    // Auth Modals
    const renderAuth = () => {
        if (authAction === 'login') {
            return <LoginScreen 
                onLoginSuccess={() => { setAuthAction(null); handleNavigate('home'); }} 
                onNavigateToRegister={() => setAuthAction('register')}
                onNavigateToForgotPassword={() => setView('forgotPassword')}
                onCancel={() => setAuthAction(null)}
            />;
        }
        if (authAction === 'register') {
            return <RegisterScreen 
                onRegisterSuccess={() => setAlert({
                    title: 'Kayıt Başarılı!',
                    message: 'Hesabınızı doğrulamak için e-posta adresinize bir onay linki gönderdik. Lütfen e-postanızı kontrol edin.',
                    onConfirm: () => { setAlert(null); setAuthAction('login'); }
                })}
                onNavigateToLogin={() => setAuthAction('login')}
                onCancel={() => setAuthAction(null)}
                onNavigateToTerms={() => handleNavigate('termsOfUse')}
                onNavigateToPolicy={() => handleNavigate('privacyPolicy')}
                onNavigateToServicePolicy={() => handleNavigate('hizmetPolitikasi')}
                initialRole={authRole}
            />;
        }
        return null;
    };


    return (
        <CategoriesProvider>
            <div className={theme}>
                <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
                    <div className={profile?.role !== 'admin' ? 'pb-20' : ''}>
                        {renderView()}
                    </div>
                    {renderAuth()}
                    {profile && profile.role !== 'admin' && <BottomNavbar userRole={profile.role} activeView={view} onNavigate={handleNavigate} hasNewMessages={hasNewMessages} />}
                    {alert && <AlertModal title={alert.title} message={alert.message} onConfirm={alert.onConfirm} confirmText="Tamam" icon={QuestionMarkCircleIcon} />}
                    <OfflineBanner />
                </div>
            </div>
        </CategoriesProvider>
    );
};

export default App;
