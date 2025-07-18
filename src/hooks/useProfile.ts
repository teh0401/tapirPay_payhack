import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOffline } from '@/contexts/OfflineContext';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  esg_score: number;
  esg_level: string;
  digital_id: string | null;
  is_verified: boolean;
  balance: number;
  
  total_transactions: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { updateStoredBalance, isOnline } = useOffline();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check if this is a demo user (bypass mode)
      if (user.id === '00000000-0000-0000-0000-000000000000' || 
          session?.access_token === 'demo-bypass-token') {
        // Get persisted demo balance or use default
        const savedBalance = localStorage.getItem('demo-user-balance');
        const demoBalance = savedBalance ? parseFloat(savedBalance) : 250.00;
        
        // Return mock profile data for demo user
        const mockProfile: UserProfile = {
          id: 'demo-profile-id',
          user_id: user.id,
          full_name: 'Demo',
          email: 'demo@mydigitalid.gov.my',
          phone: '+60123456789',
          avatar_url: null,
          esg_score: 90, // Fetched from esg_metrics overall_score
          esg_level: 'Excellent', // Updated to match overall score
          digital_id: 'MY2024202608',
          is_verified: true,
          balance: demoBalance, // Persisted demo balance
          
          total_transactions: 12,
          total_spent: 1850.25,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setProfile(mockProfile);
        
        // Store demo balance for offline validation
        if (isOnline) {
          updateStoredBalance(mockProfile.balance);
        }
        
        console.log("Demo profile loaded:", mockProfile);
        return;
      }
      
      // Normal profile fetching for real users
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          await createProfile();
          return;
        } else {
          throw profileError;
        }
      }

      // Fetch the latest ESG metrics for the user
      const { data: esgData, error: esgError } = await supabase
        .from('esg_metrics')
        .select('overall_score, environmental_score, social_score, governance_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (esgError && esgError.code !== 'PGRST116') {
        console.error('Error fetching ESG metrics:', esgError);
      }

      // Calculate ESG score and level based on metrics
      let esgScore = 0;
      let esgLevel = 'Beginner';

      if (esgData?.overall_score) {
        esgScore = Math.round(esgData.overall_score * 100); // Convert decimal to percentage
        if (esgScore >= 80) esgLevel = 'Excellent';
        else if (esgScore >= 60) esgLevel = 'Good';
        else if (esgScore >= 40) esgLevel = 'Fair';
        else esgLevel = 'Beginner';
      }

      // Combine profile data with ESG metrics
      const profileWithEsg = {
        ...profileData,
        esg_score: esgScore,
        esg_level: esgLevel
      };

      setProfile(profileWithEsg);
      
      // Store balance when online for offline validation
      if (isOnline && profileWithEsg.balance !== undefined) {
        updateStoredBalance(profileWithEsg.balance);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!user) return;

    try {
      const newProfile = {
        user_id: user.id,
        full_name: user.user_metadata?.full_name || 'New User',
        email: user.email || null,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (error) throw error;
      setProfile({
        ...data,
        esg_score: 0,
        esg_level: 'Beginner',
        is_verified: false,
        digital_id: null,
        balance: 0.00
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return { error: 'No user or profile found' };

    try {
      // Handle demo user updates
      if (user.id === '00000000-0000-0000-0000-000000000000' || 
          session?.access_token === 'demo-bypass-token') {
        // Update local profile state for demo user
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
        
        // Persist demo user balance to localStorage
        if (updates.balance !== undefined) {
          localStorage.setItem('demo-user-balance', updates.balance.toString());
        }
        
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        });
        return { data: updatedProfile, error: null };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile({
        ...data,
        esg_score: profile.esg_score,
        esg_level: profile.esg_level
      });
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
}