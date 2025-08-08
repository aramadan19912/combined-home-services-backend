import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentsApi } from '@/services/api';

interface PaymentFormProps {
  orderId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveCard, setSaveCard] = useState(false);

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
        setError(stripeError.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      // Submit payment to your backend
      const paymentResult = await paymentsApi.createPayment({
        orderId,
        amount,
        providerType: 'ApplePay', // Default provider type
      });

      if (paymentResult.success) {
        setSucceeded(true);
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        onSuccess?.();
      } else {
        throw new Error('Payment failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
      toast({
        title: "Payment Failed",
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

  if (succeeded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-muted-foreground">
              Your payment of ${amount.toFixed(2)} has been processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
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
                id="save-card"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="save-card" className="text-sm text-muted-foreground">
                Save this card for future payments
              </label>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-lg font-bold">${amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!stripe || processing}
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};