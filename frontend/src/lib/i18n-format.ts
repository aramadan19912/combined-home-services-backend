import i18n from '@/i18n';
import { format as dfFormat } from 'date-fns';
import { ar as arLocale, enUS } from 'date-fns/locale';

export type CurrencyCode = 'SAR' | 'AED' | 'USD' | 'EUR' | string;

export const toArabicDigits = (input: string | number): string => {
  const str = String(input);
  const map: Record<string, string> = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
  };
  return str.replace(/[0-9]/g, (d) => map[d]);
};

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
  const lng = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const formatted = new Intl.NumberFormat(lng, options).format(value);
  return lng === 'ar' ? toArabicDigits(formatted) : formatted;
};

export const formatCurrency = (value: number, currency: CurrencyCode = 'SAR') =>
  formatNumber(value, { style: 'currency', currency, currencyDisplay: 'symbol', maximumFractionDigits: 2 });

export const formatDate = (date: Date | number, pattern = 'PP') => {
  const lng = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const locale = lng === 'ar' ? arLocale : enUS;
  const formatted = dfFormat(date, pattern, { locale });
  return lng === 'ar' ? toArabicDigits(formatted) : formatted;
};
