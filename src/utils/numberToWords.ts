export const numberToWords = (number: number): string => {
  const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  if (number === 0) return 'CERO';
  if (number === 1000) return 'MIL';
  if (number === 100) return 'CIEN';

  const convertGroup = (n: number): string => {
    if (n === 0) return '';
    
    if (n < 10) return units[n];
    
    if (n < 20) return teens[n - 10];
    
    if (n < 100) {
      const unit = n % 10;
      const ten = Math.floor(n / 10);
      return unit === 0 ? tens[ten] : `${tens[ten]} Y ${units[unit]}`;
    }
    
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    
    if (remainder === 0) return hundreds[hundred];
    return `${hundreds[hundred]} ${convertGroup(remainder)}`;
  };

  const convertThousands = (n: number): string => {
    if (n < 1000) return convertGroup(n);
    
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    
    if (thousands === 1) {
      return remainder === 0 ? 'MIL' : `MIL ${convertGroup(remainder)}`;
    }
    
    return remainder === 0 
      ? `${convertGroup(thousands)} MIL`
      : `${convertGroup(thousands)} MIL ${convertGroup(remainder)}`;
  };

  return convertThousands(number);
};