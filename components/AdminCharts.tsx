import * as React from 'react';

// Bar Chart Component
interface BarChartProps {
    data: { month: string; customers: number; providers: number }[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const [tooltip, setTooltip] = React.useState<{ x: number, y: number, month: string, customers: number, providers: number } | null>(null);
    const containerRef = React.useRef<SVGSVGElement>(null);

    const maxValue = Math.ceil(Math.max(...data.flatMap(d => [d.customers, d.providers])) / 10) * 10 || 10;
    const yAxisValues = [0, maxValue / 2, maxValue];

    const handleMouseOver = (e: React.MouseEvent<SVGRectElement, MouseEvent>, item: any) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setTooltip({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            ...item
        });
    };

    return (
        <div className="w-full h-full relative">
            <svg ref={containerRef} width="100%" height="100%" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet">
                {/* Y Axis and Grid Lines */}
                {yAxisValues.map((val, i) => (
                    <g key={i}>
                        <text x="0" y={195 - (val / maxValue) * 170} fontSize="10" fill="#6b7280">{val}</text>
                        <line x1="25" y1={190 - (val / maxValue) * 170} x2="400" y2={190 - (val / maxValue) * 170} stroke="#e5e7eb" strokeWidth="1" />
                    </g>
                ))}

                {/* Bars and X Axis Labels */}
                {data.map((item, index) => {
                    const x = 50 + index * (350 / data.length);
                    const barWidth = (350 / data.length) / 2.5;
                    const customerHeight = (item.customers / maxValue) * 170;
                    const providerHeight = (item.providers / maxValue) * 170;
                    return (
                        <g key={item.month}>
                            <rect
                                x={x - barWidth / 2}
                                y={190 - customerHeight}
                                width={barWidth}
                                height={customerHeight}
                                fill="#3b82f6"
                                className="transition-opacity duration-200"
                                onMouseOver={(e) => handleMouseOver(e, item)}
                                onMouseOut={() => setTooltip(null)}
                            />
                            <rect
                                x={x + barWidth / 2 + 2}
                                y={190 - providerHeight}
                                width={barWidth}
                                height={providerHeight}
                                fill="#f97316"
                                className="transition-opacity duration-200"
                                onMouseOver={(e) => handleMouseOver(e, item)}
                                onMouseOut={() => setTooltip(null)}
                            />
                            <text x={x + barWidth/2} y="210" fontSize="10" textAnchor="middle" fill="#374151">{item.month}</text>
                        </g>
                    );
                })}
            </svg>
            {tooltip && (
                <div 
                    className="absolute bg-gray-800 text-white text-xs rounded-md p-2 pointer-events-none transition-all duration-100" 
                    style={{ left: tooltip.x + 10, top: tooltip.y - 40 }}
                >
                    <p className="font-bold">{tooltip.month}</p>
                    <p><span className="text-blue-400">■</span> Müşteri: {tooltip.customers}</p>
                    <p><span className="text-orange-400">■</span> Firma: {tooltip.providers}</p>
                </div>
            )}
            <div className="absolute -bottom-4 right-0 flex space-x-4 text-xs">
                <div className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-sm mr-1.5"></span>Müşteri</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-orange-500 rounded-sm mr-1.5"></span>Firma</div>
            </div>
        </div>
    );
};

// Pie Chart Component
interface PieChartProps {
    data: { name: string; value: number; color: string }[];
}

const PieSlice: React.FC<{ slice: any, total: number }> = ({ slice, total }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const { startAngle, endAngle, color, name, value } = slice;
    const radius = 80;
    const center = 100;
    
    const getCoordinates = (angle: number, r: number) => [
        center + r * Math.cos(angle),
        center + r * Math.sin(angle)
    ];

    const [startX, startY] = getCoordinates(startAngle, radius);
    const [endX, endY] = getCoordinates(endAngle, radius);
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    const pathData = `M ${center},${center} L ${startX},${startY} A ${radius},${radius} 0 ${largeArcFlag},1 ${endX},${endY} Z`;

    return (
        <g 
            onMouseOver={() => setIsHovered(true)}
            onMouseOut={() => setIsHovered(false)}
            className="transition-transform duration-200"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center center' }}
        >
            <path d={pathData} fill={color} stroke="#fff" strokeWidth="2" />
            {isHovered && (
                <text x={center} y={center - 5} textAnchor="middle" fill="#111827" fontSize="16" fontWeight="bold">{`${((value / total) * 100).toFixed(1)}%`}</text>
            )}
        </g>
    );
};

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    if (total === 0) {
        return <div className="w-full h-full flex items-center justify-center text-gray-500">Veri yok</div>;
    }
    let startAngle = -Math.PI / 2;
    const slices = data.map(d => {
        const angle = (d.value / total) * 2 * Math.PI;
        const slice = {
            ...d,
            startAngle,
            endAngle: startAngle + angle,
        };
        startAngle += angle;
        return slice;
    });

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <svg width="200" height="200" viewBox="0 0 200 200">
                {slices.map((slice, i) => (
                    <PieSlice key={i} slice={slice} total={total} />
                ))}
            </svg>
            <div className="mt-4 w-full grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {data.map(item => (
                    <div key={item.name} className="flex items-center">
                        <span style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-sm mr-2"></span>
                        <span className="text-gray-600 truncate">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Line Chart Component
interface LineChartProps {
    data: { label: string; value: number }[];
    color: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, color }) => {
    if (!data || data.length === 0) return <div className="w-full h-full flex items-center justify-center text-gray-500">Veri yok</div>;

    const width = 400;
    const height = 220;
    const padding = 30;

    const maxValue = Math.max(...data.map(d => d.value));
    const yMax = Math.ceil(maxValue / 10) * 10 || 10;
    
    const xScale = (i: number) => padding + i * ((width - padding * 2) / (data.length - 1));
    const yScale = (val: number) => height - padding - (val / yMax) * (height - padding * 2);

    const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.value)}`).join(' ');

    const yAxisValues = [0, yMax / 2, yMax];

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
            {/* Y-axis and grid lines */}
            {yAxisValues.map(val => (
                <g key={val}>
                    <text x={padding - 5} y={yScale(val) + 3} textAnchor="end" fontSize="10" fill="#6b7280">{val}</text>
                    <line x1={padding} y1={yScale(val)} x2={width - padding} y2={yScale(val)} stroke="#e5e7eb" strokeWidth="1" />
                </g>
            ))}

            {/* X-axis labels */}
            {data.map((d, i) => (
                <text key={d.label} x={xScale(i)} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#374151">
                    {d.label}
                </text>
            ))}

            {/* Line Path */}
            <path d={path} fill="none" stroke={color} strokeWidth="2" />

            {/* Data Points */}
            {data.map((d, i) => (
                <circle key={i} cx={xScale(i)} cy={yScale(d.value)} r="3" fill={color} />
            ))}
        </svg>
    );
};
