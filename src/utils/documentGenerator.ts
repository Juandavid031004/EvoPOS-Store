import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { Sale, Product, BusinessConfig, Gasto } from '../types';
import { numberToWords } from './numberToWords';

// Professional document settings
const settings = {
  margin: 20,
  lineHeight: 7,
  fontSize: {
    title: 16,
    subtitle: 12,
    normal: 10,
    small: 8
  }
};

export const generateDocument = async ({ type, sale, products, config }: {
  type: 'factura' | 'boleta';
  sale: Sale;
  products: Product[];
  config: BusinessConfig;
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = settings.margin;
  let currentY = margin;

  // Centrar logo y ajustar tamaño
  if (config.logo) {
    const logoWidth = 40;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(config.logo, 'PNG', logoX, currentY, logoWidth, 20);
    currentY += 25;
  }

  // Información de la empresa centrada
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(settings.fontSize.title);
  const companyName = config.razonSocial || config.nombre;
  doc.text(companyName, pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;

  // Resto de la información de la empresa
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(settings.fontSize.normal);
  
  const companyInfo = [
    config.direccion,
    `RUC: ${config.ruc || ''}`,
    `Tel: ${config.telefono || ''}`,
    config.correo,
    config.sitioWeb
  ].filter(Boolean);

  companyInfo.forEach(line => {
    doc.text(line, pageWidth / 2, currentY, { align: 'center' });
    currentY += 6;
  });

  // Tipo de documento
  currentY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(settings.fontSize.subtitle);
  const docTitle = type === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA';
  doc.text(docTitle, pageWidth / 2, currentY, { align: 'center' });
  doc.text(`N° ${sale.id.padStart(8, '0')}`, pageWidth / 2, currentY + 7, { align: 'center' });
  currentY += 15;

  // Customer & sale information
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(settings.fontSize.normal);
  
  const fecha = new Date(sale.fecha);
  const customerInfo = [
    `Fecha: ${format(fecha, 'dd/MM/yyyy')}`,
    `Cliente: ${sale.cliente}`,
    `DNI/RUC: ${sale.clienteId || '-'}`,
    `Forma de pago: ${sale.metodoPago.toUpperCase()}`
  ];

  customerInfo.forEach(line => {
    doc.text(line, margin, currentY);
    currentY += settings.lineHeight - 1;
  });

  currentY += 5;

  // Products table
  autoTable(doc, {
    startY: currentY,
    head: [['Código', 'Descripción', 'Cant.', 'P.Unit', 'Total']],
    body: sale.productos.map(item => {
      const product = products.find(p => p.id === item.productoId);
      return [
        product?.codigo || '',
        product?.nombre || '',
        item.cantidad.toString(),
        `S/ ${item.precioUnitario.toFixed(2)}`,
        `S/ ${item.subtotal.toFixed(2)}`
      ];
    }),
    styles: {
      font: 'helvetica',
      fontSize: settings.fontSize.normal - 1,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.1
    },
    theme: 'plain'
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals
  doc.setFont('helvetica', 'bold');
  const totals = [
    ['Sub Total:', `S/ ${(sale.total / 1.18).toFixed(2)}`],
    ['IGV (18%):', `S/ ${(sale.total - sale.total / 1.18).toFixed(2)}`],
    ['Total:', `S/ ${sale.total.toFixed(2)}`]
  ];

  totals.forEach((item, index) => {
    doc.text(item[0], pageWidth - 60, finalY + (index * 6));
    doc.text(item[1], pageWidth - 25, finalY + (index * 6), { align: 'right' });
  });

  // Amount in words
  const totalEnLetras = numberToWords(Math.floor(sale.total)) + ' CON ' + 
                       String(Math.round((sale.total % 1) * 100)).padStart(2, '0') + '/100 SOLES';
  
  doc.setFontSize(settings.fontSize.small);
  doc.text('Son:', margin, finalY + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(totalEnLetras, margin + 15, finalY + 20);

  // QR Code
  const qrData = [
    config.ruc || '',
    type === 'factura' ? '01' : '03',
    sale.id.padStart(8, '0'),
    (sale.total - (sale.total / 1.18)).toFixed(2),
    sale.total.toFixed(2),
    fecha.toISOString().split('T')[0],
    'DNI',
    sale.cliente
  ].join('|');

  const qrImage = await QRCode.toDataURL(qrData);
  doc.addImage(qrImage, 'PNG', margin, finalY + 25, 25, 25);

  // Footer
  doc.setFontSize(settings.fontSize.small);
  doc.text('Representación impresa del Comprobante de Pago Electrónico', margin, finalY + 55);
  doc.text('Este documento puede ser validado en: www.sunat.gob.pe', margin, finalY + 58);

  // Save document
  const fileName = `${type === 'factura' ? 'F' : 'B'}${sale.id.padStart(8, '0')}.pdf`;
  doc.save(fileName);
};

export const generateSalesReport = async ({ 
  sales, 
  products,
  config 
}: {
  sales: Sale[];
  products: Product[];
  config: BusinessConfig;
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let currentY = settings.margin;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(settings.fontSize.title);
  doc.text('REGISTRO DE VENTAS', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Company info
  doc.setFontSize(settings.fontSize.normal);
  doc.text(config.nombre, settings.margin, currentY);
  currentY += 7;

  if (config.direccion) {
    doc.setFont('helvetica', 'normal');
    doc.text(config.direccion, settings.margin, currentY);
    currentY += 7;
  }

  // Report date
  doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, settings.margin, currentY);
  currentY += 10;

  // Summary
  const totalVentas = sales.reduce((sum, sale) => sum + sale.total, 0);

  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN', settings.margin, currentY);
  currentY += 7;

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Ventas: S/ ${totalVentas.toFixed(2)}`, settings.margin, currentY);
  currentY += 15;

  // Sales table
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLE DE VENTAS', settings.margin, currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    head: [['Fecha', 'Cliente', 'Método', 'Total']],
    body: sales.map(sale => [
      format(new Date(sale.fecha), 'dd/MM/yyyy HH:mm'),
      sale.cliente,
      sale.metodoPago,
      `S/ ${sale.total.toFixed(2)}`
    ]),
    styles: {
      fontSize: settings.fontSize.normal - 1,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.1
    },
    theme: 'plain'
  });

  // Save document
  const fileName = `registro_ventas_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
  doc.save(fileName);
};

export const generateExpensesReport = async ({ 
  expenses,
  config 
}: {
  expenses: Gasto[];
  config: BusinessConfig;
}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let currentY = settings.margin;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(settings.fontSize.title);
  doc.text('REGISTRO DE GASTOS', pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Company info
  doc.setFontSize(settings.fontSize.normal);
  doc.text(config.nombre, settings.margin, currentY);
  currentY += 7;

  if (config.direccion) {
    doc.setFont('helvetica', 'normal');
    doc.text(config.direccion, settings.margin, currentY);
    currentY += 7;
  }

  // Report date
  doc.text(`Fecha de generación: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, settings.margin, currentY);
  currentY += 10;

  // Summary
  const totalGastos = expenses.reduce((sum, expense) => sum + expense.monto, 0);

  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN', settings.margin, currentY);
  currentY += 7;

  doc.setFont('helvetica', 'normal');
  doc.text(`Total Gastos: S/ ${totalGastos.toFixed(2)}`, settings.margin, currentY);
  currentY += 15;

  // Expenses table
  doc.setFont('helvetica', 'bold');
  doc.text('DETALLE DE GASTOS', settings.margin, currentY);
  currentY += 10;

  autoTable(doc, {
    startY: currentY,
    head: [['Fecha', 'Descripción', 'Categoría', 'Monto']],
    body: expenses.map(expense => [
      format(new Date(expense.fecha), 'dd/MM/yyyy HH:mm'),
      expense.descripcion,
      expense.categoria,
      `S/ ${expense.monto.toFixed(2)}`
    ]),
    styles: {
      fontSize: settings.fontSize.normal - 1,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.1
    },
    theme: 'plain'
  });

  // Save document
  const fileName = `registro_gastos_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
  doc.save(fileName);
};