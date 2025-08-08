import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentsApi } from '@/services/api';

interface PaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setAsDefault, setSetAsDefault] = useState(true);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (stripeError) {
        setError(stripeError.message || 'Failed to add payment method');
        setProcessing(false);
        return;
      }

      // Save payment method to your backend
      await paymentsApi.createPaymentMethod({
        type: 'Card',
        displayName: `${paymentMethod.card?.brand} ••••${paymentMethod.card?.last4}`,
        cardNumber: paymentMethod.card?.last4,
        isDefault: setAsDefault,
      });

      toast({
        title: "Success",
        description: "Payment method added successfully",
      });
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add payment method';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: 'hsl(var(--foreground))',
        '::placeholder': {
          color: 'hsl(var(--muted-foreground))',
        },
      },
    },
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Add New Payment Method</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Card Information
            </label>
            <div className="p-3 border border-input rounded-md">
              <CardElement options={cardStyle} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="set-default"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="set-default" className="text-sm text-muted-foreground">
              Set as default payment method
            </label>
          </div>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!stripe || processing}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Card'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};