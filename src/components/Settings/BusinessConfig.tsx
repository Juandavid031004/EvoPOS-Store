import React, { useState, useEffect } from 'react';
import { Upload, AlertTriangle, Save } from 'lucide-react';
import { BusinessConfig } from '../../types';
import toast from 'react-hot-toast';

interface BusinessConfigViewProps {
  config: BusinessConfig;
  onUpdateConfig: (config: Partial<BusinessConfig>) => void;
}

export const BusinessConfigView = ({ config, onUpdateConfig }: BusinessConfigViewProps) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    nombre: config.nombre || '',
    razonSocial: config.razonSocial || '',
    ruc: config.ruc || '',
    direccion: config.direccion || '',
    telefono: config.telefono || '',
    correo: config.correo || '',
    sitioWeb: config.sitioWeb || '',
    logo: config.logo || '',
    stockMinimo: config.stockMinimo || 5
  });

  useEffect(() => {
    setFormData({
      nombre: config.nombre || '',
      razonSocial: config.razonSocial || '',
      ruc: config.ruc || '',
      direccion: config.direccion || '',
      telefono: config.telefono || '',
      correo: config.correo || '',
      sitioWeb: config.sitioWeb || '',
      logo: config.logo || '',
      stockMinimo: config.stockMinimo || 5
    });
  }, [config]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) {
        toast.error('Logo debe ser menor a 2MB', {
          icon: '⚠️',
          duration: 3000
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, logo: base64 });
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validaciones
      if (formData.stockMinimo < 0) {
        toast.error('Stock mínimo inválido', {
          icon: '⚠️',
          duration: 3000
        });
        return;
      }

      if (formData.ruc && !/^\d{11}$/.test(formData.ruc)) {
        toast.error('RUC debe tener 11 dígitos', {
          icon: '⚠️',
          duration: 3000
        });
        return;
      }

      if (formData.telefono && !/^\d{9}$/.test(formData.telefono)) {
        toast.error('Teléfono debe tener 9 dígitos', {
          icon: '⚠️',
          duration: 3000
        });
        return;
      }

      // Actualizar configuración
      await onUpdateConfig(formData);
      setHasChanges(false);
      toast.success('Configuración actualizada', {
        icon: '✅',
        duration: 2000
      });

    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      toast.error('Error al guardar', {
        icon: '❌',
        duration: 3000
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-purple-100/50">
        {hasChanges && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-700">
                Hay cambios sin guardar. Asegúrese de guardar antes de salir.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
                Información General
              </h3>
              <div className="space-y-5">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Comercial
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.nombre}
                    onChange={(e) => {
                      setFormData({ ...formData, nombre: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.razonSocial}
                    onChange={(e) => {
                      setFormData({ ...formData, razonSocial: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    RUC
                  </label>
                  <input
                    type="text"
                    pattern="\d{11}"
                    title="El RUC debe tener 11 dígitos"
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.ruc}
                    onChange={(e) => {
                      setFormData({ ...formData, ruc: e.target.value });
                      setHasChanges(true);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Logo de la Empresa
            </h3>
            <div className="border-2 border-dashed border-purple-200 rounded-2xl p-8 bg-white/50 hover:border-purple-400 transition-colors duration-300">
              <div className="mb-6">
                {formData.logo ? (
                  <img 
                    src={formData.logo} 
                    alt="Logo" 
                    className="max-h-48 mx-auto object-contain rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center text-purple-300 bg-purple-50 rounded-xl">
                    <Upload className="h-16 w-16" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <input
                  type="file"
                  id="logo"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <label
                  htmlFor="logo"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl cursor-pointer hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 inline-block shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  {formData.logo ? 'Cambiar Logo' : 'Subir Logo'}
                </label>
                <p className="text-sm text-gray-500 mt-4">
                  Formato: JPG, PNG. Tamaño máximo: 2MB
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6" id="contacto-heading">
              Contacto
            </h3>
            <div className="space-y-5" role="group" aria-labelledby="contacto-heading">
              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  aria-label="Dirección de la empresa"
                  className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                  value={formData.direccion}
                  onChange={(e) => {
                    setFormData({ ...formData, direccion: e.target.value });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  pattern="\d{9}"
                  title="El teléfono debe tener 9 dígitos"
                  aria-label="Teléfono de la empresa"
                  aria-invalid={formData.telefono && !/^\d{9}$/.test(formData.telefono)}
                  aria-describedby="telefono-description"
                  className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                  value={formData.telefono}
                  onChange={(e) => {
                    setFormData({ ...formData, telefono: e.target.value });
                    setHasChanges(true);
                  }}
                />
                <div id="telefono-description" className="sr-only">El teléfono debe tener exactamente 9 dígitos numéricos</div>
              </div>

              <div>
                <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  aria-label="Correo electrónico de la empresa"
                  className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                  value={formData.correo}
                  onChange={(e) => {
                    setFormData({ ...formData, correo: e.target.value });
                    setHasChanges(true);
                  }}
                />
              </div>

              <div>
                <label htmlFor="sitioWeb" className="block text-sm font-medium text-gray-700 mb-2">
                  Sitio Web
                </label>
                <input
                  id="sitioWeb"
                  name="sitioWeb"
                  type="url"
                  aria-label="Sitio web de la empresa"
                  className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                  value={formData.sitioWeb}
                  onChange={(e) => {
                    setFormData({ ...formData, sitioWeb: e.target.value });
                    setHasChanges(true);
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6" id="sistema-heading">
              Configuración del Sistema
            </h3>
            <div 
              className="bg-white/50 p-6 rounded-xl border border-purple-100"
              role="group" 
              aria-labelledby="sistema-heading"
            >
              <div>
                <label htmlFor="stockMinimo" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Mínimo Global para Alertas
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    id="stockMinimo"
                    name="stockMinimo"
                    type="number"
                    min="0"
                    required
                    aria-required="true"
                    aria-invalid={formData.stockMinimo < 0}
                    aria-describedby="stockMinimo-description stockMinimo-help"
                    className="w-full p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-200"
                    value={formData.stockMinimo}
                    onChange={(e) => {
                      setFormData({ ...formData, stockMinimo: Number(e.target.value) });
                      setHasChanges(true);
                    }}
                  />
                  <div className="relative group">
                    <AlertTriangle 
                      className="h-6 w-6 text-yellow-500 cursor-help" 
                      aria-hidden="true"
                    />
                    <div 
                      className="absolute hidden group-hover:block bg-black text-white text-xs rounded-lg p-3 w-72 -top-2 left-8 shadow-xl"
                      role="tooltip"
                      id="stockMinimo-help"
                    >
                      Este valor se aplicará como stock mínimo por defecto para todos los productos nuevos.
                      Los productos existentes mantendrán su configuración individual.
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500" id="stockMinimo-description">
                  Se mostrarán alertas cuando el stock de un producto sea menor a este valor.
                  Este valor se usa como predeterminado para nuevos productos.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-purple-100">
          <button
            type="submit"
            id="submitButton"
            name="submitButton"
            disabled={!hasChanges}
            aria-disabled={!hasChanges}
            aria-label="Guardar cambios de configuración"
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-md hover:shadow-xl"
          >
            <Save className="h-5 w-5" aria-hidden="true" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
};