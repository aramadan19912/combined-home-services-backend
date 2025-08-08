import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerDetailsSchema, CustomerDetails } from "./types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CustomerDetailsFormProps {
  defaultValues?: Partial<CustomerDetails>;
  onSubmit: (values: CustomerDetails) => void;
  onBack?: () => void;
}

export const CustomerDetailsForm: React.FC<CustomerDetailsFormProps> = ({ defaultValues, onSubmit, onBack }) => {
  const form = useForm<CustomerDetails>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Service address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, City, State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </Form>
  );
};
