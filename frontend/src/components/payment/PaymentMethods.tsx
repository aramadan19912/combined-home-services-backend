import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  Calendar,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentsApi } from '@/services/api';
import { PaymentMethod } from '@/types/api';
import { PaymentMethodForm } from './PaymentMethodForm';

export const PaymentMethods: React.FC = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentsApi.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMethod = async (methodId: string) => {
    setDeletingId(methodId);
    try {
      await paymentsApi.deletePaymentMethod(methodId);
      await loadPaymentMethods();
      toast({
        title: "Success",
        description: "Payment method deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getCardIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'card':
        return '💳';
      case 'bankaccount':
        return '🏦';
      case 'digitalwallet':
        return '📱';
      default:
        return '💳';
    }
  };

  const getCardColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'card':
        return 'bg-blue-50 border-blue-200';
      case 'bankaccount':
        return 'bg-green-50 border-green-200';
      case 'digitalwallet':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAddForm && (
          <PaymentMethodForm
            onSuccess={() => {
              setShowAddForm(false);
              loadPaymentMethods();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No payment methods added yet</p>
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="mt-4"
            >
              Add Your First Card
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 rounded-lg border-2 transition-all ${getCardColor(method.type)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getCardIcon(method.type)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {method.displayName}
                        </span>
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {method.lastFourDigits && `•••• ${method.lastFourDigits}`}
                        {method.expiryDate && ` | Expires ${method.expiryDate}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMethod(method.id)}
                      disabled={deletingId === method.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};