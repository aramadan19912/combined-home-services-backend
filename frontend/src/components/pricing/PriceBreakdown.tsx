/**
 * PriceBreakdown Component
 * Displays detailed price breakdown with tax, fees, and discounts
 * Supports multi-currency and localization
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Currency,
  Country,
  formatCurrency,
  calculatePriceBreakdown,
  getTaxRateDisplay,
  PriceBreakdown as PriceBreakdownType,
} from '@/utils/currency';

export interface PriceBreakdownProps {
  basePrice: number;
  country: Country;
  currency?: Currency;
  discount?: number;
  platformFee?: number;
  className?: string;
  showTitle?: boolean;
  compact?: boolean;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  basePrice,
  country,
  currency,
  discount = 0,
  platformFee = 0,
  className = '',
  showTitle = true,
  compact = false,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  // Calculate breakdown
  const breakdown: PriceBreakdownType = calculatePriceBreakdown(
    basePrice,
    country,
    discount,
    platformFee
  );

  const useCurrency = currency || breakdown.currency;

  // Format price helper
  const formatPrice = (amount: number) => {
    return formatCurrency(amount, useCurrency, locale);
  };

  // Price row component
  const PriceRow: React.FC<{
    label: string;
    amount: number;
    className?: string;
    info?: string;
    highlight?: boolean;
  }> = ({ label, amount, className = '', info, highlight = false }) => (
    <div
      className={`flex justify-between items-center py-2 ${
        highlight ? 'font-semibold text-lg' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className={locale.startsWith('ar') ? 'text-right' : 'text-left'}>
          {label}
        </span>
        {info && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{info}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <span className={`font-mono ${highlight ? 'text-primary' : ''}`}>
        {formatPrice(amount)}
      </span>
    </div>
  );

  if (compact) {
    // Compact version - just show total with tooltip
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex justify-between items-center ${className}`}>
              <span className="text-sm text-muted-foreground">
                {t('pricing.total')}
              </span>
              <span className="font-semibold text-lg font-mono">
                {formatPrice(breakdown.total)}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="left" className="w-64">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t('pricing.basePrice')}</span>
                <span>{formatPrice(breakdown.basePrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  {t('pricing.tax')} ({getTaxRateDisplay(country)})
                </span>
                <span>{formatPrice(breakdown.taxAmount)}</span>
              </div>
              {breakdown.platformFee > 0 && (
                <div className="flex justify-between">
                  <span>{t('pricing.platformFee')}</span>
                  <span>{formatPrice(breakdown.platformFee)}</span>
                </div>
              )}
              {breakdown.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('pricing.discount')}</span>
                  <span>-{formatPrice(breakdown.discount)}</span>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full breakdown view
  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            {t('pricing.priceBreakdown')}
            <Badge variant="secondary">
              {country === Country.SaudiArabia
                ? t('country.saudiArabia')
                : t('country.egypt')}
            </Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {/* Base Price */}
        <PriceRow
          label={t('pricing.basePrice')}
          amount={breakdown.basePrice}
          info={t('pricing.basePriceInfo')}
        />

        {/* Tax */}
        <PriceRow
          label={`${t('pricing.tax')} (${getTaxRateDisplay(country)})`}
          amount={breakdown.taxAmount}
          info={
            country === Country.SaudiArabia
              ? t('pricing.saudiTaxInfo')
              : t('pricing.egyptTaxInfo')
          }
        />

        {/* Platform Fee */}
        {breakdown.platformFee > 0 && (
          <PriceRow
            label={t('pricing.platformFee')}
            amount={breakdown.platformFee}
            info={t('pricing.platformFeeInfo')}
          />
        )}

        {/* Subtotal */}
        <Separator className="my-2" />
        <PriceRow
          label={t('pricing.subtotal')}
          amount={breakdown.basePrice + breakdown.taxAmount + breakdown.platformFee}
          className="text-muted-foreground"
        />

        {/* Discount */}
        {breakdown.discount > 0 && (
          <>
            <PriceRow
              label={t('pricing.discount')}
              amount={-breakdown.discount}
              className="text-green-600"
              info={t('pricing.discountApplied')}
            />
            <Separator className="my-2" />
          </>
        )}

        {/* Total */}
        <PriceRow
          label={t('pricing.total')}
          amount={breakdown.total}
          highlight
          className="border-t-2 border-primary/20 pt-3 mt-2"
        />

        {/* Currency Note */}
        <div className="text-xs text-muted-foreground text-center pt-2">
          {t('pricing.allPricesIn')} {t(`currency.${useCurrency}`)}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceBreakdown;
