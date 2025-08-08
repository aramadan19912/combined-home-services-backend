import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceCard } from "@/components/customer/ServiceCard";
import { DateTimeStep } from "@/components/booking/DateTimeStep";
import { CustomerDetailsForm } from "@/components/booking/CustomerDetailsForm";
import { AddOnsStep, defaultAddOns } from "@/components/booking/AddOnsStep";
import { PaymentSelection } from "@/components/booking/PaymentSelection";
import { ConfirmationStep } from "@/components/booking/ConfirmationStep";
import { PaymentWrapper } from "@/components/payment/PaymentWrapper";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ordersApi } from "@/services/api";
import type { BookingData, ServiceLite, AddOn, CustomerDetails } from "@/components/booking/types";
import cleaningService from "@/assets/cleaning-service.jpg";
import plumbingService from "@/assets/plumbing-service.jpg";
import electricalService from "@/assets/electrical-service.jpg";
import gardeningService from "@/assets/gardening-service.jpg";

const sampleServices: ServiceLite[] = [
  {
    id: "1",
    title: "Professional Home Cleaning",
    provider: "CleanPro Services",
    image: cleaningService,
    price: 89,
    rating: 4.8,
    reviewCount: 124,
    duration: "2-3 hours",
    location: "Downtown",
    category: "Cleaning",
    description: "A thorough clean of your home by vetted professionals.",
  },
  {
    id: "2",
    title: "Emergency Plumbing Repair",
    provider: "FastFix Plumbers",
    image: plumbingService,
    price: 120,
    rating: 4.9,
    reviewCount: 89,
    duration: "1-2 hours",
    location: "Citywide",
    category: "Plumbing",
    description: "Fast and reliable plumbing fixes for leaks and clogs.",
  },
  {
    id: "3",
    title: "Electrical Installation & Repair",
    provider: "PowerPro Electric",
    image: electricalService,
    price: 95,
    rating: 4.7,
    reviewCount: 156,
    duration: "1-4 hours",
    location: "Metro Area",
    category: "Electrical",
    description: "Certified electricians for safe installations and repairs.",
  },
  {
    id: "4",
    title: "Garden Maintenance & Landscaping",
    provider: "GreenThumb Gardens",
    image: gardeningService,
    price: 75,
    rating: 4.6,
    reviewCount: 92,
    duration: "2-4 hours",
    location: "Suburban",
    category: "Gardening",
    description: "Keep your garden lush with pro maintenance.",
  },
];

const steps = [
  "Service",
  "Schedule",
  "Details",
  "Add-ons",
  "Payment",
  "Review",
  "Pay",
];

const BookService = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [params] = useSearchParams();

  const preselected: ServiceLite | undefined = (location.state as any)?.service;
  const preselectedId = params.get("serviceId");

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BookingData>({ addOns: [] });

  useEffect(() => {
    document.title = "Book a Service | QuickHome";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "Book home services in minutes: schedule, add-ons, and secure payment.");
  }, []);

  // Initialize service if provided
  useEffect(() => {
    if (preselected) {
      setData((d) => ({ ...d, service: preselected }));
      setStep(2);
      return;
    }
    if (preselectedId) {
      const found = sampleServices.find((s) => s.id === preselectedId);
      if (found) {
        setData((d) => ({ ...d, service: found }));
        setStep(2);
      }
    }
  }, [preselected, preselectedId]);

  const total = useMemo(() => {
    const base = data.service?.price ?? 0;
    const addons = (data.addOns || []).reduce((sum: number, a: AddOn) => sum + a.price, 0);
    return base + addons;
  }, [data.service, data.addOns]);

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length));
  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleCreateOrderAndProceed = async () => {
    if (!data.service || !data.date || !data.time || !data.paymentMethod) {
      toast({ title: "Missing info", description: "Please complete all steps before confirming.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        serviceId: data.service.id,
        scheduledAt: new Date(
          data.date.getFullYear(),
          data.date.getMonth(),
          data.date.getDate(),
          parseInt(data.time.split(":")[0], 10),
          parseInt(data.time.split(":")[1], 10)
        ).toISOString(),
        addOns: data.addOns.map((a) => ({ id: a.id, price: a.price })),
        address: data.customer?.address,
        notes: "",
        amount: total,
      };

      const order = await ordersApi.createOrder(payload as any);
      const orderId = (order as any).id as string;
      setData((d) => ({ ...d, orderId }));

      if (data.paymentMethod === "cash") {
        navigate("/customer/booking-success", { state: { orderId, data, total } });
      } else {
        setStep(7);
      }
    } catch (e) {
      toast({ title: "Could not create order", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const defaultCustomer: Partial<CustomerDetails> | undefined = isAuthenticated && user ? {
    fullName: user.fullName || user.name || "",
    email: user.email || "",
    phone: user.phoneNumber || "",
    address: "",
  } : undefined;

  // If user is authenticated, we can skip the Details step UI (auto-advance once schedule is chosen and customer is set)
  useEffect(() => {
    if (isAuthenticated && step === 3) {
      setData((d) => ({ ...d, customer: defaultCustomer as CustomerDetails }));
      setStep(4);
    }
  }, [isAuthenticated, step]);

  return (
    <div className="min-h-screen bg-background">
      <Header userType="customer" />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Book a Service</h1>
          <p className="text-muted-foreground">Follow the steps to schedule and confirm your booking.</p>
        </div>

        {/* Stepper */}
        <div className="flex flex-wrap gap-2 mb-8">
          {steps.map((label, i) => (
            <Badge key={label} variant={i + 1 <= step ? "secondary" : "outline"}>{i + 1}. {label}</Badge>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Service selection */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">1. Select a service</h2>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {sampleServices.map((s) => (
                    <ServiceCard key={s.id} service={s} onBook={() => { setData((d) => ({ ...d, service: s })); setStep(2); }} />
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">2. Choose date & time</h2>
                <Card className="p-4">
                  <DateTimeStep
                    date={data.date ?? null}
                    time={data.time}
                    onChange={(v) => setData((d) => ({ ...d, ...v }))}
                  />
                </Card>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={goBack}>Back</Button>
                  <Button onClick={() => {
                    if (!data.date || !data.time) {
                      toast({ title: "Select a date and time", variant: "destructive" });
                      return;
                    }
                    setStep(3);
                  }}>Continue</Button>
                </div>
              </div>
            )}

            {/* Step 3: Customer details (if not logged in) */}
            {step === 3 && !isAuthenticated && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">3. Your details</h2>
                <Card className="p-4">
                  <CustomerDetailsForm
                    defaultValues={defaultCustomer}
                    onBack={goBack}
                    onSubmit={(values) => { setData((d) => ({ ...d, customer: values })); setStep(4); }}
                  />
                </Card>
              </div>
            )}

            {/* Step 4: Add-ons */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">4. Add-ons (optional)</h2>
                <Card className="p-4">
                  <AddOnsStep
                    addOns={defaultAddOns}
                    selected={(data.addOns || []).map((a) => a.id)}
                    onChange={(ids) => {
                      const selected = defaultAddOns.filter((a) => ids.includes(a.id));
                      setData((d) => ({ ...d, addOns: selected }));
                    }}
                  />
                </Card>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={goBack}>Back</Button>
                  <Button onClick={() => setStep(5)}>Continue</Button>
                </div>
              </div>
            )}

            {/* Step 5: Payment method */}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">5. Payment method</h2>
                <Card className="p-4">
                  <PaymentSelection
                    method={data.paymentMethod}
                    onChange={(m) => setData((d) => ({ ...d, paymentMethod: m }))}
                  />
                </Card>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={goBack}>Back</Button>
                  <Button onClick={() => {
                    if (!data.paymentMethod) { toast({ title: "Select a payment method", variant: "destructive" }); return; }
                    setStep(6);
                  }}>Continue</Button>
                </div>
              </div>
            )}

            {/* Step 6: Review & confirm */}
            {step === 6 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">6. Review & confirm</h2>
                <Card className="p-4">
                  <ConfirmationStep data={data} total={total} />
                </Card>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={goBack}>Back</Button>
                  <Button onClick={handleCreateOrderAndProceed} disabled={loading}>
                    {loading ? "Creating order..." : data.paymentMethod === 'card' ? "Confirm & Pay" : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 7: Payment processing */}
            {step === 7 && data.orderId && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">7. Payment</h2>
                <PaymentWrapper>
                  <PaymentForm
                    orderId={data.orderId}
                    amount={total}
                    onSuccess={() => navigate("/customer/booking-success", { state: { orderId: data.orderId, data, total } })}
                    onError={() => {}}
                  />
                </PaymentWrapper>
                <div className="flex justify-start">
                  <Button variant="outline" onClick={goBack}>Back</Button>
                </div>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="space-y-4">
            <Card className="p-4">
              <p className="font-semibold mb-2">Summary</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service</span>
                  <span className="font-medium">{data.service ? `$${data.service.price.toFixed(2)}` : "-"}</span>
                </div>
                {data.addOns?.map((a) => (
                  <div key={a.id} className="flex justify-between text-muted-foreground">
                    <span>{a.name}</span>
                    <span>${a.price.toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-medium">Total</span>
                  <span className="text-lg font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            {data.service && (
              <Card className="overflow-hidden">
                <img src={data.service.image} alt={data.service.title} className="w-full h-32 object-cover" loading="lazy" />
                <div className="p-4">
                  <p className="font-medium">{data.service.title}</p>
                  <p className="text-sm text-muted-foreground">by {data.service.provider}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookService;
