import React, { useState } from 'react';
import { Settings, Building2, Users, Store } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { BranchManagement } from './BranchManagement';
import { BusinessConfigView } from './BusinessConfig';
import { User, Sucursal, BusinessConfig } from '../../types';

interface SettingsLayoutProps {
  currentUser: User;
  users: User[];
  sucursales: Sucursal[];
  config: BusinessConfig;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onAddBranch: (branch: Omit<Sucursal, 'id' | 'createdAt'>) => void;
  onUpdateBranch: (id: string, branch: Partial<Sucursal>) => void;
  onDeleteBranch: (id: string) => void;
  onUpdateConfig: (config: Partial<BusinessConfig>) => void;
}

export const SettingsLayout = ({
  currentUser,
  users,
  sucursales = [], // Provide default empty array
  config,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onUpdateConfig
}: SettingsLayoutProps) => {
  const [activeTab, setActiveTab] = useState<'users' | 'branches' | 'business'>('business');

  const tabs = [
    {
      id: 'business',
      label: 'Empresa',
      icon: Store,
      component: <BusinessConfigView config={config} onUpdateConfig={onUpdateConfig} />
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      component: (
        <UserManagement
          currentUser={currentUser}
          users={users}
          sucursales={sucursales}
          onAddUser={onAddUser}
          onUpdateUser={onUpdateUser}
          onDeleteUser={onDeleteUser}
        />
      )
    },
    {
      id: 'branches',
      label: 'Sucursales',
      icon: Building2,
      component: (
        <BranchManagement
          sucursales={sucursales}
          onAddBranch={onAddBranch}
          onUpdateBranch={onUpdateBranch}
          onDeleteBranch={onDeleteBranch}
        />
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Configuración
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Configura los ajustes de tu negocio
          </p>
        </div>
        <div className="px-6">
          <div className="flex space-x-4" role="tablist" aria-label="Opciones de configuración">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`${tab.id}-panel`}
                id={`${tab.id}-tab`}
              >
                <tab.icon className="h-5 w-5" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        {tabs.map(tab => (
          <div
            key={tab.id}
            role="tabpanel"
            aria-labelledby={`${tab.id}-tab`}
            id={`${tab.id}-panel`}
            className={activeTab === tab.id ? '' : 'hidden'}
          >
            {tab.component}
          </div>
        ))}
      </div>
    </div>
  );
};