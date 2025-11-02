import * as React from 'react';
import { Bid, BidStatus } from '../types';
import { BuildingOffice2Icon, CheckBadgeIcon, XCircleIcon, ClockIcon, StarIcon } from './icons';

interface BidCardProps {
    bid: Bid;
    isCustomerView: boolean;
    isJobAwarded: boolean;
    onAccept: () => void;
    onReject: () => void;
    onViewProfile?: () => void;
}

const BidStatusBadge: React.FC<{ status: BidStatus }> = ({ status }) => {
    const statusStyles = {
        pending: { text: 'Bekliyor', icon: ClockIcon, classes: 'bg-yellow-100 text-yellow-800' },
        accepted: { text: 'Kabul Edildi', icon: CheckBadgeIcon, classes: 'bg-green-100 text-green-800' },
        rejected: { text: 'Reddedildi', icon: XCircleIcon, classes: 'bg-red-100 text-red-800' }
    };
    const { text, icon: Icon, classes } = statusStyles[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${classes}`}>
            <Icon className="h-4 w-4" />
            {text}
        </span>
    );
};

const BidCard: React.FC<BidCardProps> = ({ bid, isCustomerView, isJobAwarded, onAccept, onReject, onViewProfile }) => {
    const hasRating = bid.provider_average_rating && bid.provider_rating_count;

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start">
                <div 
                    onClick={isCustomerView ? onViewProfile : undefined} 
                    className={`flex items-center gap-3 ${isCustomerView ? 'cursor-pointer group' : ''}`}
                >
                    {bid.provider_logo_url ? (
                         <img src={bid.provider_logo_url} alt={`${bid.provider_name} logosu`} className="h-12 w-12 rounded-full object-cover border" />
                    ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <BuildingOffice2Icon className="h-7 w-7" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 group-hover:underline">{bid.provider_name}</h3>
                        {hasRating && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <StarIcon className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm font-bold text-gray-700">{bid.provider_average_rating?.toFixed(1)}</span>
                                <span className="text-xs text-gray-500">({bid.provider_rating_count} değerlendirme)</span>
                            </div>
                        )}
                        <p className="text-xl font-extrabold text-blue-600 mt-1">{bid.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</p>
                    </div>
                </div>
                 <BidStatusBadge status={bid.status} />
            </div>

            {bid.notes && (
                <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-700 italic">"{bid.notes}"</p>
                </div>
            )}
            
            {isCustomerView && bid.status === 'pending' && !isJobAwarded && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                    <button 
                        onClick={onAccept}
                        className="flex-1 bg-green-500 text-white font-bold py-2.5 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <CheckBadgeIcon className="h-5 w-5" />
                        Kabul Et
                    </button>
                    <button 
                        onClick={onReject}
                        className="flex-1 bg-red-500 text-white font-bold py-2.5 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                    >
                         <XCircleIcon className="h-5 w-5" />
                        Reddet
                    </button>
                </div>
            )}
        </div>
    );
};

export default BidCard;