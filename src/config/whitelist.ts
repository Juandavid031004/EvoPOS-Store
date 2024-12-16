// Lista de correos autorizados para crear una cuenta (cada uno representa un negocio diferente)
export const authorizedEmails = [
  'evopos12@gmail.com',
  'juandavid45678910@gmail.com',
  'elpive@gmail.com',
].map(email => email.toLowerCase());

// Credenciales por defecto del administrador (igual para todos los negocios)
export const defaultAdmin = {
  username: 'ADMIN',
  password: '123456',
  nombre: 'Administrador',
  sucursal: 'Principal',
  role: 'admin',
  permisos: ['all']
};

// Configuración para todos los usuarios autorizados
export const authorizedUsers = authorizedEmails.map(email => ({
  email,
  username: 'ADMIN',
  password: '123456',
  nombre: 'Administrador',
  sucursal: 'Principal',
  role: 'admin',
  permisos: ['all']
}));