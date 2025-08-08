import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PaymentMethods } from '@/components/payment/PaymentMethods';
import { PaymentHistory } from '@/components/payment/PaymentHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Receipt, Wallet, TrendingUp } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';

export const Payments: React.FC = () => {
  return (
    <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
          <p className="text-muted-foreground">
            Manage your payment methods, view transaction history, and track spending
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,350.45</div>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                2 cards, 1 bank account
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$49.95</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="methods" className="space-y-4">
          <TabsList>
            <TabsTrigger value="methods" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Methods
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Receipt className="h-4 w-4" />
              Transaction History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="methods" className="space-y-4">
            <Elements stripe={stripePromise}>
              <PaymentMethods />
            </Elements>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-4">
            <PaymentHistory />
          </TabsContent>
        </Tabs>
    </div>
  );
};