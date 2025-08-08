import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentSelectionProps {
  method?: "card" | "cash";
  onChange: (m: "card" | "cash") => void;
}

export const PaymentSelection: React.FC<PaymentSelectionProps> = ({ method, onChange }) => {
  return (
    <div className="space-y-4">
      <RadioGroup value={method} onValueChange={(v) => onChange(v as any)} className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 p-4 border rounded-md cursor-pointer">
          <RadioGroupItem value="card" />
          <div>
            <p className="font-medium">Pay by card</p>
            <p className="text-sm text-muted-foreground">Secure payment via Stripe</p>
          </div>
        </label>
        <label className="flex items-center gap-3 p-4 border rounded-md cursor-pointer">
          <RadioGroupItem value="cash" />
          <div>
            <p className="font-medium">Pay on service</p>
            <p className="text-sm text-muted-foreground">Pay provider after job completion</p>
          </div>
        </label>
      </RadioGroup>
    </div>
  );
};
