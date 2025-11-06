/**
 * Currency utilities for multi-currency support (SAR, EGP, USD)
 * Matches backend RegionalConfig implementation
 */

export enum Currency {
  SAR = 'SAR',
  EGP = 'EGP',
  USD = 'USD'
}

export enum Country {
  SaudiArabia = 'SaudiArabia',
  Egypt = 'Egypt',
  UAE = 'UAE',
  Kuwait = 'Kuwait'
}

export interface RegionalConfig {
  country: Country;
  currency: Currency;
  taxRate: number;
  countryCode: string;
  currencySymbol: string;
  defaultLocale: string;
  supportedLocales: string[];
}

export const regionalConfigs: Record<Country, RegionalConfig> = {
  [Country.SaudiArabia]: {
    country: Country.SaudiArabia,
    currency: Currency.SAR,
    taxRate: 0.15, // 15% VAT
    countryCode: 'SA',
    currencySymbol: 'ر.س',
    defaultLocale: 'ar-SA',
    supportedLocales: ['ar-SA', 'en-US']
  },
  [Country.Egypt]: {
    country: Country.Egypt,
    currency: Currency.EGP,
    taxRate: 0.14, // 14% VAT
    countryCode: 'EG',
    currencySymbol: 'ج.م',
    defaultLocale: 'ar-EG',
    supportedLocales: ['ar-EG', 'en-US', 'fr-FR']
  },
  [Country.UAE]: {
    country: Country.UAE,
    currency: Currency.USD,
    taxRate: 0.05, // 5% VAT
    countryCode: 'AE',
    currencySymbol: 'د.إ',
    defaultLocale: 'ar-AE',
    supportedLocales: ['ar-AE', 'en-US']
  },
  [Country.Kuwait]: {
    country: Country.Kuwait,
    currency: Currency.USD,
    taxRate: 0.00, // No VAT
    countryCode: 'KW',
    currencySymbol: 'د.ك',
    defaultLocale: 'ar-KW',
    supportedLocales: ['ar-KW', 'en-US']
  }
};

/**
 * Get regional configuration for a country
 */
export const getRegionalConfig = (country: Country): RegionalConfig => {
  return regionalConfigs[country] || regionalConfigs[Country.SaudiArabia];
};

/**
 * Get regional configuration by country code
 */
export const getRegionalConfigByCode = (countryCode: string): RegionalConfig => {
  const country = Object.values(Country).find(
    c => regionalConfigs[c].countryCode === countryCode.toUpperCase()
  );
  return country ? regionalConfigs[country] : regionalConfigs[Country.SaudiArabia];
};

/**
 * Format currency amount with symbol
 */
export const formatCurrency = (
  amount: number,
  currency: Currency,
  locale: string = 'ar-SA'
): string => {
  const config = Object.values(regionalConfigs).find(c => c.currency === currency);
  const symbol = config?.currencySymbol || '';

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);

  // For Arabic locales, put symbol after number
  if (locale.startsWith('ar')) {
    return `${formatted} ${symbol}`;
  }

  // For other locales, put symbol before number
  return `${symbol} ${formatted}`;
};

/**
 * Calculate tax amount
 */
export const calculateTax = (basePrice: number, country: Country): number => {
  const config = getRegionalConfig(country);
  return basePrice * config.taxRate;
};

/**
 * Calculate total with tax
 */
export const calculateTotal = (
  basePrice: number,
  country: Country,
  discount: number = 0,
  platformFee: number = 0
): number => {
  const tax = calculateTax(basePrice, country);
  return basePrice + tax + platformFee - discount;
};

/**
 * Get tax rate percentage as string
 */
export const getTaxRateDisplay = (country: Country): string => {
  const config = getRegionalConfig(country);
  return `${(config.taxRate * 100).toFixed(0)}%`;
};

/**
 * Price breakdown for display
 */
export interface PriceBreakdown {
  basePrice: number;
  taxAmount: number;
  taxRate: number;
  platformFee: number;
  discount: number;
  total: number;
  currency: Currency;
  currencySymbol: string;
}

/**
 * Calculate complete price breakdown
 */
export const calculatePriceBreakdown = (
  basePrice: number,
  country: Country,
  discount: number = 0,
  platformFee: number = 0
): PriceBreakdown => {
  const config = getRegionalConfig(country);
  const taxAmount = calculateTax(basePrice, country);
  const total = basePrice + taxAmount + platformFee - discount;

  return {
    basePrice,
    taxAmount,
    taxRate: config.taxRate,
    platformFee,
    discount,
    total,
    currency: config.currency,
    currencySymbol: config.currencySymbol
  };
};
