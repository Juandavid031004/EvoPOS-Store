export const currencies: Currency[] = [
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano', decimals: 2 },
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano', decimals: 2 },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', decimals: 2 },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino', decimals: 2 },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno', decimals: 0 },
  { code: 'BOB', symbol: 'Bs', name: 'Boliviano', decimals: 2 },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileño', decimals: 2 },
  { code: 'VES', symbol: 'Bs.S', name: 'Bolívar Soberano', decimals: 2 }
];

export const countries: Country[] = [
  { 
    code: 'PE',
    name: 'Perú',
    currency: currencies.find(c => c.code === 'PEN')!,
    flag: '🇵🇪'
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    currency: currencies.find(c => c.code === 'USD')!,
    flag: '🇺🇸'
  },
  // Agregar más países...
];