import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface ScreenExtensionProps {
  children: React.ReactNode;
}

export const ScreenExtension: React.FC<ScreenExtensionProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`screen-extension ${isOpen ? '' : 'closed'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="screen-extension-toggle flex items-center space-x-2"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Contraer panel" : "Expandir panel"}
      >
        {isOpen ? (
          <>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
            <span>Cerrar</span>
          </>
        ) : (
          <>
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
            <span>Expandir</span>
          </>
        )}
      </button>
      <div className="p-4">{children}</div>
    </div>
  );
};