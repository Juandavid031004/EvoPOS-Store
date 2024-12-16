import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { Sale, Product, BusinessConfig, Gasto } from '../types';
import { numberToWords } from './numberToWords';

// Professional document settings
const settings = {
  margin: 3,
  lineHeight: {
    normal: 4,
    large: 5,
    small: 3
  },
  fontSize: {
    title: 10,
    subtitle: 9,
    normal: 7,
    small: 6
  },
  spacing: {
    section: 7,
    paragraph: 5,
    line: 4
  }
};

export const generateDocument = async ({ type, sale, products, config }: {
  type: 'boleta';
  sale: Sale;
  products: Product[];
  config: BusinessConfig;
}): Promise<void> => {
  // Crear un documento temporal para calcular la altura necesaria
  const tempDoc = new jsPDF({
    format: [58, 1000], // Altura temporal grande para cálculos
    unit: 'mm'
  });
  
  // Función para simular el renderizado y calcular altura
  const calculateHeight = () => {
    let y = settings.margin + 5;
    
    // Simular renderizado de encabezado
    y += settings.spacing.paragraph + 2;
    y += settings.spacing.line;
    
    // Simular info de empresa
    const companyInfo = [
      config.direccion || '',
      config.telefono ? `Tel: ${config.telefono}` : '',
      config.correo || ''
    ].filter(Boolean);
    y += companyInfo.length * settings.spacing.line;
    
    // Simular tipo de documento
    y += settings.spacing.section * 2 + settings.spacing.line;
    
    // Simular info de venta
    y += settings.lineHeight.normal * 3 + settings.spacing.paragraph;
    
    // Simular tabla de productos
    const productsHeight = sale.productos.length * 8; // Aproximado por producto
    y += productsHeight + 20; // Margen extra para encabezados
    
    // Simular total y texto en letras
    y += settings.spacing.section * 3;
    
    // Simular footer
    y += settings.spacing.paragraph * 3;
    
    return y + settings.margin + 10; // Margen extra de seguridad
  };
  
  // Calcular altura necesaria
  const requiredHeight = calculateHeight();
  
  // Crear el documento final con la altura calculada
  const doc = new jsPDF({
    format: [58, requiredHeight],
    unit: 'mm'
  });
  
  const pageWidth = doc.internal.pageSize.width;
  let currentY = settings.margin + 5;

  // Información de la empresa centrada con estilo mejorado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(settings.fontSize.title);
  const companyName = config.razonSocial || config.nombre || 'Empresa';
  doc.text(companyName, pageWidth / 2, currentY, { align: 'center' });
  currentY += settings.spacing.paragraph + 2;

  // Línea decorativa
  doc.setLineWidth(0.3);
  doc.line(settings.margin, currentY - 2, pageWidth - settings.margin, currentY - 2);
  currentY += settings.spacing.line;

  // Información de contacto de la empresa
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(settings.fontSize.normal);
  
  const companyInfo = [
    config.direccion || '',
    config.telefono ? `Tel: ${config.telefono}` : '',
    config.correo || ''
  ].filter((line): line is string => Boolean(line));

  companyInfo.forEach(line => {
    doc.text(line, pageWidth / 2, currentY, { align: 'center' });
    currentY += settings.spacing.line;
  });

  // Línea decorativa
  currentY += settings.spacing.line;
  doc.setLineWidth(0.3);
  doc.line(settings.margin, currentY - 2, pageWidth - settings.margin, currentY - 2);

  // Tipo de documento con estilo mejorado
  currentY += settings.spacing.section;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(settings.fontSize.subtitle);
  doc.text('BOLETA DE VENTA', pageWidth / 2, currentY, { align: 'center' });
  currentY += settings.spacing.line;
  doc.text(`N° ${sale.id.padStart(8, '0')}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += settings.spacing.section;

  // Información de la venta con mejor formato
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(settings.fontSize.normal);
  
  const fecha = new Date(sale.fecha);
  const customerInfo = [
    `Fecha: ${format(fecha, 'dd/MM/yyyy HH:mm')}`,
    `Cliente: ${sale.cliente || 'Cliente General'}`,
    `Pago: ${sale.metodoPago.toUpperCase()}`
  ];

  customerInfo.forEach(line => {
    doc.text(line, settings.margin + 2, currentY);
    currentY += settings.lineHeight.normal;
  });

  currentY += settings.spacing.paragraph;

  // Tabla de productos con estilo mejorado
  autoTable(doc, {
    startY: currentY,
    margin: { left: settings.margin, right: settings.margin },
    head: [['Descripción', 'Cant', 'Total']],
    body: sale.productos.map(item => {
      const product = products.find(p => p.id === item.productoId);
      return [
        product?.nombre || 'Producto no encontrado',
        item.cantidad.toString(),
        `S/ ${item.subtotal.toFixed(2)}`
      ];
    }),
    styles: {
      font: 'helvetica',
      fontSize: settings.fontSize.normal,
      cellPadding: { top: 2, right: 2, bottom: 2, left: 2 },
      lineWidth: 0.1,
      minCellHeight: 2,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 8, halign: 'center' },
      2: { cellWidth: 15, halign: 'right' }
    },
    theme: 'plain',
    didParseCell: function(data) {
      if (data.column.index === 0) {
        const text = data.cell.text[0];
        if (text.length > 20) {
          data.cell.styles.cellWidth = 'wrap';
        }
      }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + settings.spacing.section;

  // Línea decorativa antes de los totales
  doc.setLineWidth(0.3);
  doc.line(settings.margin, finalY - 2, pageWidth - settings.margin, finalY - 2);
  
  let totalY = finalY + settings.spacing.paragraph;

  // Subtotal, IGV y Total con estilo mejorado
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(settings.fontSize.normal);
  
  // Calcular IGV (18%)
  const subtotalSinIGV = sale.subtotal / 1.18;
  const igv = sale.subtotal - subtotalSinIGV;
  
  // Mostrar Subtotal sin IGV
  doc.text('Subtotal:', settings.margin, totalY);
  doc.text(`S/ ${subtotalSinIGV.toFixed(2)}`, pageWidth - settings.margin, totalY, { align: 'right' });
  totalY += settings.lineHeight.normal + 2;
  
  // Mostrar IGV
  doc.text('IGV (18%):', settings.margin, totalY);
  doc.text(`S/ ${igv.toFixed(2)}`, pageWidth - settings.margin, totalY, { align: 'right' });
  totalY += settings.lineHeight.normal + 2;

  // Mostrar Descuento si existe
  if (sale.descuento > 0) {
    doc.text('Descuento:', settings.margin, totalY);
    doc.text(`- S/ ${sale.descuento.toFixed(2)}`, pageWidth - settings.margin, totalY, { align: 'right' });
    totalY += settings.lineHeight.normal + 2;
  }

  // Total Final con estilo mejorado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(settings.fontSize.subtitle);
  doc.text('TOTAL:', settings.margin, totalY);
  doc.text(`S/ ${sale.total.toFixed(2)}`, pageWidth - settings.margin, totalY, { align: 'right' });

  // Espacio adicional antes del monto en letras
  const wordsY = totalY + settings.spacing.section + 5;
  
  // Monto en letras con mejor formato
  const totalEnLetras = numberToWords(Math.floor(sale.total)) + ' CON ' + 
                     String(Math.round((sale.total % 1) * 100)).padStart(2, '0') + '/100 SOLES';
  
  doc.setFontSize(settings.fontSize.small);
  doc.setFont('helvetica', 'normal');
  
  // Dividir el texto en palabras y centrarlo con mejor espaciado
  const words = totalEnLetras.split(' ');
  let line = '';
  let lineY = wordsY;
  
  words.forEach(word => {
    const testLine = line + (line ? ' ' : '') + word;
    const testWidth = doc.getTextWidth(testLine);
    
    if (testWidth > pageWidth - (settings.margin * 4)) {
      doc.text(line, pageWidth / 2, lineY, { align: 'center' });
      line = word;
      lineY += settings.lineHeight.normal;
    } else {
      line = testLine;
    }
  });
  
  if (line) {
    doc.text(line, pageWidth / 2, lineY, { align: 'center' });
    lineY += settings.lineHeight.large;
  }

  // Línea decorativa final con más espacio
  lineY += settings.spacing.section;
  doc.setLineWidth(0.3);
  doc.line(settings.margin, lineY - 2, pageWidth - settings.margin, lineY - 2);

  // Footer con estilo mejorado y más espacio
  doc.setFontSize(settings.fontSize.normal);
  doc.setFont('helvetica', 'bold');
  doc.text('¡Gracias por su compra!', pageWidth / 2, lineY + settings.spacing.section, { align: 'center' });

  // Save document
  const fileName = `B${sale.id.padStart(8, '0')}.pdf`;
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
}): Promise<void> => {
  // Crear documento A4 horizontal
  const doc = new jsPDF({
    orientation: 'landscape',
    format: 'a4',
    unit: 'mm'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  let currentY = 20;

  // Logo y encabezado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(config.razonSocial || config.nombre || 'DEMO LTDA.', margin, currentY);
  
  // Información de la empresa en la esquina superior derecha
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('REPORTE DE CAJA', pageWidth - margin, currentY, { align: 'right' });
  currentY += 7;

  // RUC o identificación fiscal
  doc.text(`RUC: ${config.ruc || config.identificacionFiscal || ''}`, margin, currentY);
  doc.text(`EMISIÓN ${format(new Date(), 'dd-MM-yyyy')}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 7;

  // Sistema y dirección
  doc.text('SISTEMA DE ADMINISTRACIÓN', margin, currentY);
  if (config.direccion) {
    doc.text(config.direccion, margin, currentY + 7);
    currentY += 7;
  }
  currentY += 7;

  // Información de contacto
  if (config.telefono) {
    doc.text(`FONO: ${config.telefono}`, margin, currentY);
  }
  if (config.correo) {
    doc.text(config.correo, margin + (config.telefono ? 80 : 0), currentY);
  }
  currentY += 15;

  // Línea separadora
  doc.setDrawColor(0);
  doc.setLineWidth(0.1);
  doc.line(margin, currentY - 5, pageWidth - margin, currentY - 5);
  currentY += 5;

  // Título del reporte con fechas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const fechaInicio = sales.length > 0 ? format(new Date(Math.min(...sales.map(s => new Date(s.fecha).getTime()))), 'dd-MM-yyyy') : format(new Date(), 'dd-MM-yyyy');
  const fechaFin = sales.length > 0 ? format(new Date(Math.max(...sales.map(s => new Date(s.fecha).getTime()))), 'dd-MM-yyyy') : format(new Date(), 'dd-MM-yyyy');
  doc.text(`REPORTE DE CAJA DESDE ${fechaInicio} HASTA ${fechaFin}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 15;

  // Tabla de ventas
  autoTable(doc, {
    startY: currentY,
    head: [['Tipo', 'OT', 'Fecha', 'Cliente', 'F. pago', 'Tipo Doc', 'N° Doc', 'Monto']],
    body: sales.map(sale => {
      const fecha = format(new Date(sale.fecha), 'dd-MM-yyyy');
      return [
        sale.tipo || 'Venta',
        sale.id.padStart(3, '0'),
        fecha,
        sale.cliente || 'Cliente General',
        sale.metodoPago.toUpperCase(),
        'Boleta',
        sale.id.padStart(8, '0'),
        `S/ ${sale.total.toFixed(2)}`
      ];
    }),
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0]
    },
    headStyles: {
      fillColor: false,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.1
    },
    theme: 'grid',
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 70 },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 25, halign: 'center' },
      6: { cellWidth: 25, halign: 'center' },
      7: { cellWidth: 30, halign: 'right' }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 20;

  // Resumen de ventas por método de pago
  const ventasPorMetodo = sales.reduce((acc, sale) => {
    acc[sale.metodoPago] = (acc[sale.metodoPago] || 0) + sale.total;
    return acc;
  }, {} as Record<string, number>);

  // Mostrar totales
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  let summaryY = currentY;
  Object.entries(ventasPorMetodo).forEach(([metodo, total]) => {
    doc.text(`Venta ${metodo}:`, margin, summaryY);
    doc.text(`S/ ${total.toFixed(2)}`, margin + 80, summaryY, { align: 'right' });
    summaryY += 7;
  });

  // Total general
  const totalVentas = Object.values(ventasPorMetodo).reduce((sum, total) => sum + total, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', margin, summaryY);
  doc.text(`S/ ${totalVentas.toFixed(2)}`, margin + 80, summaryY, { align: 'right' });

  // Cuadro de firma
  doc.rect(pageWidth - 80, currentY, 70, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Comprobante Reporte', pageWidth - 45, currentY + 10, { align: 'center' });
  doc.text('Responsable:', pageWidth - 75, currentY + 20);
  doc.text('Firma:', pageWidth - 75, currentY + 35);

  // Save document
  const fileName = `reporte_caja_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
  doc.save(fileName);
};

export const generateExpensesReport = async ({ 
  expenses,
  config 
}: {
  expenses: Gasto[];
  config: BusinessConfig;
}): Promise<void> => {
  // Crear documento A4 horizontal
  const doc = new jsPDF({
    orientation: 'landscape',
    format: 'a4',
    unit: 'mm'
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  let currentY = 20;

  // Encabezado con título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('REGISTRO DE GASTOS', pageWidth / 2, currentY, { align: 'center' });
  currentY += 10;

  // Información de la empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(config.razonSocial || config.nombre || 'Empresa', pageWidth / 2, currentY, { align: 'center' });
  currentY += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (config.direccion) {
    doc.text(config.direccion, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
  }
  if (config.telefono || config.correo) {
    const contactInfo = [config.telefono, config.correo].filter(Boolean).join(' • ');
    doc.text(contactInfo, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
  }
  currentY += 5;

  // Línea separadora
  doc.setDrawColor(0);
  doc.setLineWidth(0.1);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  // Fecha e información general en la misma línea
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, margin, currentY);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total de gastos: S/ ${expenses.reduce((sum, expense) => sum + expense.monto, 0).toFixed(2)}`, pageWidth - margin, currentY, { align: 'right' });
  currentY += 15;

  // Gastos por categoría
  const gastosPorCategoria = expenses.reduce((acc, expense) => {
    acc[expense.tipo] = (acc[expense.tipo] || 0) + expense.monto;
    return acc;
  }, {} as Record<string, number>);
  const totalGastos = Object.values(gastosPorCategoria).reduce((sum, total) => sum + total, 0);

  autoTable(doc, {
    startY: currentY,
    head: [['Categoría', 'Monto', 'Porcentaje']],
    body: Object.entries(gastosPorCategoria)
      .sort(([, a], [, b]) => b - a)
      .map(([categoria, monto]) => [
        categoria.toUpperCase(),
        `S/ ${monto.toFixed(2)}`,
        `${((monto / totalGastos) * 100).toFixed(1)}%`
      ]),
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0],
      valign: 'middle'
    },
    headStyles: {
      fillColor: false,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.1,
      halign: 'center'
    },
    theme: 'grid',
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 80, halign: 'left' },
      1: { cellWidth: 50, halign: 'right' },
      2: { cellWidth: 40, halign: 'right' }
    },
    tableWidth: 'auto',
    didDrawPage: (data) => {
      const tableWidth = data.table.getWidth(doc.internal.pageSize.width);
      data.table.settings.margin.left = (pageWidth - tableWidth) / 2;
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Tabla de gastos
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DETALLE DE GASTOS', pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [['Fecha', 'Descripción', 'Categoría', 'Estado', 'Responsable', 'Monto']],
    body: expenses.map(expense => [
      format(new Date(expense.fecha), 'dd/MM/yyyy'),
      expense.descripcion,
      expense.tipo.toUpperCase(),
      expense.estado.toUpperCase(),
      expense.responsable || '-',
      `S/ ${expense.monto.toFixed(2)}`
    ]),
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      textColor: [0, 0, 0],
      valign: 'middle'
    },
    headStyles: {
      fillColor: false,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.1,
      halign: 'center'
    },
    theme: 'grid',
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 100, halign: 'left' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 40, halign: 'left' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    tableWidth: 'auto',
    didDrawPage: (data) => {
      const tableWidth = data.table.getWidth(doc.internal.pageSize.width);
      data.table.settings.margin.left = (pageWidth - tableWidth) / 2;
    }
  });

  // Save document
  const fileName = `registro_gastos_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
  doc.save(fileName);
};