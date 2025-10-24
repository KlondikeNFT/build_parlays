'use client';

import { useState } from 'react';

interface TabNavigationProps {
  onTabChange?: (tab: string) => void;
}

export default function TabNavigation({ onTabChange }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState('Tools');

  const tabs = [
    { id: 'Tools', label: 'Tools' },
    { id: 'Volatility', label: 'Volatility' },
    { id: 'Game Log', label: 'Game Log' },
    { id: 'Patterns', label: 'Patterns' }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className="bg-gradient-to-r from-gray-500 to-black">
      <div className="flex">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex-1 py-4 px-4 text-center transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-600 text-white'
                : 'text-white hover:bg-gray-700'
            }`}
          >
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
