'use client';

import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts';

interface GameData {
  Week: number;
  [key: string]: number;
}

interface ChartVisualizationProps {
  title: string;
  data: GameData[];
  statKey: string;
  color: string;
}

type ChartType = 'line' | 'column';

export default function ChartVisualization({ title, data, statKey, color }: ChartVisualizationProps) {
  const [chartType, setChartType] = useState<ChartType>('line');

  const chartTypes = [
    { id: 'line', label: 'Line', icon: '📈' },
    { id: 'column', label: 'Column', icon: '📊' }
  ] as const;

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    // Calculate average for reference line - fixed to show exact average
    const average = data.reduce((sum, game) => sum + (game[statKey] || 0), 0) / data.length;

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <ReferenceLine 
              y={average} 
              stroke="#FCD34D" 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Line 
              type="monotone" 
              dataKey={statKey} 
              stroke={color} 
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={false}
            />
          </LineChart>
        );

      case 'column':
        return (
          <BarChart {...commonProps}>
            <ReferenceLine 
              y={average} 
              stroke="#FCD34D" 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <Bar 
              dataKey={statKey} 
              fill={color}
              radius={[2, 2, 0, 0]}
              label={{
                position: 'center',
                angle: -90,
                fontSize: 10,
                fill: 'white',
                fontWeight: 'bold'
              }}
              cursor="default"
            />
          </BarChart>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-8">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        
        {/* Chart Type Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {chartTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setChartType(type.id as ChartType)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                chartType === type.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-1">{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="h-40 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-gray-500">Stability</div>
          <div className="font-semibold text-gray-900">
            {(data.reduce((sum, game) => sum + (game[statKey] || 0), 0) / data.length).toFixed(1)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Consistency</div>
          <div className="font-semibold text-gray-900">
            {Math.max(...data.map(game => game[statKey] || 0))}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Average</div>
          <div className="font-semibold text-gray-900">
            {Math.min(...data.map(game => game[statKey] || 0))}
          </div>
        </div>
      </div>
    </div>
  );
}
