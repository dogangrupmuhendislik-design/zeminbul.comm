import * as React from 'react';
import { HomeIcon, PlusCircleIcon, UserIcon, BriefcaseIcon, ChartBarIcon, UsersIcon, MessageIcon, CurrencyDollarIcon, DocumentCheckIcon, ChatBubbleBottomCenterTextIcon } from './icons';
import { UserRole, View } from '../types';

interface BottomNavbarProps {
  userRole: UserRole | null; // Allow null for guest users
  activeView: View;
  onNavigate: (view: View) => void;
  hasNewMessages?: boolean;
}

interface NavItemProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  view: View;
  active: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick, hasNotification }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center space-y-1 w-full text-center transition-colors duration-200 ${
      active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
    }`}
  >
    {hasNotification && (
        <span className="absolute top-0 right-1/2 translate-x-4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
    )}
    <Icon className="h-6 w-6" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const BottomNavbar: React.FC<BottomNavbarProps> = ({ userRole, activeView, onNavigate, hasNewMessages }) => {
  
  const getNavItems = () => {
    // Admin Navigation
    if (userRole === 'admin') {
      return [
        { icon: HomeIcon, label: 'Panel', view: 'adminDashboard' as View },
        { icon: ChartBarIcon, label: 'Analitik', view: 'adminAnalytics' as View },
        { icon: UsersIcon, label: 'Kullanıcılar', view: 'adminUsers' as View },
        { icon: BriefcaseIcon, label: 'İlanlar', view: 'adminJobs' as View },
        { icon: DocumentCheckIcon, label: 'Onaylar', view: 'adminPendingJobs' as View },
        { icon: MessageIcon, label: 'Destek', view: 'adminTickets' as View },
        { icon: CurrencyDollarIcon, label: 'Finans', view: 'adminTransactions' as View },
      ];
    }
    
    // Guest User Navigation
    if (!userRole) {
      return [
        { icon: HomeIcon, label: 'Anasayfa', view: 'home' as View },
        { icon: PlusCircleIcon, label: 'İlan Ver / İş İlanları', view: 'postJob' as View },
        { icon: UserIcon, label: 'Profil', view: 'profile' as View },
      ];
    }

    // Provider Navigation
    if (userRole === 'provider') {
      return [
        { icon: HomeIcon, label: 'Anasayfa', view: 'home' as View },
        { icon: BriefcaseIcon, label: 'İş İlanları', view: 'postJob' as View },
        { icon: ChatBubbleBottomCenterTextIcon, label: 'Mesajlar', view: 'messages' as View },
        { icon: UserIcon, label: 'Profil', view: 'profile' as View },
      ];
    }

    // Customer Navigation
    return [
      { icon: HomeIcon, label: 'Anasayfa', view: 'home' as View },
      { icon: BriefcaseIcon, label: 'İlanlarım', view: 'myListings' as View },
      { icon: ChatBubbleBottomCenterTextIcon, label: 'Mesajlar', view: 'messages' as View },
      { icon: UserIcon, label: 'Profil', view: 'profile' as View },
    ];
  };

  const navItems = getNavItems();
  
  const activeNavItem = navItems.find(item => item.view === activeView);

  // If the active view is related to a primary nav item, use it.
  // Otherwise, fallback to a sensible default (e.g., if on 'jobDetail', 'home' or 'postJob' might be active).
  const getActiveViewForNav = () => {
      // Keep existing logic for customer and provider
      if (activeView === 'myListings' || activeView === 'editJob' || (userRole === 'customer' && (activeView === 'jobDetail' || activeView === 'bids' || activeView === 'postJob'))) {
          return 'myListings';
      }
       if (userRole === 'provider' && (activeView === 'jobDetail' || activeView === 'bids')) {
          return 'postJob';
      }

      // Add specific logic for admin sub-views
      if (userRole === 'admin') {
          if (activeView === 'adminUserDetail') return 'adminUsers';
          if (activeView === 'adminJobDetail') return 'adminJobs';
          if (activeView === 'adminVerification' || activeView === 'adminPendingProfiles') return 'adminDashboard';
          if (activeView === 'adminReports') return 'adminDashboard';
          if (activeView === 'adminSettings' || activeView === 'profile') return 'adminDashboard';
      }
      
      if (activeView === 'chat') return 'messages';

      // Fallback to the current view
      return activeView;
  }
  
  const currentActiveNav = getActiveViewForNav();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex items-center justify-around z-50 dark:bg-gray-800 dark:border-gray-700">
      {navItems.map((item) => (
        <NavItem
          key={item.label}
          icon={item.icon}
          label={item.label}
          view={item.view}
          active={currentActiveNav === item.view}
          hasNotification={item.view === 'messages' && hasNewMessages}
          onClick={() => onNavigate(item.view)}
        />
      ))}
    </nav>
  );
};

export default BottomNavbar;