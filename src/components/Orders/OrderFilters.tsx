import React from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import { Order } from '../../types';

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: Order['estado'] | '';
  onStatusFilterChange: (value: Order['estado'] | '') => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
}

export const OrderFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange
}: OrderFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar por proveedor o ID..."
          className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 group-hover:border-purple-300"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="relative group">
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
        <select
          className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 group-hover:border-purple-300 appearance-none"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as Order['estado'] | '')}
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="recibido">Recibido</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="relative group">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-5 w-5" />
        <input
          type="month"
          className="w-full pl-10 pr-4 py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200 group-hover:border-purple-300"
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
        />
      </div>
    </div>
  );
};