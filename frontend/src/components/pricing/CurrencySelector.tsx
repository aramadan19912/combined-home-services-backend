/**
 * CurrencySelector Component
 * Allows users to select country and currency
 * Updates pricing dynamically
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Country, Currency, getRegionalConfig } from '@/utils/currency';

export interface CurrencySelectorProps {
  selectedCountry: Country;
  onCountryChange: (country: Country) => void;
  className?: string;
  showCurrency?: boolean;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCountry,
  onCountryChange,
  className = '',
  showCurrency = true,
}) => {
  const { t } = useTranslation();
  const config = getRegionalConfig(selectedCountry);

  const countries = [
    { value: Country.SaudiArabia, label: t('country.saudiArabia'), flag: '🇸🇦' },
    { value: Country.Egypt, label: t('country.egypt'), flag: '🇪🇬' },
  ];

  return (
    <Card className={className}>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="country-select">{t('forms.selectCountry')}</Label>
          <Select
            value={selectedCountry}
            onValueChange={(value) => onCountryChange(value as Country)}
          >
            <SelectTrigger id="country-select">
              <SelectValue placeholder={t('forms.selectCountry')} />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  <div className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showCurrency && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                {t('forms.currency')}
              </div>
              <div className="font-semibold">
                {t(`currency.${config.currency}`)} ({config.currencySymbol})
              </div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-sm text-muted-foreground">
                {t('pricing.taxRate')}
              </div>
              <div className="font-semibold">{(config.taxRate * 100).toFixed(0)}%</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencySelector;
