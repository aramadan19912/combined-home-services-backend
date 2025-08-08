import { z } from "zod";

export interface ServiceLite {
  id: string;
  title: string;
  provider: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  duration: string;
  location: string;
  category: string;
  description?: string;
}

export interface AddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
}

export const customerDetailsSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone is required"),
  address: z.string().min(5, "Address is required"),
});

export type CustomerDetails = z.infer<typeof customerDetailsSchema>;

export interface BookingData {
  service?: ServiceLite;
  date?: Date | null;
  time?: string;
  customer?: CustomerDetails;
  addOns: AddOn[];
  paymentMethod?: "card" | "cash";
  orderId?: string;
}
