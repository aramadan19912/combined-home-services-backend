import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  DollarSign, 
  Calendar, 
  CreditCard,
  AlertTriangle,
  Check,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentsApi } from '@/services/api';
import { PaymentTransaction } from '@/types/api';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const RefundManagement: React.FC = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('completed');
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await paymentsApi.getPayments();
      setTransactions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (transaction: PaymentTransaction, isPartial: boolean = false) => {
    setSelectedTransaction(transaction);
    setRefundAmount(isPartial ? '' : transaction.amount.toString());
    setRefundReason('');
    setShowRefundDialog(true);
  };

  const processRefund = async () => {
    if (!selectedTransaction) return;
    
    setProcessing(true);
    try {
      const amount = parseFloat(refundAmount);
      
      if (amount === selectedTransaction.amount) {
        await paymentsApi.admin.refund(selectedTransaction.id);
      } else {
        await paymentsApi.admin.partialRefund(selectedTransaction.id, amount);
      }
      
      await loadTransactions();
      setShowRefundDialog(false);
      toast({
        title: "Success",
        description: `Refund of $${amount.toFixed(2)} processed successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process refund",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryPayment = async (transactionId: string) => {
    setRetryingId(transactionId);
    try {
      await paymentsApi.admin.retry(transactionId);
      await loadTransactions();
      toast({
        title: "Success",
        description: "Payment retry initiated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retry payment",
        variant: "destructive",
      });
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Check className="w-4 h-4 text-success" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-muted-foreground" />;
      default:
        return <DollarSign className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const canRefund = (transaction: PaymentTransaction) => {
    return transaction.status.toLowerCase() === 'completed' && 
           (!transaction.refundedAmount || transaction.refundedAmount < transaction.amount);
  };

  const canRetry = (transaction: PaymentTransaction) => {
    return transaction.status.toLowerCase() === 'failed';
  };

  const getRemainingRefundAmount = (transaction: PaymentTransaction) => {
    return transaction.amount - (transaction.refundedAmount || 0);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Refund Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Refund Management
          </CardTitle>
          
          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p className="font-medium">Order #{transaction.orderId}</p>
                        <p className="text-sm text-muted-foreground">ID: {transaction.id}</p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(transaction.createdAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">${transaction.amount.toFixed(2)}</p>
                      {transaction.refundedAmount && transaction.refundedAmount > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Refunded: ${transaction.refundedAmount.toFixed(2)}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {transaction.paymentMethod || 'Card Payment'}
                      </div>
                    </div>
                    
                    <Badge variant={getStatusVariant(transaction.status)}>
                      {transaction.status}
                    </Badge>
                    
                    <div className="flex space-x-2">
                      {canRefund(transaction) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefund(transaction, true)}
                            className="gap-2"
                          >
                            Partial Refund
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRefund(transaction, false)}
                            className="gap-2"
                          >
                            Full Refund
                          </Button>
                        </>
                      )}
                      
                      {canRetry(transaction) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetryPayment(transaction.id)}
                          disabled={retryingId === transaction.id}
                          className="gap-2"
                        >
                          {retryingId === transaction.id ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              {selectedTransaction && `Order #${selectedTransaction.orderId} - $${selectedTransaction.amount.toFixed(2)}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <Alert>
                <DollarSign className="w-4 h-4" />
                <AlertDescription>
                  Maximum refundable amount: ${getRemainingRefundAmount(selectedTransaction).toFixed(2)}
                </AlertDescription>
              </Alert>
              
              <div>
                <Label htmlFor="refund-amount">Refund Amount</Label>
                <Input
                  id="refund-amount"
                  type="number"
                  placeholder="0.00"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  max={getRemainingRefundAmount(selectedTransaction)}
                  step="0.01"
                />
              </div>
              
              <div>
                <Label htmlFor="refund-reason">Reason for Refund</Label>
                <Input
                  id="refund-reason"
                  placeholder="Enter refund reason..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRefundDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={processRefund}
                  disabled={processing || !refundAmount || parseFloat(refundAmount) <= 0}
                  className="flex-1"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Refund $${parseFloat(refundAmount || '0').toFixed(2)}`
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};