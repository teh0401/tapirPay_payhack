import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useOffline } from '@/contexts/OfflineContext';
import localforage from 'localforage';
import { calculateUserBalance } from '@/hooks/useBalanceCalculation';

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

  // Listen for transaction changes to refresh profile
  useEffect(() => {
    const handleTransactionChange = () => {
      if (user) {
        fetchProfile();
      }
    };

    window.addEventListener('transactionCreated', handleTransactionChange);
    
    return () => {
      window.removeEventListener('transactionCreated', handleTransactionChange);
    };
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check if this is a demo user (bypass mode)
      if (user.id === '00000000-0000-0000-0000-000000000000' || 
          session?.access_token === 'demo-bypass-token') {
        
        // Try to load existing demo profile from storage first
        const cachedDemoProfile = await localforage.getItem<UserProfile>(`profile_${user.id}`);
        
        const demoProfile: UserProfile = cachedDemoProfile || {
          id: 'demo-profile-id',
          user_id: user.id,
          full_name: 'Demo',
          email: 'demo@mydigitalid.gov.my',
          phone: '+60123456789',
          avatar_url: null,
          esg_score: 90,
          esg_level: 'Excellent',
          digital_id: 'MY2024202608',
          is_verified: true,
          balance: 260.00,
          total_transactions: 12,
          total_spent: 1850.25,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setProfile(demoProfile);
        
        // Store demo balance for offline validation
        if (isOnline && updateStoredBalance) {
          updateStoredBalance(demoProfile.balance);
        }
        
        console.log('Demo profile loaded:', demoProfile);
        return;
      }

      // Try to load cached profile first for offline support
      if (!isOnline) {
        try {
          const cachedProfile = await localforage.getItem<UserProfile>('userProfile');
          if (cachedProfile) {
            setProfile(cachedProfile);
            console.log("Cached profile loaded for offline mode:", cachedProfile);
            return;
          }
        } catch (error) {
          console.error('Failed to load cached profile:', error);
        }
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

      // Calculate real-time balance from transactions for regular users
      const calculatedBalance = await calculateUserBalance(user.id);
      
      // Combine profile data with ESG metrics and updated balance
      const profileWithEsg = {
        ...profileData,
        esg_score: esgScore,
        esg_level: esgLevel,
        balance: calculatedBalance
      };

      setProfile(profileWithEsg);
      
      // Cache profile data for offline access
      await localforage.setItem('userProfile', profileWithEsg);
      
      // Store balance when online for offline validation
      if (isOnline && updateStoredBalance) {
        updateStoredBalance(calculatedBalance);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Try to load cached profile if online fetch fails
      try {
        const cachedProfile = await localforage.getItem<UserProfile>('userProfile');
        if (cachedProfile) {
          setProfile(cachedProfile);
          console.log("Fallback to cached profile due to fetch error:", cachedProfile);
          return;
        }
      } catch (cacheError) {
        console.error('Failed to load cached profile as fallback:', cacheError);
      }
      
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
        const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() };
        setProfile(updatedProfile);
        
        // Cache updated demo profile with the user ID key for proper retrieval
        await localforage.setItem(`profile_${user.id}`, updatedProfile);
        
        // Also update the offline context balance if balance was changed
        if (updates.balance !== undefined && updateStoredBalance) {
          updateStoredBalance(updates.balance);
        }
        
        toast({
          title: "Success",
          description: "Profile updated successfully.",
        });
        return { data: updatedProfile, error: null };
      }

      // If offline, store updates locally for later sync
      if (!isOnline) {
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
        
        // Cache updated profile
        await localforage.setItem('userProfile', updatedProfile);
        
        // Store pending profile update
        await localforage.setItem('pendingProfileUpdate', updates);
        
        toast({
          title: "Success",
          description: "Profile updated offline. Changes will sync when online.",
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
      
      const updatedProfile = {
        ...data,
        esg_score: profile.esg_score,
        esg_level: profile.esg_level
      };
      
      setProfile(updatedProfile);
      
      // Cache updated profile
      await localforage.setItem('userProfile', updatedProfile);
      
      // Update stored balance if balance was changed
      if (updates.balance !== undefined && updateStoredBalance) {
        updateStoredBalance(updates.balance);
      }
      
      // Clear any pending update since we just synced
      await localforage.removeItem('pendingProfileUpdate');
      
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      
      return { data: updatedProfile, error: null };
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

  // Sync pending profile updates when coming back online
  const syncPendingProfileUpdates = async () => {
    if (!isOnline || !user) return;
    
    try {
      const pendingUpdate = await localforage.getItem<Partial<UserProfile>>('pendingProfileUpdate');
      if (pendingUpdate) {
        const { error } = await supabase
          .from('profiles')
          .update(pendingUpdate)
          .eq('user_id', user.id);
          
        if (!error) {
          await localforage.removeItem('pendingProfileUpdate');
          toast({
            title: "Profile Synced",
            description: "Offline profile changes have been synced.",
          });
        }
      }
    } catch (error) {
      console.error('Failed to sync pending profile updates:', error);
    }
  };

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && user) {
      syncPendingProfileUpdates();
    }
  }, [isOnline, user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
}