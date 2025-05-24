import { Box, Tags, DollarSign, FileSpreadsheet, Users, Cloud, Activity } from 'lucide-react';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'products', label: 'Produtos', icon: Box },
  { id: 'categories', label: 'Categorias', icon: Tags },
  { id: 'pricing', label: 'Preços', icon: DollarSign },
  { id: 'users', label: 'Usuários', icon: Users },
  { id: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { id: 'backup', label: 'Backup', icon: Cloud },
  { id: 'monitoring', label: 'Monitoramento', icon: Activity },
];

export function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
  console.log('AdminTabs renderizando com', tabs.length, 'abas:', tabs.map(t => t.label)); // Debug
  
  return (
    <div className="mb-8">
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="inline mr-2 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
