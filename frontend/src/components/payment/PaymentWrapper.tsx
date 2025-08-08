import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '@/lib/stripe';

interface PaymentWrapperProps {
  children: React.ReactNode;
}

export const PaymentWrapper: React.FC<PaymentWrapperProps> = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};