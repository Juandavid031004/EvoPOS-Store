import { realtimeDb } from '../config/firebase';
import { ref, set, get, push, update } from 'firebase/database';

// Función para guardar datos de la empresa
export const guardarDatosEmpresa = async (email: string, datos: any) => {
  try {
    const empresaRef = ref(realtimeDb, `negocios/${email}/empresa`);
    await set(empresaRef, {
      ...datos,
      updatedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error al guardar datos de empresa:', error);
    throw error;
  }
};

// Función para guardar datos de sucursal
export const guardarSucursal = async (email: string, sucursal: any) => {
  try {
    const sucursalRef = ref(realtimeDb, `negocios/${email}/sucursales/principal`);
    await set(sucursalRef, {
      ...sucursal,
      updatedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error al guardar sucursal:', error);
    throw error;
  }
};

// Función para guardar datos de usuario
export const guardarUsuario = async (email: string, usuario: any) => {
  try {
    const usuarioRef = ref(realtimeDb, `negocios/${email}/usuarios/admin`);
    await set(usuarioRef, {
      ...usuario,
      updatedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    throw error;
  }
};

// Función para inicializar todos los datos de un negocio
export const inicializarNegocio = async (email: string) => {
  try {
    const datosIniciales = {
      empresa: {
        nombre: "EvoPOS Store",
        razonSocial: "pendiente",
        ruc: "pendiente",
        direccion: "pendiente",
        telefono: "pendiente",
        correo: email,
        sitioWeb: "pendiente",
        logo: "pendiente",
        stockMinimo: 5
      },
      sucursales: {
        principal: {
          nombre: "Sucursal Principal",
          direccion: "pendiente",
          telefono: "pendiente",
          encargado: "Administrador",
          estado: "activo"
        }
      },
      usuarios: {
        admin: {
          nombre: "Administrador",
          username: "ADMIN",
          password: "123456",
          role: "admin",
          permisos: ["all"],
          estado: "activo"
        }
      }
    };

    const negocioRef = ref(realtimeDb, `negocios/${email}`);
    await set(negocioRef, datosIniciales);
    return true;
  } catch (error) {
    console.error('Error al inicializar negocio:', error);
    throw error;
  }
};

// Función para obtener datos de la empresa
export const obtenerDatosEmpresa = async (email: string) => {
  try {
    const empresaRef = ref(realtimeDb, `negocios/${email}/empresa`);
    const snapshot = await get(empresaRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error al obtener datos de empresa:', error);
    throw error;
  }
};

export const guardarProducto = async (email: string, producto: any) => {
  try {
    const productoRef = ref(realtimeDb, `negocios/${email}/productos`);
    const newProductRef = push(productoRef);
    await set(newProductRef, {
      ...producto,
      createdAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error al guardar producto:', error);
    throw error;
  }
};

export const obtenerProductos = async (email: string) => {
  try {
    const productosRef = ref(realtimeDb, `negocios/${email}/productos`);
    const snapshot = await get(productosRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

export const actualizarProducto = async (email: string, productoId: string, producto: any) => {
  try {
    const productoRef = ref(realtimeDb, `negocios/${email}/productos/${productoId}`);
    await update(productoRef, {
      ...producto,
      updatedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    throw error;
  }
};

export const guardarVenta = async (email: string, venta: any) => {
  try {
    const ventaRef = ref(realtimeDb, `negocios/${email}/ventas`);
    const newVentaRef = push(ventaRef);
    await set(newVentaRef, {
      ...venta,
      createdAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error al guardar venta:', error);
    throw error;
  }
};

export const guardarCliente = async (email: string, cliente: any) => {
  try {
    const clienteRef = ref(realtimeDb, `negocios/${email}/clientes`);
    const newClienteRef = push(clienteRef);
    await set(newClienteRef, {
      ...cliente,
      createdAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error al guardar cliente:', error);
    throw error;
  }
}; 