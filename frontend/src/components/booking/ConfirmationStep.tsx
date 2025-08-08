import * as React from "react";
import { BookingData, AddOn } from "./types";
import { Card } from "@/components/ui/card";

interface ConfirmationStepProps {
  data: BookingData;
  total: number;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ data, total }) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Service</span>
            <span className="font-medium">{data.service?.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Provider</span>
            <span className="font-medium">{data.service?.provider}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Scheduled</span>
            <span className="font-medium">{data.date?.toLocaleDateString()} {data.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Payment</span>
            <span className="font-medium">{data.paymentMethod === 'card' ? 'Card' : 'Pay on service'}</span>
          </div>
        </div>
      </Card>

      {data.addOns.length > 0 && (
        <Card className="p-4">
          <p className="font-medium mb-2">Add-ons</p>
          <div className="space-y-1">
            {data.addOns.map((a: AddOn) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span>{a.name}</span>
                <span className="font-medium">${a.price}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <span className="font-medium">Total</span>
        <span className="text-xl font-bold">${total.toFixed(2)}</span>
      </div>
    </div>
  );
};
