# EvoPOS

Sistema de punto de venta moderno y eficiente desarrollado con React y Netlify Identity.

## Características

- Gestión de inventario en tiempo real
- Sistema de ventas intuitivo
- Gestión de clientes y proveedores
- Reportes y análisis
- Sistema de puntos para clientes
- Gestión de usuarios y permisos
- Múltiples métodos de pago
- Generación de facturas y boletas
- Gestión de sucursales

## Requisitos previos

- Node.js (v18 o superior)
- npm o yarn
- Cuenta en Netlify

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/evopos.git
cd evopos
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` en la raíz del proyecto:
```env
VITE_SITE_URL=tu_url_de_netlify
```

4. Configurar Netlify Identity:
- Ir a tu dashboard de Netlify
- Habilitar Netlify Identity
- Configurar los métodos de autenticación deseados

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Estructura del proyecto

```
evopos/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── utils/
├── public/
└── ...
```

## Variables de entorno

El proyecto requiere las siguientes variables de entorno:

- VITE_SITE_URL

## Despliegue

1. Conecta tu repositorio con Netlify
2. Configura las variables de entorno en Netlify
3. Habilita y configura Netlify Identity
4. Despliega tu aplicación

## Licencia

Este proyecto está bajo la Licencia MIT. 