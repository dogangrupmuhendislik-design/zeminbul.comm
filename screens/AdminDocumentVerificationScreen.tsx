import * as React from 'react';
import { View, Profile, UploadedDocument } from '../types';
import { supabase } from '../utils/supabaseClient';
import DrillingRigLoader from '../components/DrillingRigLoader';
import { CheckBadgeIcon, XCircleIcon, DocumentArrowUpIcon, DocumentCheckIcon } from '../components/icons';

interface AdminDocumentVerificationScreenProps {
    onNavigate: (view: View, id?: string) => void;
}

const AdminDocumentVerificationScreen: React.FC<AdminDocumentVerificationScreenProps> = ({ onNavigate }) => {
    const [pendingDocs, setPendingDocs] = React.useState<(Profile & { pending_doc: UploadedDocument })[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [rejectionModal, setRejectionModal] = React.useState<{ profileId: string; docType: UploadedDocument['type'] } | null>(null);
    const [rejectionReason, setRejectionReason] = React.useState('');

    const fetchPendingDocuments = React.useCallback(async () => {
        setLoading(true);
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .not('uploaded_documents', 'is', null);

        if (error) {
            console.error("Error fetching profiles with documents:", error);
        } else {
            const allPendingDocs = profiles.flatMap(p => 
                (p.uploaded_documents || [])
                    .filter((doc: UploadedDocument) => doc.status === 'pending')
                    .map((doc: UploadedDocument) => ({ ...p, pending_doc: doc }))
            );
            setPendingDocs(allPendingDocs);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => {
        fetchPendingDocuments();
    }, [fetchPendingDocuments]);
    
    const updateDocumentStatus = async (profileId: string, docType: UploadedDocument['type'], status: 'approved' | 'rejected', reason?: string) => {
        const profile = pendingDocs.find(p => p.id === profileId)?.id ? pendingDocs.find(p => p.id === profileId) : (await supabase.from('profiles').select('*').eq('id', profileId).single()).data;
        if (!profile) return;
        
        const updatedDocs = (profile.uploaded_documents || []).map((doc: UploadedDocument) => 
            doc.type === docType ? { ...doc, status, rejectionReason: reason } : doc
        );

        const { error } = await supabase.from('profiles').update({ uploaded_documents: updatedDocs }).eq('id', profileId);
        if (error) {
            alert('Hata: ' + error.message);
        } else {
             fetchPendingDocuments(); // Refresh list
        }
    };
    
    const handleApprove = (profileId: string, docType: UploadedDocument['type']) => {
        updateDocumentStatus(profileId, docType, 'approved');
    };

    const handleReject = () => {
        if (!rejectionModal || !rejectionReason.trim()) return;
        updateDocumentStatus(rejectionModal.profileId, rejectionModal.docType, 'rejected', rejectionReason);
        setRejectionModal(null);
        setRejectionReason('');
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Bekleyen Belge Onayları ({pendingDocs.length})</h2>
            {loading ? <DrillingRigLoader /> : (
                <div className="space-y-4">
                    {pendingDocs.length > 0 ? (
                        pendingDocs.map(item => (
                            <DocumentCard
                                key={`${item.id}-${item.pending_doc.type}`}
                                profile={item}
                                doc={item.pending_doc}
                                onApprove={() => handleApprove(item.id, item.pending_doc.type)}
                                onReject={() => setRejectionModal({ profileId: item.id, docType: item.pending_doc.type })}
                                onNavigate={onNavigate}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl shadow-md">
                            <DocumentCheckIcon className="h-16 w-16 mx-auto text-green-400" />
                            <h3 className="mt-4 text-xl font-semibold text-gray-800">Tüm Belgeler Onaylı!</h3>
                            <p className="mt-2 text-gray-500">Onay bekleyen yeni bir firma belgesi bulunmuyor.</p>
                        </div>
                    )}
                </div>
            )}
            {rejectionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setRejectionModal(null)}>
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-lg">Reddetme Nedeni</h3>
                        <p className="text-sm text-gray-600 mt-1">Lütfen belgeyi neden reddettiğinizi kısaca belirtin.</p>
                        <textarea
                            value={rejectionReason}
                            onChange={e => setRejectionReason(e.target.value)}
                            rows={3}
                            className="w-full mt-4 p-2 border rounded-md"
                            placeholder="Örn: Belge okunaklı değil, yanlış belge türü, geçersiz tarih."
                        />
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setRejectionModal(null)} className="bg-gray-200 px-4 py-2 rounded-md font-semibold">İptal</button>
                            <button onClick={handleReject} className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold">Reddet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const documentTypeNames: Record<UploadedDocument['type'], string> = {
    tax_certificate: 'Vergi Levhası',
    trade_registry: 'Ticaret Sicil Gazetesi',
    qualification_certificate: 'Mesleki Yeterlilik Belgesi',
};

const DocumentCard: React.FC<{ profile: Profile; doc: UploadedDocument; onApprove: () => void; onReject: () => void; onNavigate: (v: View, id: string) => void }> = ({ profile, doc, onApprove, onReject, onNavigate }) => (
    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200/80">
        <p className="font-bold text-gray-800 cursor-pointer hover:underline" onClick={() => onNavigate('adminUserDetail', profile.id)}>
            {profile.company_name || profile.name}
        </p>
        <p className="text-sm text-gray-500">{profile.email}</p>
        
        <div className="mt-4 bg-gray-50 p-3 rounded-lg border">
            <p className="font-semibold">{documentTypeNames[doc.type]}</p>
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                {doc.fileName}
            </a>
            <p className="text-xs text-gray-400 mt-1">Yüklenme: {new Date(doc.uploadedAt).toLocaleString('tr-TR')}</p>
        </div>
        
        <div className="mt-4 flex justify-end gap-3">
            <button onClick={onReject} className="flex items-center gap-1.5 text-sm font-semibold bg-red-100 text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-200">
                <XCircleIcon className="h-4 w-4" /> Reddet
            </button>
            <button onClick={onApprove} className="flex items-center gap-1.5 text-sm font-semibold bg-green-100 text-green-800 px-3 py-1.5 rounded-lg hover:bg-green-200">
                <CheckBadgeIcon className="h-4 w-4" /> Onayla
            </button>
        </div>
    </div>
);


export default AdminDocumentVerificationScreen;
