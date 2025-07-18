import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PublicMerchantProfile {
  id: string;
  business_name: string;
  business_type: string;
  business_description: string | null;
  esg_score: number | null;
  esg_rating: string | null;
  environmental_score: number | null;
  social_score: number | null;
  governance_score: number | null;
}

export const useMerchantPublic = () => {
  const [loading, setLoading] = useState(false);

  const getMerchantByQR = async (qrData: string): Promise<PublicMerchantProfile | null> => {
    setLoading(true);
    try {
      // Parse QR data to extract merchant ID
      // Assuming QR contains JSON with merchant info
      const qrInfo = JSON.parse(qrData);
      const merchantId = qrInfo.merchant_id;

      if (!merchantId) {
        throw new Error('Invalid QR code: no merchant ID found');
      }

      // Fetch merchant profile (without RLS restrictions for public data)
      const { data, error } = await supabase
        .from('merchant_profiles')
        .select(`
          id,
          business_name,
          business_type,
          business_description,
          esg_score,
          esg_rating,
          environmental_score,
          social_score,
          governance_score
        `)
        .eq('id', merchantId)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching merchant profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getMerchantByQR:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    getMerchantByQR,
    loading
  };
};