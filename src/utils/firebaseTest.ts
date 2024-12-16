import { realtimeDb } from '../config/firebase';
import { ref, set, get, push } from 'firebase/database';

export const testFirebaseConnection = async () => {
  try {
    const testRef = ref(realtimeDb, 'test');
    await set(testRef, {
      timestamp: Date.now(),
      message: 'Conexión exitosa'
    });
    
    const snapshot = await get(testRef);
    console.log('Test de Firebase exitoso:', snapshot.val());
    return true;
  } catch (error) {
    console.error('Error al probar Firebase:', error);
    return false;
  }
};

// Función para probar guardar un producto
export const testGuardarProducto = async (email: string) => {
  try {
    const productoRef = ref(realtimeDb, `negocios/${email}/productos`);
    const nuevoProducto = {
      nombre: "Producto de Prueba",
      precio: 100,
      stock: 10,
      categoria: "Test",
      codigo: "TEST001",
      descripcion: "Producto para probar la conexión"
    };
    
    const newProductRef = push(productoRef);
    await set(newProductRef, nuevoProducto);
    console.log('Producto guardado exitosamente');
    return true;
  } catch (error) {
    console.error('Error al guardar producto:', error);
    return false;
  }
};

// Función para verificar si se guardó el producto
export const verificarProducto = async (email: string) => {
  try {
    const productosRef = ref(realtimeDb, `negocios/${email}/productos`);
    const snapshot = await get(productosRef);
    if (snapshot.exists()) {
      console.log('Productos encontrados:', snapshot.val());
      return snapshot.val();
    } else {
      console.log('No se encontraron productos');
      return null;
    }
  } catch (error) {
    console.error('Error al verificar productos:', error);
    return null;
  }
}; 