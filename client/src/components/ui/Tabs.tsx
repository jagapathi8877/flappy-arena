import type React from 'react';

interface TabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange }) => (
  <div className="flex p-1 bg-sky-bg/30 rounded-lg border border-card-border">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-all ${
          activeTab === tab.id
            ? 'bg-white text-pipe-green shadow-sm'
            : 'text-text-dark/60 hover:text-text-dark hover:bg-white/50'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
