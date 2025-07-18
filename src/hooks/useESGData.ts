import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ESGTag {
  id: string;
  name: string;
  category: 'Environmental' | 'Social' | 'Governance';
  score_weight: number;
  description: string;
}

export interface MerchantESGTag {
  id: string;
  merchant_id: string;
  tag_id: string;
  is_auto_assigned: boolean;
  assigned_at: string;
  esg_tags: ESGTag;
}

export interface UserESGPoints {
  id: string;
  user_id: string;
  environmental_points: number;
  social_points: number;
  governance_points: number;
  total_points: number;
  last_updated: string;
}

export interface ESGTransaction {
  id: string;
  buyer_id: string;
  merchant_id: string;
  transaction_amount: number;
  environmental_points_earned: number;
  social_points_earned: number;
  governance_points_earned: number;
  total_points_earned: number;
  transaction_date: string;
  is_synced: boolean;
}

export const useESGData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userESGPoints, setUserESGPoints] = useState<UserESGPoints | null>(null);
  const [esgTransactions, setESGTransactions] = useState<ESGTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserESGPoints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_esg_points')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user ESG points:', error);
        return;
      }

      if (!data) {
        // Initialize user ESG points if they don't exist
        const { data: newPoints, error: createError } = await supabase
          .from('user_esg_points')
          .insert({
            user_id: user.id,
            environmental_points: 0,
            social_points: 0,
            governance_points: 0,
            total_points: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user ESG points:', createError);
          return;
        }

        setUserESGPoints(newPoints);
      } else {
        setUserESGPoints(data);
      }
    } catch (error) {
      console.error('Error in fetchUserESGPoints:', error);
    }
  };

  const fetchESGTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('esg_transactions')
        .select('*')
        .eq('buyer_id', user.id)
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching ESG transactions:', error);
        return;
      }

      setESGTransactions(data || []);
    } catch (error) {
      console.error('Error in fetchESGTransactions:', error);
    }
  };

  const awardESGPoints = async (
    merchantId: string, 
    transactionAmount: number,
    environmentalPoints: number,
    socialPoints: number,
    governancePoints: number
  ) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const totalPointsEarned = environmentalPoints + socialPoints + governancePoints;

      // Create ESG transaction record
      const { data: transaction, error: transactionError } = await supabase
        .from('esg_transactions')
        .insert({
          buyer_id: user.id,
          merchant_id: merchantId,
          transaction_amount: transactionAmount,
          environmental_points_earned: environmentalPoints,
          social_points_earned: socialPoints,
          governance_points_earned: governancePoints,
          total_points_earned: totalPointsEarned,
          is_synced: true
        })
        .select()
        .single();

      if (transactionError) {
        throw transactionError;
      }

      // Update user's total ESG points
      if (userESGPoints) {
        const updatedPoints = {
          environmental_points: userESGPoints.environmental_points + environmentalPoints,
          social_points: userESGPoints.social_points + socialPoints,
          governance_points: userESGPoints.governance_points + governancePoints,
          total_points: userESGPoints.total_points + totalPointsEarned
        };

        const { error: updateError } = await supabase
          .from('user_esg_points')
          .update(updatedPoints)
          .eq('user_id', user.id);

        if (updateError) {
          throw updateError;
        }

        setUserESGPoints({ ...userESGPoints, ...updatedPoints });
      }

      // Update merchant incentives (increment impact transaction count)
      await supabase.rpc('increment_merchant_impact_transactions', {
        merchant_id: merchantId as any
      });

      // Refresh transactions list
      await fetchESGTransactions();

      toast({
        title: "ESG Impact Recorded!",
        description: `You earned ${totalPointsEarned} ESG points for supporting sustainable business!`,
      });

      return transaction;
    } catch (error: any) {
      console.error('Error awarding ESG points:', error);
      toast({
        title: "Error",
        description: "Failed to record ESG impact",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchUserESGPoints(),
        fetchESGTransactions()
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    userESGPoints,
    esgTransactions,
    loading,
    awardESGPoints,
    refetch: () => {
      fetchUserESGPoints();
      fetchESGTransactions();
    }
  };
};