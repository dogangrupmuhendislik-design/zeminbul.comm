import * as React from 'react';

// Uygulama içi kullanılan türler
export type UserRole = "customer" | "provider" | "admin";
export type View = 'home' | 'postJob' | 'notifications' | 'profile' | 'jobDetail' | 'addFunds' | 'editProfile' | 'settings' | 'forgotPassword' | 'resetPassword' | 'bids' | 'myListings' | 'editJob' | 'providerProfile' | 'proPlan' | 'faq' | 'privacyPolicy' | 'termsOfUse' | 'hizmetPolitikasi' | 'adminDashboard' | 'adminUsers' | 'adminJobs' | 'adminUserDetail' | 'adminJobDetail' | 'adminVerification' | 'paymentSuccess' | 'paymentCancel' | 'contactUs' | 'adminTickets' | 'adminTransactions' | 'adminSettings' | 'adminPendingJobs' | 'adminReports' | 'adminAnalytics' | 'adminPendingProfiles' | 'verificationRequest' | 'adminVerificationRequests' | 'messages' | 'chat' | 'adminDocumentVerifications' | 'adminDisputes' | 'adminInternalMessages' | 'adminChat' | 'rateExperience' | 'aboutUs' | 'adminAllMessages' | 'adminViewChat' | 'adminCategories' | 'careers' | 'helpCenter' | 'adminJobApplications' | 'adminJobOpenings';

export interface UploadedDocument {
  type: 'tax_certificate' | 'trade_registry' | 'qualification_certificate';
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
}

export interface ContactSettings {
    id: string;
    address: string;
    email: string;
    phone: string; // Added phone just in case, though currently stored in code
    live_support_text: string;
    subjects: string[];
}

export interface JobApplication {
    id: string;
    job_title: string;
    applicant_name: string;
    email: string;
    phone: string;
    cv_link: string;
    cover_letter: string;
    status: 'pending' | 'interview' | 'rejected';
    created_at: string;
}

export interface CareerJob {
    id: string;
    title: string;
    type: string; // Tam Zamanlı, Yarı Zamanlı vs.
    location: string;
    description: string;
    requirements: string[];
    is_active: boolean;
    created_at: string;
}

export interface Profile {
  id: string;
  role: UserRole;
  name?: string;
  email?: string;
  is_pro?: boolean;
  balance?: number;
  company_name?: string;
  is_verified?: boolean;
  tax_id?: string;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  pending_verification_data?: {
    company_name: string;
    tax_id: string;
  };
  avatar_url?: string;
  logo_url?: string;
  description?: string;
  phone?: string;
  website?: string;
  portfolio?: PortfolioItem[];
  services_offered?: string[];
  certifications?: string[];
  awards?: string[];
  service_area?: { regions: string[] };
  machine_park?: Machine[];
  created_at?: string;
  pending_data?: {
    company_name?: string;
    logo_url?: string;
    description?: string;
    phone?: string;
    website?: string;
  };
  profile_status?: 'approved' | 'pending_review';
  average_rating?: number;
  rating_count?: number;
  uploaded_documents?: UploadedDocument[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon_name: string;
  imageUrl?: string;
}

export interface QuoteRequest {
  serviceId: string;
  answers: Record<string, any>;
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

export type WizardFieldType = 'unit-input' | 'scope' | 'text' | 'textarea' | 'location' | 'toggle' | 'select';

export interface WizardField {
  id: string;
  label: string;
  placeholder?: string;
  type: WizardFieldType;
  required?: boolean;
  units?: string[];
  options?: {
    id: string;
    title: string;
    description?: string;
  }[];
  description?: string;
  proOnly?: boolean;
}

export interface WizardStep {
  step: number;
  title: string;
  subtitle?: string;
  fields: WizardField[];
}

export interface JobListing {
  id: string;
  author_id: string;
  category_id: string;
  created_at: string;
  details: string | null;
  location: {
    text: string;
    latitude?: number;
    longitude?: number;
  } | null;
  title: string;
  wizard_answers: { [key: string]: any } | null;
  isUrgent?: boolean;
  status?: 'pending_review' | 'open' | 'active' | 'completed' | 'rejected';
  budget?: string;
  awarded_to?: string; // provider_id
}

export interface PortfolioItem {
  image: string;
  title: string;
  description: string;
}

export interface Notification {
  id: string;
  created_at: string;
  description: string | null;
  read: boolean | null;
  title: string;
  user_id: string;
  type: 'new_bid' | 'bid_accepted' | 'bid_rejected' | 'job_updated' | 'profile_viewed' | 'generic';
  jobId?: string;
}

export interface Transaction {
  id: string;
  created_at: string;
  description: string;
  amount: number;
  type: 'deposit' | 'fee' | 'earning' | 'subscription' | 'adjustment';
  user_id: string;
}

export interface AdminTransaction {
  id: string;
  type: 'subscription' | 'deposit' | 'commission';
  userId: string;
  userName: string;
  amount: number;
  date: string; // ISO string
}

export interface AdminActivity {
  id: string;
  type: 'new_user' | 'new_job' | 'new_bid' | 'verify_provider' | 'accept_bid';
  userId: string;
  userName: string;
  targetId?: string;
  targetName?: string;
  timestamp: string; // ISO string
}

export interface PendingVerification {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registeredAt: string; // ISO string
  documentUrl?: string;
}


export interface CustomerProfile {
  name: string;
  email: string;
  phone: string;
  isPro: boolean;
  avatarUrl?: string;
  stats: {
    open: number;
    active: number;
    completed: number;
  };
  favorites: JobListing[];
  listings: JobListing[];
  transactions: Transaction[];
}

export type BidStatus = "pending" | "accepted" | "rejected";

export interface Bid {
    id: string;
    created_at: string;
    amount: number;
    job_id: string;
    notes: string | null;
    provider_id: string;
    status: BidStatus;
    jobTitle?: string;
    provider_name?: string;
    provider_logo_url?: string;
    provider_average_rating?: number;
    provider_rating_count?: number;
}

export interface Client {
  name: string;
  logoUrl: string;
}

export interface Rating {
  id: string;
  created_at: string;
  job_id: string;
  rater_id: string;
  rated_id: string;
  rating_by: 'customer' | 'provider';
  comment?: string;
  ratings: {
    [criterion: string]: number;
  };
  rater_profile?: Pick<Profile, 'name' | 'company_name' | 'avatar_url'>;
  job_listing?: Pick<JobListing, 'title'>;
}


export interface Machine {
  name: string;
  model: string;
  quantity: number;
}

export interface Testimonial {
  quote: string;
  clientName: string;
  projectName: string;
}

export interface ProviderProfile {
  companyName: string;
  logoUrl?: string;
  description: string;
  servicesOffered: string[];
  specialties: string[];
  certifications: string[];
  awards: string[];
  yearsInBusiness: number;
  portfolio: PortfolioItem[];
  clients: Client[];
  machinePark: Machine[];
  serviceArea: {
    mapUrl: string;
    regions: string[];
  };
  testimonials: Testimonial[];
  bids: Bid[];
  transactions: Transaction[];
  contact: {
    email: string;
    phone: string;
    website: string;
  };
  stats: {
    activeBids: number;
    wonJobs: number;
    balance: number;
    successRate: number;
    averageBidAmount: number;
    jobsWonLastYear: number;
    clientSatisfaction: number;
    totalBids?: number;
    totalEarnings?: number;
  };
  isVerified?: boolean;
  uploaded_documents?: UploadedDocument[];
}

export interface BidAnalysisResult {
  provider_name: string;
  amount: number;
  pros: string[];
  cons: string[];
  best_for: string;
}

export interface BidAnalysisResponse {
  recommendation: string;
  analysis: BidAnalysisResult[];
}

export interface Ticket {
  id: string;
  created_at: string;
  subject: string;
  message: string;
  user_id: string;
  status: 'open' | 'in_progress' | 'resolved';
  profiles?: {
    name?: string;
    company_name?: string;
    email?: string;
  }
}

export interface Report {
    id: string;
    created_at: string;
    job_id?: string;
    profile_id?: string;
    reporter_id: string;
    reason: string;
    status: 'open' | 'resolved';
    job_listings?: Pick<JobListing, 'title'>;
    reported_profile?: Pick<Profile, 'name' | 'company_name'>;
    reporter: Pick<Profile, 'name' | 'company_name'>;
}

export interface Conversation {
  id: string;
  created_at: string;
  job_id: string;
  customer_id: string;
  provider_id: string;
  // Joined data
  job_listings?: { title: string };
  customer?: { name: string, avatar_url?: string };
  provider?: { company_name: string, logo_url?: string };
  messages?: Message[]; // For fetching last message
}

export interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  content: string;
}

export interface AdminMessage {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
}


export interface Dispute {
  id: string;
  created_at: string;
  job_id: string;
  reporter_id: string;
  reason: string;
  details: string;
  status: 'open' | 'in_progress' | 'resolved';
  // Joined data
  job_listing?: Pick<JobListing, 'title'>;
  reporter?: Pick<Profile, 'name' | 'company_name'>;
}