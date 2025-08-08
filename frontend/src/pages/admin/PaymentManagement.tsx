import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RefundManagement } from '@/components/payment/admin/RefundManagement';
import { PaymentHistory } from '@/components/payment/PaymentHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  RefreshCw, 
  Receipt, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard
} from 'lucide-react';

export const PaymentManagement: React.FC = () => {
  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Monitor transactions, process refunds, and manage payment operations
          </p>
        </div>

        {/* Payment Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">
                98.5% success rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">19</div>
              <p className="text-xs text-muted-foreground">
                -12% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refunds Processed</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,450.00</div>
              <p className="text-xs text-muted-foreground">
                32 refund requests
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Completed
                </Badge>
                <span className="text-sm text-muted-foreground">1,234 (98.5%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  Pending
                </Badge>
                <span className="text-sm text-muted-foreground">5 (0.4%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Failed
                </Badge>
                <span className="text-sm text-muted-foreground">19 (1.5%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="gap-1">
                  <RefreshCw className="w-3 h-3" />
                  Refunded
                </Badge>
                <span className="text-sm text-muted-foreground">32 (2.5%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="refunds" className="space-y-4">
          <TabsList>
            <TabsTrigger value="refunds" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refund Management
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <Receipt className="h-4 w-4" />
              All Transactions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="refunds" className="space-y-4">
            <RefundManagement />
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <PaymentHistory />
          </TabsContent>
        </Tabs>
    </div>
  );
};