import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OrderTracking } from "@/components/realtime/OrderTracking";

const BookingSuccess = () => {
  const { state } = useLocation() as { state?: any };
  const navigate = useNavigate();
  const orderId: string | undefined = state?.orderId;
  const data = state?.data;
  const total: number = state?.total ?? 0;

  useEffect(() => {
    document.title = "Booking Confirmed | QuickHome";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Your booking is confirmed. Track your order status in real-time.");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header userType="customer" />
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Booking Confirmed</h1>
            <p className="text-muted-foreground">Thank you! Your order has been placed successfully.</p>
            {orderId && (
              <Badge variant="secondary">Order #{orderId.slice(-8)}</Badge>
            )}
          </div>

          <Card className="p-6 space-y-3">
            <p className="font-medium">Summary</p>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between"><span>Service</span><span className="font-medium">{data?.service?.title ?? '-'}</span></div>
              <div className="flex justify-between"><span>Scheduled</span><span className="font-medium">{data?.date ? new Date(data.date).toLocaleString() : '-'}</span></div>
              <div className="flex justify-between"><span>Payment</span><span className="font-medium">{data?.paymentMethod === 'card' ? 'Card' : 'Pay on service'}</span></div>
              <div className="flex justify-between pt-2 border-t"><span>Total</span><span className="font-bold">${total.toFixed(2)}</span></div>
            </div>
          </Card>

          {orderId && (
            <OrderTracking
              order={{
                id: orderId,
                status: 'pending',
                service: { name: data?.service?.title ?? 'Service', category: data?.service?.category ?? '' },
                scheduledDate: data?.date ? new Date(data.date).toISOString() : new Date().toISOString(),
                scheduledTime: data?.time ?? '',
                address: data?.customer?.address ?? 'Provided to provider',
                estimatedDuration: 120,
                updates: [],
              }}
            />
          )}

          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate('/customer/bookings')}>View My Bookings</Button>
            <Button variant="outline" onClick={() => navigate('/customer/browse')}>Browse More Services</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
