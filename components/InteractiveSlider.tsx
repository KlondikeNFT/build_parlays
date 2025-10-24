'use client';

import { useState, useEffect, useRef } from 'react';

interface InteractiveSliderProps {
  label: string;
  min: number;
  max: number;
  initialValue?: number;
  onValueChange?: (value: number, probability: number) => void;
}

export default function InteractiveSlider({ 
  label, 
  min, 
  max, 
  initialValue, 
  onValueChange 
}: InteractiveSliderProps) {
  const [value, setValue] = useState(initialValue || min);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Calculate probability based on value position
  const calculateProbability = (val: number) => {
    const range = max - min;
    const position = (val - min) / range;
    // Simple probability calculation - you can make this more sophisticated
    return Math.round(100 - (position * 65)); // 100% at min, 35% at max
  };

  // Get gradient color based on probability
  const getGradientColor = (probability: number) => {
    if (probability >= 70) {
      // High probability - Green gradient
      return 'from-[#00FF5D] to-[#00B743]';
    } else if (probability >= 40) {
      // Medium probability - Yellow gradient
      return 'from-[#EEFF00] to-[#FFEA00]';
    } else {
      // Low probability - Red gradient
      return 'from-[#FF5100] to-[#FF0000]';
    }
  };

  const probability = calculateProbability(value);
  const fillPercentage = ((value - min) / (max - min)) * 100;

  const handleStart = (clientX: number) => {
    setIsDragging(true);
    updateValue(clientX);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    updateValue(clientX);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  const updateValue = (clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newValue = Math.round(min + (percentage / 100) * (max - min));
    
    setValue(newValue);
    onValueChange?.(newValue, calculateProbability(newValue));
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-blue-600 font-bold text-lg">{label}</h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-black">{probability}%</div>
          <div className="text-sm text-gray-500">Chance</div>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative" style={{ touchAction: 'none' }}>
        {/* Slider Track */}
        <div 
          ref={sliderRef}
          className="h-9 bg-gray-200 cursor-pointer relative"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Filled Portion */}
          <div 
            className={`h-9 bg-gradient-to-r absolute top-0 left-0 ${getGradientColor(probability)}`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        {/* Slider Handle */}
        <div 
          className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-9 bg-white border-2 border-gray-300 shadow-lg cursor-pointer transition-transform ${
            isDragging ? 'scale-110' : 'hover:scale-105'
          }`}
          style={{ 
            left: `calc(${fillPercentage}% - 12px)`,
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />

        {/* Value Bubble */}
        <div 
          className="absolute -top-8 transform -translate-x-1/2 pointer-events-none"
          style={{ left: `${fillPercentage}%` }}
        >
          <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-lg border border-gray-200">
            {value}
          </div>
        </div>
      </div>

      {/* Min/Max Labels */}
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
