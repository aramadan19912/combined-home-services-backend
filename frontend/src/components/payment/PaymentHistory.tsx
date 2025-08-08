import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Receipt, 
  Download, 
  Calendar, 
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentsApi } from '@/services/api';
import { PaymentTransaction } from '@/types/api';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const PaymentHistory: React.FC = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [downloadingReceipt, setDownloadingReceipt] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const history = await paymentsApi.getPayments();
      setTransactions(history);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payment history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (transactionId: string) => {
    setDownloadingReceipt(transactionId);
    try {
      const blob = await paymentsApi.getReceipt(transactionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `receipt-${transactionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive",
      });
    } finally {
      setDownloadingReceipt(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
      case 'canceled':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'succeeded':
        return 'default';
      case 'failed':
      case 'canceled':
        return 'destructive';
      case 'pending':
        return 'secondary';
      case 'refunded':
        return 'outline';
      default:
        return 'secondary';
    }
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
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Payment History
          </CardTitle>
        </div>
        
        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or transaction ID..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== 'all' ? 'No transactions match your filters' : 'No payment history found'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <p className="font-medium">Order #{transaction.orderId}</p>
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
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {transaction.paymentMethod || 'Card Payment'}
                      </div>
                    </div>
                    
                    <Badge variant={getStatusVariant(transaction.status)}>
                      {transaction.status}
                    </Badge>
                    
                    {transaction.status.toLowerCase() === 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReceipt(transaction.id)}
                        disabled={downloadingReceipt === transaction.id}
                        className="gap-2"
                      >
                        {downloadingReceipt === transaction.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        Receipt
                      </Button>
                    )}
                  </div>
                </div>
                
                {transaction.refundedAmount && transaction.refundedAmount > 0 && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <span className="text-muted-foreground">Refunded: </span>
                    <span className="font-medium">${transaction.refundedAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};