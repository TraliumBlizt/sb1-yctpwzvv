export interface BankInfo {
  name: string;
  accountName: string;
  accountNumber: string;
  type: string;
}

export interface CountryBanks {
  [key: string]: BankInfo[];
}

export const banksByCountry: CountryBanks = {
  'Argentina': [
    { name: 'Mercado Pago', accountName: 'Financial Platform SAS', accountNumber: '3001234567', type: 'mobile' },
    { name: 'Ualá', accountName: 'Financial Platform SAS', accountNumber: '3009876543', type: 'mobile' },
    { name: 'Modo', accountName: 'Financial Platform SAS', accountNumber: '3005551234', type: 'mobile' },
    { name: 'Banco de la Nación Argentina', accountName: 'Financial Platform SAS', accountNumber: '12345678901', type: 'bank' },
    { name: 'Banco Provincia', accountName: 'Financial Platform SAS', accountNumber: '98765432101', type: 'bank' },
    { name: 'Banco Galicia', accountName: 'Financial Platform SAS', accountNumber: '55512345678', type: 'bank' },
    { name: 'Pago Fácil', accountName: 'Financial Platform SAS', accountNumber: 'PF123456789', type: 'cash' },
    { name: 'Rapi Pago', accountName: 'Financial Platform SAS', accountNumber: 'RP987654321', type: 'cash' },
    { name: 'Cobro Express', accountName: 'Financial Platform SAS', accountNumber: 'CE555123456', type: 'cash' }
],
  'Colombia': [
    { name: 'Nequi', accountName: 'Financial Platform SAS', accountNumber: '3001234567', type: 'mobile' },
    { name: 'Daviplata', accountName: 'Financial Platform SAS', accountNumber: '3009876543', type: 'mobile' },
    { name: 'Movii', accountName: 'Financial Platform SAS', accountNumber: '3005551234', type: 'mobile' },
    { name: 'Bancolombia', accountName: 'Financial Platform SAS', accountNumber: '12345678901', type: 'bank' },
    { name: 'Banco de Bogotá', accountName: 'Financial Platform SAS', accountNumber: '98765432101', type: 'bank' },
    { name: 'Davivienda', accountName: 'Financial Platform SAS', accountNumber: '55512345678', type: 'bank' },
    { name: 'Efecty', accountName: 'Financial Platform SAS', accountNumber: 'EFT123456789', type: 'cash' },
    { name: 'Baloto', accountName: 'Financial Platform SAS', accountNumber: 'BAL987654321', type: 'cash' },
    { name: 'SuRed', accountName: 'Financial Platform SAS', accountNumber: 'SUR555123456', type: 'cash' }
  ],
  'Costa Rica': [
    { name: 'Sinpe Móvil', accountName: 'Financial Platform CR', accountNumber: '88881234', type: 'mobile' },
    { name: 'Tigo Money', accountName: 'Financial Platform CR', accountNumber: '89995678', type: 'mobile' },
    { name: 'BAC Credomatic', accountName: 'Financial Platform CR', accountNumber: '123456789012', type: 'bank' },
    { name: 'Banco Nacional', accountName: 'Financial Platform CR', accountNumber: '987654321098', type: 'bank' },
    { name: 'Movistar Money', accountName: 'Financial Platform CR', accountNumber: '87771234', type: 'mobile' },
    { name: 'Monibyte', accountName: 'Financial Platform CR', accountNumber: 'MB123456789', type: 'digital' }
  ],
  'Dominican Republic': [
    { name: 'TPago', accountName: 'Financial Platform DO', accountNumber: '8091234567', type: 'mobile' },
    { name: 'GCS Wallet', accountName: 'Financial Platform DO', accountNumber: 'GCS123456789', type: 'digital' },
    { name: 'Banco Popular', accountName: 'Financial Platform DO', accountNumber: '123456789012', type: 'bank' },
    { name: 'BanReservas', accountName: 'Financial Platform DO', accountNumber: '987654321098', type: 'bank' },
    { name: 'Caribe Express', accountName: 'Financial Platform DO', accountNumber: 'CE123456789', type: 'remittance' },
    { name: 'GCS', accountName: 'Financial Platform DO', accountNumber: 'GCS987654321', type: 'remittance' },
    { name: 'PayPal', accountName: 'Financial Platform DO', accountNumber: 'paypal@financialplatform.do', type: 'digital' }
  ],
  'Ecuador': [
    { name: 'BIMO', accountName: 'Financial Platform EC', accountNumber: '0987654321', type: 'mobile' },
    { name: 'Deunal', accountName: 'Financial Platform EC', accountNumber: 'DEU123456789', type: 'digital' },
    { name: 'Datalink', accountName: 'Financial Platform EC', accountNumber: 'DL987654321', type: 'digital' },
    { name: 'Banco Pichincha', accountName: 'Financial Platform EC', accountNumber: '2100123456789', type: 'bank' },
    { name: 'Banco Guayaquil', accountName: 'Financial Platform EC', accountNumber: '0123456789012', type: 'bank' },
    { name: 'Western Union', accountName: 'Financial Platform EC', accountNumber: 'WU123456789', type: 'remittance' },
    { name: 'Pago Agil', accountName: 'Financial Platform EC', accountNumber: 'PA987654321', type: 'cash' }
  ],
  'Guatemala': [
    { name: 'Tigo Money', accountName: 'Financial Platform GT', accountNumber: '50212345678', type: 'mobile' },
    { name: 'Banrural App', accountName: 'Financial Platform GT', accountNumber: '123456789012', type: 'bank' },
    { name: 'Banrural', accountName: 'Financial Platform GT', accountNumber: '987654321098', type: 'bank' },
    { name: 'Banco Industrial', accountName: 'Financial Platform GT', accountNumber: '555123456789', type: 'bank' },
    { name: 'VisaNet', accountName: 'Financial Platform GT', accountNumber: 'VN123456789', type: 'digital' },
    { name: 'BAC', accountName: 'Financial Platform GT', accountNumber: '777987654321', type: 'bank' },
    { name: 'PayPal', accountName: 'Financial Platform GT', accountNumber: 'paypal@financialplatform.gt', type: 'digital' }
  ],
  'Honduras': [
    { name: 'Tigo Money', accountName: 'Financial Platform HN', accountNumber: '50412345678', type: 'mobile' },
    { name: 'BAC App', accountName: 'Financial Platform HN', accountNumber: '123456789012', type: 'bank' },
    { name: 'Banco Atlántida', accountName: 'Financial Platform HN', accountNumber: '987654321098', type: 'bank' },
    { name: 'Ficohsa', accountName: 'Financial Platform HN', accountNumber: '555123456789', type: 'bank' },
    { name: 'Tigo Money POS', accountName: 'Financial Platform HN', accountNumber: '50487654321', type: 'pos' },
    { name: 'PuntoExpress', accountName: 'Financial Platform HN', accountNumber: 'PE123456789', type: 'cash' }
  ],
  'Mexico': [
    { name: 'Mercado Pago', accountName: 'Financial Platform MX', accountNumber: '5512345678', type: 'digital' },
    { name: 'Spin by OXXO', accountName: 'Financial Platform MX', accountNumber: 'SP123456789', type: 'digital' },
    { name: 'Dapp', accountName: 'Financial Platform MX', accountNumber: 'DAPP987654321', type: 'digital' },
    { name: 'BBVA', accountName: 'Financial Platform MX', accountNumber: '012345678901234567', type: 'bank' },
    { name: 'Santander', accountName: 'Financial Platform MX', accountNumber: '987654321098765432', type: 'bank' },
    { name: 'Banorte', accountName: 'Financial Platform MX', accountNumber: '555123456789012345', type: 'bank' },
    { name: 'HSBC', accountName: 'Financial Platform MX', accountNumber: '777987654321098765', type: 'bank' },
    { name: 'OXXO Pay', accountName: 'Financial Platform MX', accountNumber: 'OX123456789', type: 'cash' },
    { name: 'CoDi', accountName: 'Financial Platform MX', accountNumber: 'CD987654321', type: 'digital' },
    { name: 'BBVA Wallet', accountName: 'Financial Platform MX', accountNumber: 'BW555123456', type: 'digital' }
  ],
  'Nicaragua': [
    { name: 'Tigo Money', accountName: 'Financial Platform NI', accountNumber: '50512345678', type: 'mobile' },
    { name: 'Banpro Wallet', accountName: 'Financial Platform NI', accountNumber: 'BPW123456789', type: 'digital' },
    { name: 'BAC', accountName: 'Financial Platform NI', accountNumber: '123456789012', type: 'bank' },
    { name: 'Banpro', accountName: 'Financial Platform NI', accountNumber: '987654321098', type: 'bank' },
    { name: 'Banco Lafise', accountName: 'Financial Platform NI', accountNumber: '555123456789', type: 'bank' },
    { name: 'Pago Express', accountName: 'Financial Platform NI', accountNumber: 'PEX123456789', type: 'cash' },
    { name: 'Punto Pago', accountName: 'Financial Platform NI', accountNumber: 'PP987654321', type: 'cash' }
  ],
  'Panama': [
    { name: 'Nequi Panamá', accountName: 'Financial Platform PA', accountNumber: '60712345678', type: 'mobile' },
    { name: 'Yappy', accountName: 'Financial Platform PA', accountNumber: '60787654321', type: 'mobile' },
    { name: 'Banco General', accountName: 'Financial Platform PA', accountNumber: '123456789012', type: 'bank' },
    { name: 'Banistmo', accountName: 'Financial Platform PA', accountNumber: '987654321098', type: 'bank' },
    { name: 'Western Union', accountName: 'Financial Platform PA', accountNumber: 'WU123456789', type: 'remittance' },
    { name: 'Multipagos', accountName: 'Financial Platform PA', accountNumber: 'MP987654321', type: 'cash' }
  ],
  'Paraguay': [
    { name: 'Billetera Personal', accountName: 'Financial Platform PY', accountNumber: '59512345678', type: 'mobile' },
    { name: 'Tigo Money', accountName: 'Financial Platform PY', accountNumber: '59587654321', type: 'mobile' },
    { name: 'Banco Continental', accountName: 'Financial Platform PY', accountNumber: '123456789012', type: 'bank' },
    { name: 'Visión Banco', accountName: 'Financial Platform PY', accountNumber: '987654321098', type: 'bank' },
    { name: 'Pago Móvil', accountName: 'Financial Platform PY', accountNumber: 'PM123456789', type: 'mobile' },
    { name: 'Infonet', accountName: 'Financial Platform PY', accountNumber: 'IN987654321', type: 'digital' }
  ],
  'Peru': [
    { name: 'Yape', accountName: 'Financial Platform PE', accountNumber: '987654321', type: 'mobile' },
    { name: 'Plin', accountName: 'Financial Platform PE', accountNumber: '123456789', type: 'mobile' },
    { name: 'Tunki', accountName: 'Financial Platform PE', accountNumber: '555123456', type: 'mobile' },
    { name: 'BCP', accountName: 'Financial Platform PE', accountNumber: '19412345678901', type: 'bank' },
    { name: 'Interbank', accountName: 'Financial Platform PE', accountNumber: '89812345678901', type: 'bank' },
    { name: 'BBVA', accountName: 'Financial Platform PE', accountNumber: '01112345678901', type: 'bank' },
    { name: 'PagoEfectivo', accountName: 'Financial Platform PE', accountNumber: 'PE123456789', type: 'cash' },
    { name: 'Safety Pay', accountName: 'Financial Platform PE', accountNumber: 'SP987654321', type: 'digital' }
  ],
  'El Salvador': [
    { name: 'Transfer365', accountName: 'Financial Platform SV', accountNumber: 'T365123456789', type: 'remittance' },
    { name: 'PuntoXpress', accountName: 'Financial Platform SV', accountNumber: 'PX987654321', type: 'cash' },
    { name: 'Banco Agrícola', accountName: 'Financial Platform SV', accountNumber: '123456789012', type: 'bank' },
    { name: 'Davivienda', accountName: 'Financial Platform SV', accountNumber: '987654321098', type: 'bank' }
  ],
  'Uruguay': [
    { name: 'Prex', accountName: 'Financial Platform UY', accountNumber: '59812345678', type: 'digital' },
    { name: 'MiDinero', accountName: 'Financial Platform UY', accountNumber: 'MD123456789', type: 'digital' },
    { name: 'Banco República', accountName: 'Financial Platform UY', accountNumber: '123456789012', type: 'bank' },
    { name: 'Itaú', accountName: 'Financial Platform UY', accountNumber: '987654321098', type: 'bank' },
    { name: 'Abitab', accountName: 'Financial Platform UY', accountNumber: 'AB555123456', type: 'cash' }
  ],
  'Venezuela': [
    { name: 'Pago Móvil', accountName: 'Financial Platform VE', accountNumber: '04121234567', type: 'mobile' },
    { name: 'Reserve', accountName: 'Financial Platform VE', accountNumber: 'RSV123456789', type: 'digital' },
    { name: 'Zinli', accountName: 'Financial Platform VE', accountNumber: 'ZNL987654321', type: 'digital' },
    { name: 'Banco de Venezuela', accountName: 'Financial Platform VE', accountNumber: '01020123456789012345', type: 'bank' },
    { name: 'Banesco', accountName: 'Financial Platform VE', accountNumber: '01340987654321098765', type: 'bank' },
    { name: 'Zelle', accountName: 'Financial Platform VE', accountNumber: 'payments@financialplatform.ve', type: 'digital' },
    { name: 'Binance Pay', accountName: 'Financial Platform VE', accountNumber: 'BP123456789', type: 'crypto' }
  ]
};

export const getCountries = (): string[] => {
  return Object.keys(banksByCountry);
};

export const getBanksByCountry = (country: string): BankInfo[] => {
  return banksByCountry[country] || [];
};