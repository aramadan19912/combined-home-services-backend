import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User, MapPin, FileText, Star, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { providersApi } from '@/services/api';

const registrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  services: z.array(z.string()).min(1, 'At least one service must be selected'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const ProviderRegistrationForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [idUploadName, setIdUploadName] = useState<string | null>(null);
  const [crUploadName, setCrUploadName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      services: [],
      agreeToTerms: false,
    },
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const serviceOptions = [
    'Plumbing', 'Electrical', 'Cleaning', 'Gardening', 'Painting',
    'Handyman', 'HVAC', 'Carpentry', 'Roofing', 'Flooring',
  ];

  const onSubmit = async (data: RegistrationForm) => {
    toast({
      title: "Registration submitted!",
      description: "Your application has been submitted for review.",
    });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Business & Documents</h3>
            </div>
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John's Services" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <FormLabel>Upload National ID (PDF/JPG/PNG)</FormLabel>
                <Input type="file" accept="application/pdf,image/jpeg,image/png" onChange={async (e)=>{
                  if (!e.target.files?.[0]) return;
                  const file = e.target.files[0];
                  if (file.size > 10*1024*1024) { toast({ title:'Max 10MB', variant:'destructive' }); return; }
                  setUploading(true);
                  try {
                    const res = await providersApi.uploadId(file);
                    const name = (res as any).fileName || file.name;
                    setIdUploadName(name);
                    toast({ title: 'ID uploaded' });
                  } catch { toast({ title:'Upload failed', variant:'destructive' }); }
                  finally { setUploading(false); }
                }} />
                {idUploadName && <p className="text-sm text-muted-foreground mt-1">Uploaded: {idUploadName}</p>}
              </div>
              <div>
                <FormLabel>Upload Commercial Registration (PDF/JPG/PNG)</FormLabel>
                <Input type="file" accept="application/pdf,image/jpeg,image/png" onChange={async (e)=>{
                  if (!e.target.files?.[0]) return;
                  const file = e.target.files[0];
                  if (file.size > 10*1024*1024) { toast({ title:'Max 10MB', variant:'destructive' }); return; }
                  setUploading(true);
                  try {
                    const res = await providersApi.uploadCr(file);
                    const name = (res as any).fileName || file.name;
                    setCrUploadName(name);
                    toast({ title: 'CR uploaded' });
                  } catch { toast({ title:'Upload failed', variant:'destructive' }); }
                  finally { setUploading(false); }
                }} />
                {crUploadName && <p className="text-sm text-muted-foreground mt-1">Uploaded: {crUploadName}</p>}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Services</h3>
            </div>
            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Services Offered</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {serviceOptions.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={field.value?.includes(service)}
                          onCheckedChange={(checked) => {
                            const updatedServices = checked
                              ? [...(field.value || []), service]
                              : field.value?.filter((s) => s !== service) || [];
                            field.onChange(updatedServices);
                          }}
                        />
                        <label htmlFor={service} className="text-sm cursor-pointer">
                          {service}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I agree to the Terms of Service</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Provider Registration</CardTitle>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStepContent()}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                {step < totalSteps ? (
                  <Button type="button" onClick={() => setStep(Math.min(totalSteps, step + 1))} disabled={uploading}>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={uploading}>Submit</Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderRegistrationForm;