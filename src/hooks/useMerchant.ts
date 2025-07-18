import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MerchantProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  business_description?: string;
  website_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
  esg_score: number;
  esg_rating: string;
  esg_reason?: string;
  environmental_score?: number;
  social_score?: number;
  governance_score?: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface MerchantSignupData {
  business_name: string;
  business_type: string;
  business_description: string;
  website_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
}

export const useMerchant = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  const fetchMerchantProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('merchant_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching merchant profile:', error);
        toast({
          title: "Error",
          description: "Failed to load merchant profile",
          variant: "destructive",
        });
      } else {
        setMerchantProfile(data);
        
        // Store in localStorage for offline support
        if (data) {
          localStorage.setItem('merchantProfile', JSON.stringify(data));
        } else {
          localStorage.removeItem('merchantProfile');
        }
      }
    } catch (error) {
      console.error('Error fetching merchant profile:', error);
      // Try to load from localStorage if online fetch fails
      const cachedProfile = localStorage.getItem('merchantProfile');
      if (cachedProfile) {
        setMerchantProfile(JSON.parse(cachedProfile));
      }
    } finally {
      setLoading(false);
    }
  };

  const createMerchantProfile = async (data: MerchantSignupData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    setEvaluating(true);
    try {
      // Create merchant profile
      const supabaseClient = session?.access_token === 'demo-bypass-token' 
        ? supabase.from('merchant_profiles')
        : supabase.from('merchant_profiles');
        
      const { data: profile, error: createError } = await supabaseClient
        .insert({
          user_id: user.id,
          ...data,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Evaluate ESG score
      await evaluateESGScore(profile.id, data);
      
      // Refresh profile data
      await fetchMerchantProfile();

      toast({
        title: "Success",
        description: "Merchant profile created successfully!",
      });

      return profile;
    } catch (error: any) {
      console.error('Error creating merchant profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create merchant profile",
        variant: "destructive",
      });
      throw error;
    } finally {
      setEvaluating(false);
    }
  };

  const updateMerchantProfile = async (updates: Partial<MerchantSignupData>) => {
    if (!user || !merchantProfile) {
      throw new Error('No merchant profile to update');
    }

    try {
      const { error } = await supabase
        .from('merchant_profiles')
        .update(updates)
        .eq('id', merchantProfile.id);

      if (error) {
        throw error;
      }

      await fetchMerchantProfile();

      toast({
        title: "Success",
        description: "Merchant profile updated successfully!",
      });
    } catch (error: any) {
      console.error('Error updating merchant profile:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update merchant profile",
        variant: "destructive",
      });
      throw error;
    }
  };

  const evaluateESGScore = async (profileId: string, merchantData: MerchantSignupData) => {
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-esg', {
        body: {
          profileId,
          merchantData,
        },
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error evaluating ESG score:', error);
      toast({
        title: "Warning",
        description: "ESG evaluation failed, but profile was created. You can re-evaluate later.",
        variant: "destructive",
      });
    }
  };

  const requestReEvaluation = async () => {
    if (!merchantProfile) {
      return;
    }

    setEvaluating(true);
    try {
      await evaluateESGScore(merchantProfile.id, {
        business_name: merchantProfile.business_name,
        business_type: merchantProfile.business_type,
        business_description: merchantProfile.business_description || '',
        website_url: merchantProfile.website_url,
        instagram_url: merchantProfile.instagram_url,
        facebook_url: merchantProfile.facebook_url,
        linkedin_url: merchantProfile.linkedin_url,
      });

      await fetchMerchantProfile();

      toast({
        title: "Success",
        description: "ESG score re-evaluated successfully!",
      });
    } catch (error) {
      console.error('Error re-evaluating ESG score:', error);
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    fetchMerchantProfile();
  }, [user]);

  return {
    merchantProfile,
    loading,
    evaluating,
    createMerchantProfile,
    updateMerchantProfile,
    requestReEvaluation,
    refetch: fetchMerchantProfile,
  };
};