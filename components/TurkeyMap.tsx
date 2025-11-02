import * as React from 'react';

// A mapping from the display names in mock data to an ID for the SVG paths
const REGION_NAME_TO_ID: { [key: string]: string } = {
    'Marmara Bölgesi': 'marmara',
    'Ege Bölgesi': 'ege',
    'Akdeniz Bölgesi': 'akdeniz',
    'İç Anadolu Bölgesi': 'ic-anadolu',
    'Karadeniz Bölgesi': 'karadeniz',
    'Doğu Anadolu Bölgesi': 'dogu-anadolu',
    'Güneydoğu Anadolu Bölgesi': 'guneydogu-anadolu',
};

// Simplified SVG path data for the 7 geographical regions of Turkey
const regionPaths = [
    { id: 'marmara', name: 'Marmara', d: "M106 76 L118 70 L124 64 L137 68 L152 64 L158 58 L169 57 L184 62 L188 70 L179 79 L174 90 L163 94 L150 93 L142 98 L133 98 L127 92 L116 87 L106 76 Z" },
    { id: 'ege', name: 'Ege', d: "M106 76 L116 87 L127 92 L133 98 L130 112 L120 125 L110 135 L98 130 L90 120 L88 105 L95 90 L106 76 Z" },
    { id: 'akdeniz', name: 'Akdeniz', d: "M130 112 L133 98 L142 98 L150 93 L163 94 L174 90 L188 95 L200 105 L220 115 L235 128 L245 140 L220 145 L190 135 L160 130 L130 112 Z" },
    { id: 'ic-anadolu', name: 'İç Anadolu', d: "M174 90 L179 79 L188 70 L195 75 L210 78 L225 85 L240 90 L255 105 L245 120 L235 128 L220 115 L200 105 L188 95 L174 90 Z" },
    { id: 'karadeniz', name: 'Karadeniz', d: "M184 62 L188 70 L195 75 L210 78 L225 85 L240 90 L260 85 L280 80 L300 70 L320 65 L310 55 L280 60 L250 55 L220 50 L190 52 L184 62 Z" },
    { id: 'dogu-anadolu', name: 'Doğu Anadolu', d: "M255 105 L260 85 L280 80 L300 70 L320 65 L335 75 L350 90 L340 110 L325 125 L300 130 L275 120 L255 105 Z" },
    { id: 'guneydogu-anadolu', name: 'Güneydoğu Anadolu', d: "M245 140 L255 120 L275 120 L300 130 L325 125 L310 145 L280 150 L245 140 Z" }
];

interface TurkeyMapProps {
    highlightedRegions: string[];
}

const TurkeyMap: React.FC<TurkeyMapProps> = ({ highlightedRegions }) => {
    const highlightedIds = highlightedRegions.map(name => REGION_NAME_TO_ID[name]).filter(Boolean);

    return (
        <div className="relative w-full aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
             <style>{`
                .region-path {
                    transition: fill 0.3s ease, transform 0.2s ease;
                    stroke: #FFFFFF;
                    stroke-width: 0.5;
                    cursor: pointer;
                }
                .region-path:hover {
                    fill-opacity: 0.8;
                    transform: translateY(-2px);
                }
                .region-text {
                    font-size: 8px;
                    font-weight: 500;
                    fill: #fff;
                    pointer-events: none;
                    text-shadow: 0 0 2px rgba(0,0,0,0.7);
                }
                .region-text.dark {
                     fill: #374151;
                     text-shadow: none;
                }
            `}</style>
            <svg viewBox="80 40 280 120" className="w-full h-full">
                <g>
                    {regionPaths.map(({ id, name, d }) => {
                        const isHighlighted = highlightedIds.includes(id);
                        return (
                             <g key={id}>
                                <path
                                    className="region-path"
                                    d={d}
                                    fill={isHighlighted ? '#3b82f6' : '#d1d5db'}
                                >
                                    <title>{name} Bölgesi {isHighlighted ? '(Hizmet Veriliyor)' : ''}</title>
                                </path>
                             </g>
                        );
                    })}
                </g>
            </svg>
             <div className="absolute bottom-2 right-2 bg-white/70 backdrop-blur-sm p-2 rounded-md text-xs">
                <h4 className="font-bold mb-1">Lejant</h4>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
                    <span>Hizmet Bölgesi</span>
                </div>
                 <div className="flex items-center gap-2 mt-1">
                    <span className="w-3 h-3 bg-gray-300 rounded-sm"></span>
                    <span>Diğer Bölgeler</span>
                </div>
            </div>
        </div>
    );
};

export default TurkeyMap;