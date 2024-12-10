export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nombre: string
          username: string
          password: string
          rol: string
          sucursal_id: string
          permisos: string[]
          activo: boolean
          created_at: string
          business_email: string
        }
        Insert: {
          id?: string
          email: string
          nombre: string
          username: string
          password: string
          rol: string
          sucursal_id: string
          permisos: string[]
          activo?: boolean
          created_at?: string
          business_email: string
        }
        Update: {
          id?: string
          email?: string
          nombre?: string
          username?: string
          password?: string
          rol?: string
          sucursal_id?: string
          permisos?: string[]
          activo?: boolean
          created_at?: string
          business_email?: string
        }
      }
      products: {
        Row: {
          id: string
          codigo: string
          nombre: string
          descripcion: string
          precio: number
          costo: number
          categoria: string
          sucursal_id: string
          stock: number
          stock_minimo: number
          imagen: string
          created_at: string
          business_email: string
        }
        Insert: {
          id?: string
          codigo: string
          nombre: string
          descripcion: string
          precio: number
          costo: number
          categoria: string
          sucursal_id: string
          stock: number
          stock_minimo: number
          imagen: string
          created_at?: string
          business_email: string
        }
        Update: {
          id?: string
          codigo?: string
          nombre?: string
          descripcion?: string
          precio?: number
          costo?: number
          categoria?: string
          sucursal_id?: string
          stock?: number
          stock_minimo?: number
          imagen?: string
          created_at?: string
          business_email?: string
        }
      }
      sales: {
        Row: {
          id: string
          cliente_id: string | null
          vendedor_id: string
          subtotal: number
          descuento: number
          total: number
          metodo_pago: string
          sucursal_id: string
          fecha: string
          business_email: string
        }
        Insert: {
          id?: string
          cliente_id?: string | null
          vendedor_id: string
          subtotal: number
          descuento: number
          total: number
          metodo_pago: string
          sucursal_id: string
          fecha?: string
          business_email: string
        }
        Update: {
          id?: string
          cliente_id?: string | null
          vendedor_id?: string
          subtotal?: number
          descuento?: number
          total?: number
          metodo_pago?: string
          sucursal_id?: string
          fecha?: string
          business_email?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
        }
      }
      customers: {
        Row: {
          id: string
          nombre: string
          telefono: string
          email: string
          puntos: number
          total_gastado: number
          created_at: string
          business_email: string
        }
        Insert: {
          id?: string
          nombre: string
          telefono: string
          email: string
          puntos?: number
          total_gastado?: number
          created_at?: string
          business_email: string
        }
        Update: {
          id?: string
          nombre?: string
          telefono?: string
          email?: string
          puntos?: number
          total_gastado?: number
          created_at?: string
          business_email?: string
        }
      }
      expenses: {
        Row: {
          id: string
          descripcion: string
          monto: number
          tipo: string
          fecha: string
          comprobante: string | null
          sucursal_id: string
          responsable: string
          estado: string
          observaciones: string | null
          business_email: string
        }
        Insert: {
          id?: string
          descripcion: string
          monto: number
          tipo: string
          fecha: string
          comprobante?: string | null
          sucursal_id: string
          responsable: string
          estado: string
          observaciones?: string | null
          business_email: string
        }
        Update: {
          id?: string
          descripcion?: string
          monto?: number
          tipo?: string
          fecha?: string
          comprobante?: string | null
          sucursal_id?: string
          responsable?: string
          estado?: string
          observaciones?: string | null
          business_email?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          nombre: string
          ruc: string
          direccion: string
          telefono: string
          email: string
          contacto: string
          productos: string[]
          activo: boolean
          created_at: string
          business_email: string
        }
        Insert: {
          id?: string
          nombre: string
          ruc: string
          direccion: string
          telefono: string
          email: string
          contacto: string
          productos: string[]
          activo?: boolean
          created_at?: string
          business_email: string
        }
        Update: {
          id?: string
          nombre?: string
          ruc?: string
          direccion?: string
          telefono?: string
          email?: string
          contacto?: string
          productos?: string[]
          activo?: boolean
          created_at?: string
          business_email?: string
        }
      }
      orders: {
        Row: {
          id: string
          proveedor_id: string
          fecha: string
          fecha_entrega: string | null
          estado: string
          total: number
          observaciones: string | null
          sucursal_id: string
          business_email: string
        }
        Insert: {
          id?: string
          proveedor_id: string
          fecha: string
          fecha_entrega?: string | null
          estado: string
          total: number
          observaciones?: string | null
          sucursal_id: string
          business_email: string
        }
        Update: {
          id?: string
          proveedor_id?: string
          fecha?: string
          fecha_entrega?: string | null
          estado?: string
          total?: number
          observaciones?: string | null
          sucursal_id?: string
          business_email?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          cantidad: number
          precio_unitario: number
          subtotal: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          cantidad?: number
          precio_unitario?: number
          subtotal?: number
        }
      }
      sucursales: {
        Row: {
          id: string
          nombre: string
          direccion: string
          telefono: string
          email: string
          encargado: string
          activo: boolean
          created_at: string
          business_email: string
        }
        Insert: {
          id?: string
          nombre: string
          direccion: string
          telefono: string
          email: string
          encargado: string
          activo?: boolean
          created_at?: string
          business_email: string
        }
        Update: {
          id?: string
          nombre?: string
          direccion?: string
          telefono?: string
          email?: string
          encargado?: string
          activo?: boolean
          created_at?: string
          business_email?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}