'use client';

import { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ onSuccess, onCancel }: { onSuccess?: () => void; onCancel?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setIsSubmitting(true);
      setErrorMessage(null);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/invoices?success=true`,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
      } else {
        onSuccess?.();
      }

      setIsSubmitting(false);
    },
    [stripe, elements, onSuccess]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {errorMessage && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errorMessage}</div>
      )}
      <div className="flex gap-3">
        <Button type="submit" disabled={!stripe || isSubmitting} isLoading={isSubmitting} className="flex-1">
          Pay Now
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface EmbeddedCheckoutProps {
  invoiceId: string;
  amount: number;
  currency: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EmbeddedCheckout({ invoiceId, amount, currency, onSuccess, onCancel }: EmbeddedCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialise = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/payments/create-intent', { invoiceId });
      setClientSecret(data?.data?.clientSecret || null);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to initialise checkout');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  if (!clientSecret) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Amount due</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency.toUpperCase() }).format(amount)}
            </p>
          </div>
        </div>
        {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <Button onClick={initialise} isLoading={loading} className="w-full">
          {loading ? 'Initialising…' : 'Proceed to Payment'}
        </Button>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}
