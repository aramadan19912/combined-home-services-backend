/**
 * Enhanced PriceBreakdown Component
 * Beautiful, user-friendly price display with animations and visual feedback
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Info,
  DollarSign,
  Receipt,
  Tag,
  TrendingUp,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
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
  animated?: boolean;
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
  animated = true,
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

  // Enhanced price row component with icon
  const PriceRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    amount: number;
    className?: string;
    info?: string;
    highlight?: boolean;
    positive?: boolean;
    animationDelay?: number;
  }> = ({ icon, label, amount, className = '', info, highlight = false, positive = false, animationDelay = 0 }) => (
    <div
      className={`
        flex justify-between items-center py-3 px-2 rounded-lg
        ${animated ? 'animate-in fade-in-50 slide-in-from-left-5' : ''}
        ${highlight ? 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 font-semibold text-lg my-2 py-4' : 'hover:bg-muted/50 transition-colors'}
        ${positive ? 'text-green-600 dark:text-green-400' : ''}
        ${className}
      `}
      style={{ animationDelay: animated ? `${animationDelay}ms` : undefined }}
    >
      <div className="flex items-center gap-3">
        <div className={`
          p-2 rounded-full
          ${highlight ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
        `}>
          {icon}
        </div>
        <div>
          <span className="font-medium">{label}</span>
          {info && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="inline h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{info}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      <span className={`font-mono ${highlight ? 'text-xl' : 'text-base'}`}>
        {positive && '+'}
        {formatPrice(amount)}
      </span>
    </div>
  );

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-4 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 ${className}`}>
        <DollarSign className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">{t('pricing.total')}</p>
          <p className="text-2xl font-bold text-primary">{formatPrice(breakdown.total)}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      {showTitle && (
        <CardHeader className="bg-gradient-to-br from-primary/5 via-primary/3 to-background border-b">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            {t('pricing.priceBreakdown')}
            <Badge variant="secondary" className="ml-auto">
              {breakdown.currencySymbol}
            </Badge>
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className="p-6 space-y-1">
        {/* Base Price */}
        <PriceRow
          icon={<DollarSign className="h-4 w-4" />}
          label={t('pricing.basePrice')}
          amount={breakdown.basePrice}
          info={t('pricing.basePriceInfo')}
          animationDelay={0}
        />

        {/* Tax */}
        <PriceRow
          icon={<Receipt className="h-4 w-4" />}
          label={`${t('pricing.tax')} (${getTaxRateDisplay(breakdown.taxRate)})`}
          amount={breakdown.taxAmount}
          info={
            country === Country.SaudiArabia
              ? t('pricing.saudiTaxInfo')
              : t('pricing.egyptTaxInfo')
          }
          animationDelay={100}
        />

        {/* Platform Fee */}
        {platformFee > 0 && (
          <PriceRow
            icon={<TrendingUp className="h-4 w-4" />}
            label={t('pricing.platformFee')}
            amount={breakdown.platformFee}
            info={t('pricing.platformFeeInfo')}
            animationDelay={200}
          />
        )}

        {/* Discount */}
        {discount > 0 && (
          <>
            <Separator className="my-3" />
            <PriceRow
              icon={<Tag className="h-4 w-4" />}
              label={t('pricing.discount')}
              amount={-breakdown.discount}
              className="text-green-600 dark:text-green-400"
              info={t('pricing.discountApplied')}
              positive={false}
              animationDelay={300}
            />
          </>
        )}

        {/* Separator before total */}
        <Separator className="my-4" />

        {/* Total */}
        <PriceRow
          icon={<CheckCircle2 className="h-5 w-5" />}
          label={t('pricing.total')}
          amount={breakdown.total}
          highlight={true}
          animationDelay={400}
        />

        {/* Currency note */}
        <div className="pt-4 border-t mt-4">
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3" />
            {t('pricing.allPricesIn')} {breakdown.currencySymbol}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceBreakdown;
