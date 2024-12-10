import React from 'react';

export const Loading: React.FC = () => {
  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
        <p className="mt-4 text-sky-600 font-medium">Cargando...</p>
      </div>
    </div>
  );
};