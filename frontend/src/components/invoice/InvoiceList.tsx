/**
 * InvoiceList Component
 * Display list of invoices with filtering and sorting
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  DollarSign,
  Search,
  Filter,
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '@/types/enhanced-entities';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';

export interface InvoiceListProps {
  invoices: Invoice[];
  onViewInvoice: (invoiceId: string) => void;
  onDownloadInvoice?: (invoiceId: string) => Promise<void>;
  showFilters?: boolean;
  initialPageSize?: number;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  onViewInvoice,
  onDownloadInvoice,
  showFilters = true,
  initialPageSize = 10,
  className = '',
}) => {
  const { t } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(initialPageSize);

  // Filter and sort invoices
  const processedInvoices = useMemo(() => {
    let filtered = [...invoices];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((inv) => inv.status === filterStatus);
    }

    // Sort
    const sorted = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
        case 'oldest':
          return new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
        case 'highest':
          return b.totalAmount - a.totalAmount;
        case 'lowest':
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [invoices, searchTerm, filterStatus, sortBy]);

  // Pagination
  const totalPages = Math.ceil(processedInvoices.length / pageSize);
  const paginatedInvoices = processedInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: InvoiceStatus) => {
    const variants = {
      [InvoiceStatus.Paid]: 'default',
      [InvoiceStatus.Pending]: 'secondary',
      [InvoiceStatus.Cancelled]: 'destructive',
      [InvoiceStatus.Overdue]: 'outline',
    };

    return (
      <Badge variant={variants[status] as any}>
        {t(`invoice.status.${InvoiceStatus[status].toLowerCase()}`)}
      </Badge>
    );
  };

  if (invoices.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {t('invoice.noInvoices')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('invoice.noInvoicesDescription')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('invoice.searchPlaceholder')}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select
                value={filterStatus}
                onValueChange={(value) =>
                  setFilterStatus(value as InvoiceStatus | 'all')
                }
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('invoice.allStatuses')}</SelectItem>
                  <SelectItem value={InvoiceStatus.Paid.toString()}>
                    {t('invoice.status.paid')}
                  </SelectItem>
                  <SelectItem value={InvoiceStatus.Pending.toString()}>
                    {t('invoice.status.pending')}
                  </SelectItem>
                  <SelectItem value={InvoiceStatus.Overdue.toString()}>
                    {t('invoice.status.overdue')}
                  </SelectItem>
                  <SelectItem value={InvoiceStatus.Cancelled.toString()}>
                    {t('invoice.status.cancelled')}
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">
                    {t('invoice.sort.newest')}
                  </SelectItem>
                  <SelectItem value="oldest">
                    {t('invoice.sort.oldest')}
                  </SelectItem>
                  <SelectItem value="highest">
                    {t('invoice.sort.highest')}
                  </SelectItem>
                  <SelectItem value="lowest">
                    {t('invoice.sort.lowest')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice List */}
      <div className="space-y-4">
        {paginatedInvoices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('invoice.noMatchingInvoices')}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t('invoice.tryDifferentFilters')}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
              >
                {t('invoice.clearFilters')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          paginatedInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">
                          {invoice.invoiceNumber}
                        </h3>
                        {getStatusBadge(invoice.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-foreground">
                            {formatCurrency(invoice.totalAmount, invoice.currency)}
                          </span>
                        </div>
                      </div>

                      {invoice.dueDate && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {t('invoice.dueDate')}:{' '}
                          {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewInvoice(invoice.id)}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      {t('invoice.view')}
                    </Button>
                    {onDownloadInvoice && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDownloadInvoice(invoice.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {t('invoice.showing', {
                  start: (currentPage - 1) * pageSize + 1,
                  end: Math.min(currentPage * pageSize, processedInvoices.length),
                  total: processedInvoices.length,
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  {t('common.previous')}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceList;
