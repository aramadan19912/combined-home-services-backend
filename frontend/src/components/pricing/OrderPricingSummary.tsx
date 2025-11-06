/**
 * OrderPricingSummary Component
 * Complete pricing display for orders with payment status
 * Shows paid amount, remaining amount, and payment status
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Country, Currency, formatCurrency } from '@/utils/currency';
import { PriceBreakdown } from './PriceBreakdown';

export interface OrderPricingSummaryProps {
  basePrice: number;
  country: Country;
  currency: Currency;
  discount?: number;
  platformFee?: number;
  paidAmount: number;
  totalPrice: number;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';
  className?: string;
}

export const OrderPricingSummary: React.FC<OrderPricingSummaryProps> = ({
  basePrice,
  country,
  currency,
  discount = 0,
  platformFee = 0,
  paidAmount,
  totalPrice,
  paymentStatus,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const remainingAmount = totalPrice - paidAmount;
  const paymentProgress = (paidAmount / totalPrice) * 100;

  const formatPrice = (amount: number) => {
    return formatCurrency(amount, currency, locale);
  };

  const getPaymentStatusConfig = () => {
    switch (paymentStatus) {
      case 'Paid':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          variant: 'default' as const,
          label: t('payment.paid'),
          color: 'text-green-600',
        };
      case 'Partial':
        return {
          icon: <Clock className="h-4 w-4" />,
          variant: 'secondary' as const,
          label: t('payment.partiallyPaid'),
          color: 'text-yellow-600',
        };
      case 'Unpaid':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          variant: 'destructive' as const,
          label: t('payment.unpaid'),
          color: 'text-red-600',
        };
      case 'Refunded':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          variant: 'outline' as const,
          label: t('payment.refunded'),
          color: 'text-blue-600',
        };
    }
  };

  const statusConfig = getPaymentStatusConfig();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Payment Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('payment.paymentStatus')}</span>
            <Badge variant={statusConfig.variant} className="gap-1">
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Payment Progress */}
          {paymentStatus === 'Partial' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('payment.paymentProgress')}
                </span>
                <span className="font-semibold">{paymentProgress.toFixed(0)}%</span>
              </div>
              <Progress value={paymentProgress} className="h-2" />
            </div>
          )}

          {/* Amount Summary */}
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">{t('pricing.paidAmount')}</span>
              <span className="font-semibold text-green-600 font-mono">
                {formatPrice(paidAmount)}
              </span>
            </div>

            {remainingAmount > 0 && (
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">
                  {t('pricing.remainingAmount')}
                </span>
                <span className={`font-semibold font-mono ${statusConfig.color}`}>
                  {formatPrice(remainingAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center py-2 border-t pt-2">
              <span className="font-semibold">{t('pricing.total')}</span>
              <span className="font-bold text-lg font-mono">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <PriceBreakdown
        basePrice={basePrice}
        country={country}
        currency={currency}
        discount={discount}
        platformFee={platformFee}
      />
    </div>
  );
};

export default OrderPricingSummary;
