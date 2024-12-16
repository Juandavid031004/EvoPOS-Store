import React, { useState } from 'react';
import { Store, ShoppingCart, Users, BarChart2, Package, DollarSign, Settings, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authorizedEmails, defaultAdmin } from '../config/whitelist';
import { DEFAULT_PERMISSIONS } from '../types';

interface LoginProps {
  onLogin: (email: string, username: string, password: string) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validar el correo electrónico
      if (!authorizedEmails.includes(email.toLowerCase())) {
        throw new Error('Correo no autorizado');
      }

      // Intentar iniciar sesión
      await onLogin(email, username, password);
      
      toast.success('Acceso exitoso', {
        icon: '🔑',
        duration: 2000
      });
    } catch (error) {
      toast.error('Credenciales inválidas', {
        icon: '🚫',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 animate-gradient-x relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-pink-500/30 rounded-full mix-blend-soft-light filter blur-3xl animate-float" aria-hidden="true"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-purple-500/30 rounded-full mix-blend-soft-light filter blur-3xl animate-float" style={{ animationDelay: '2s' }} aria-hidden="true"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-indigo-500/30 rounded-full mix-blend-soft-light filter blur-3xl animate-float" style={{ animationDelay: '4s' }} aria-hidden="true"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row gap-8 items-start">
        {/* Columna Izquierda: Logo y Características */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Logo y Título */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-br from-white/90 to-white/50 p-5 rounded-full shadow-2xl transform hover:scale-105 transition-transform duration-300 mb-4 backdrop-blur-sm">
              <Store className="h-20 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full p-3 drop-shadow-lg animate-float" />
            </div>
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 tracking-tight drop-shadow-lg mb-2">
              EvoPOS
            </h2>
            <p className="text-xl text-purple-100/90 font-light tracking-wide drop-shadow-md">
              Sistema Integral de Gestión Comercial
            </p>
          </div>

          {/* Panel de características */}
          <div className="bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-pink-400" />
              Características del Sistema
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group bg-white/[0.03] rounded-xl p-4 hover:bg-white/[0.08] transition-all duration-300 border border-white/5 hover:border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <ShoppingCart className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-base">Ventas</h4>
                </div>
                <ul className="text-purple-100/80 text-sm space-y-1.5 pl-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-pink-400"></div>
                    Gestión en tiempo real
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-pink-400"></div>
                    Facturas y boletas
                  </li>
                </ul>
              </div>

              <div className="group bg-white/[0.03] rounded-xl p-4 hover:bg-white/[0.08] transition-all duration-300 border border-white/5 hover:border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-base">Clientes</h4>
                </div>
                <ul className="text-purple-100/80 text-sm space-y-1.5 pl-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                    Sistema de fidelización
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                    Historial de compras
                  </li>
                </ul>
              </div>

              <div className="group bg-white/[0.03] rounded-xl p-4 hover:bg-white/[0.08] transition-all duration-300 border border-white/5 hover:border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-base">Inventario</h4>
                </div>
                <ul className="text-purple-100/80 text-sm space-y-1.5 pl-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                    Control de stock
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                    Alertas de mínimos
                  </li>
                </ul>
              </div>

              <div className="group bg-white/[0.03] rounded-xl p-4 hover:bg-white/[0.08] transition-all duration-300 border border-white/5 hover:border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gradient-to-br from-indigo-500 to-pink-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                    <BarChart2 className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-bold text-white text-base">Reportes</h4>
                </div>
                <ul className="text-purple-100/80 text-sm space-y-1.5 pl-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                    Informes diarios
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-indigo-400"></div>
                    Estadísticas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Login y Soporte */}
        <div className="w-full lg:w-1/2 space-y-4 mt-8 lg:mt-16">
          {/* Panel de Login */}
          <div className="bg-white/95 backdrop-blur-xl p-8 shadow-2xl rounded-3xl border border-white/20 max-w-md mx-auto">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 text-center">
              Iniciar Sesión
            </h3>
            <form 
              id="loginForm" 
              className="space-y-5" 
              onSubmit={handleLogin}
              role="form"
              aria-label="Formulario de inicio de sesión"
            >
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                             transition-all duration-300 ease-in-out
                             hover:border-indigo-400"
                    placeholder="ejemplo@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="text-gray-400">
                      <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    className="appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all duration-300 ease-in-out
                             hover:border-indigo-400"
                    placeholder="ADMIN"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toUpperCase())}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="text-gray-400">
                      <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 
                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                             transition-all duration-300 ease-in-out
                             hover:border-indigo-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <div className="text-gray-400">
                      <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-base font-medium text-white 
                         bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700
                         shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                         transition-all duration-300 ease-in-out transform hover:scale-[1.02] mt-6"
              >
                Iniciar Sesión
              </button>
            </form>
          </div>

          {/* Panel de Soporte - Versión más compacta */}
          <div className="bg-white/95 backdrop-blur-xl p-5 shadow-2xl rounded-3xl border border-white/20 mt-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Contacto y Soporte
              </h3>
              <p className="text-purple-600 text-sm font-medium">
                Lun-Vie 9:00-18:00
              </p>
            </div>
            
            <div className="flex gap-2">
              <a 
                href="mailto:EvoPOS12@GMAIL.COM?subject=Consulta%20EvoPOS&body=Hola,%20me%20gustar%C3%ADa%20obtener%20m%C3%A1s%20informaci%C3%B3n%20sobre%20EvoPOS." 
                className="flex-1 flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors group bg-indigo-50 p-2.5 rounded-xl hover:bg-indigo-100"
              >
                <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-sm font-medium">Email</span>
              </a>
              
              <a 
                href="https://wa.me/51982438693" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 flex items-center justify-center gap-2 text-purple-600 hover:text-purple-700 transition-colors group bg-purple-50 p-2.5 rounded-xl hover:bg-purple-100"
              >
                <svg className="h-4 w-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span className="text-sm font-medium">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};