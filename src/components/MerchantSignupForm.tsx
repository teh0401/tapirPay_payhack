import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Globe, Instagram, Facebook, Linkedin } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const merchantSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  business_type: z.string().min(1, 'Please select a business type'),
  business_description: z.string().min(10, 'Please provide a brief description (at least 10 characters)'),
  website_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Please enter a valid Instagram URL').optional().or(z.literal('')),
  facebook_url: z.string().url('Please enter a valid Facebook URL').optional().or(z.literal('')),
  linkedin_url: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
});

type MerchantFormData = z.infer<typeof merchantSchema>;

interface MerchantSignupFormProps {
  onSuccess: (data: MerchantFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const businessTypes = [
  'Retail & E-commerce',
  'Food & Beverage',
  'Technology',
  'Healthcare',
  'Education',
  'Fashion & Clothing',
  'Beauty & Wellness',
  'Automotive',
  'Real Estate',
  'Professional Services',
  'Non-profit',
  'Manufacturing',
  'Agriculture',
  'Entertainment',
  'Other',
];

export const MerchantSignupForm = ({ onSuccess, onCancel, loading }: MerchantSignupFormProps) => {
  const form = useForm<MerchantFormData>({
    resolver: zodResolver(merchantSchema),
    defaultValues: {
      business_name: '',
      business_type: '',
      business_description: '',
      website_url: '',
      instagram_url: '',
      facebook_url: '',
      linkedin_url: '',
    },
  });

  const onSubmit = (data: MerchantFormData) => {
    // Clean empty URL fields
    const cleanedData = {
      ...data,
      website_url: data.website_url || undefined,
      instagram_url: data.instagram_url || undefined,
      facebook_url: data.facebook_url || undefined,
      linkedin_url: data.linkedin_url || undefined,
    };
    onSuccess(cleanedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your business name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="business_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your business type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="business_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Briefly describe your business, products/services, and any sustainable practices"
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Help us understand your business better for accurate ESG evaluation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Online Presence (Optional)</Label>
          <p className="text-xs text-muted-foreground">
            Provide your online URLs to help us evaluate your ESG impact
          </p>

          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://yourwebsite.com"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagram_url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://instagram.com/yourbusiness"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="facebook_url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://facebook.com/yourbusiness"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedin_url"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="https://linkedin.com/company/yourbusiness"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Merchant Profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
};