import * as React from "react";
import { AddOn } from "./types";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

interface AddOnsStepProps {
  addOns: AddOn[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export const defaultAddOns: AddOn[] = [
  { id: "a1", name: "Priority service", price: 15 },
  { id: "a2", name: "Eco-friendly materials", price: 10 },
  { id: "a3", name: "Deep clean add-on", price: 25 },
];

export const AddOnsStep: React.FC<AddOnsStepProps> = ({ addOns, selected, onChange }) => {
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(addOns.length ? addOns : defaultAddOns).map((addon) => (
        <Card key={addon.id} className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{addon.name}</p>
            {addon.description && (
              <p className="text-sm text-muted-foreground">{addon.description}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold">${addon.price}</span>
            <Checkbox checked={selected.includes(addon.id)} onCheckedChange={() => toggle(addon.id)} />
          </div>
        </Card>
      ))}
    </div>
  );
};
