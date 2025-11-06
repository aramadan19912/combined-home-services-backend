/**
 * InvoiceViewer Component
 * Tax-compliant invoice display with PDF download and print
 */

import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Share2,
} from 'lucide-react';
import { Invoice, InvoiceStatus, Country } from '@/types/enhanced-entities';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { toast } from 'sonner';

export interface InvoiceViewerProps {
  invoice: Invoice;
  providerDetails?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    taxId?: string;
  };
  customerDetails?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  onDownloadPDF?: () => Promise<void>;
  onShare?: () => Promise<void>;
  className?: string;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({
  invoice,
  providerDetails,
  customerDetails,
  onDownloadPDF,
  onShare,
  className = '',
}) => {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');

    if (!printWindow) {
      toast.error(t('invoice.printBlocked'));
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${t('invoice.invoice')} ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-table { width: 100%; border-collapse: collapse; }
            .invoice-table th, .invoice-table td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            .invoice-table th { background-color: #f2f2f2; }
            .total-section { margin-top: 20px; text-align: right; }
            @media print {
              body { margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();

    toast.success(t('invoice.printSuccess'));
  };

  const handleDownloadPDF = async () => {
    if (!onDownloadPDF) return;

    try {
      await onDownloadPDF();
      toast.success(t('invoice.downloadSuccess'));
    } catch (error) {
      toast.error(t('invoice.downloadFailed'));
    }
  };

  const handleShare = async () => {
    if (!onShare) return;

    try {
      await onShare();
      toast.success(t('invoice.shareSuccess'));
    } catch (error) {
      toast.error(t('invoice.shareFailed'));
    }
  };

  const getStatusBadge = () => {
    switch (invoice.status) {
      case InvoiceStatus.Paid:
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t('invoice.status.paid')}
          </Badge>
        );
      case InvoiceStatus.Pending:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {t('invoice.status.pending')}
          </Badge>
        );
      case InvoiceStatus.Cancelled:
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            {t('invoice.status.cancelled')}
          </Badge>
        );
      case InvoiceStatus.Overdue:
        return (
          <Badge variant="outline" className="gap-1 border-orange-500 text-orange-500">
            <Clock className="h-3 w-3" />
            {t('invoice.status.overdue')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCountryName = (country: Country) => {
    switch (country) {
      case Country.SaudiArabia:
        return t('country.saudiArabia');
      case Country.Egypt:
        return t('country.egypt');
      case Country.UAE:
        return t('country.uae');
      case Country.Kuwait:
        return t('country.kuwait');
      default:
        return '';
    }
  };

  return (
    <Card className={className}>
      {/* Action Bar */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">{t('invoice.invoice')}</h3>
              <p className="text-sm text-muted-foreground">
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              {t('invoice.print')}
            </Button>
            {onDownloadPDF && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                {t('invoice.download')}
              </Button>
            )}
            {onShare && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                {t('invoice.share')}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Printable Content */}
        <div ref={printRef}>
          {/* Invoice Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t('invoice.invoice')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {invoice.invoiceNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold mb-1">
                  {t('invoice.issueDate')}
                </p>
                <p className="text-sm">
                  {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                </p>
                {invoice.dueDate && (
                  <>
                    <p className="text-sm font-semibold mt-3 mb-1">
                      {t('invoice.dueDate')}
                    </p>
                    <p className="text-sm">
                      {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                    </p>
                  </>
                )}
              </div>
            </div>

            <Separator />
          </div>

          {/* Provider and Customer Details */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Provider (From) */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                {t('invoice.from')}
              </h3>
              <div className="space-y-1">
                <p className="font-semibold">
                  {providerDetails?.name || t('invoice.providerName')}
                </p>
                {providerDetails?.address && (
                  <p className="text-sm">{providerDetails.address}</p>
                )}
                {providerDetails?.phone && (
                  <p className="text-sm">{providerDetails.phone}</p>
                )}
                {providerDetails?.email && (
                  <p className="text-sm">{providerDetails.email}</p>
                )}
                {providerDetails?.taxId && (
                  <p className="text-sm">
                    {t('invoice.taxId')}: {providerDetails.taxId}
                  </p>
                )}
              </div>
            </div>

            {/* Customer (To) */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                {t('invoice.billTo')}
              </h3>
              <div className="space-y-1">
                <p className="font-semibold">
                  {customerDetails?.name || t('invoice.customerName')}
                </p>
                {customerDetails?.address && (
                  <p className="text-sm">{customerDetails.address}</p>
                )}
                {customerDetails?.phone && (
                  <p className="text-sm">{customerDetails.phone}</p>
                )}
                {customerDetails?.email && (
                  <p className="text-sm">{customerDetails.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 font-semibold">
                    {t('invoice.description')}
                  </th>
                  <th className="text-right py-3 px-2 font-semibold w-32">
                    {t('invoice.amount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-2">
                    <p className="font-medium">{t('invoice.serviceCharge')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('invoice.orderId')}: {invoice.orderId.substring(0, 8)}...
                    </p>
                  </td>
                  <td className="text-right py-3 px-2 font-medium">
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between text-sm">
                <span>{t('invoice.subtotal')}:</span>
                <span className="font-medium">
                  {formatCurrency(invoice.subtotal, invoice.currency)}
                </span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('invoice.discount')}:</span>
                  <span className="font-medium">
                    -{formatCurrency(invoice.discountAmount, invoice.currency)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>
                  {t('invoice.tax')} ({(invoice.taxRate * 100).toFixed(0)}%):
                </span>
                <span className="font-medium">
                  {formatCurrency(invoice.taxAmount, invoice.currency)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>{t('invoice.total')}:</span>
                <span>
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </span>
              </div>

              {invoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t('invoice.amountPaid')}:</span>
                    <span className="font-medium">
                      {formatCurrency(invoice.paidAmount, invoice.currency)}
                    </span>
                  </div>

                  {invoice.totalAmount > invoice.paidAmount && (
                    <div className="flex justify-between text-sm text-orange-600">
                      <span>{t('invoice.amountDue')}:</span>
                      <span className="font-medium">
                        {formatCurrency(
                          invoice.totalAmount - invoice.paidAmount,
                          invoice.currency
                        )}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer Notes */}
          <div className="border-t pt-6 space-y-4">
            {invoice.notes && (
              <div>
                <h4 className="text-sm font-semibold mb-2">
                  {t('invoice.notes')}:
                </h4>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                {t('invoice.country')}: {getCountryName(invoice.country)}
              </p>
              <p>
                {t('invoice.taxCompliant')}{' '}
                {invoice.country === Country.SaudiArabia
                  ? t('invoice.saudiTaxInfo')
                  : invoice.country === Country.Egypt
                  ? t('invoice.egyptTaxInfo')
                  : ''}
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                {t('invoice.generatedOn')}{' '}
                {format(new Date(), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceViewer;
