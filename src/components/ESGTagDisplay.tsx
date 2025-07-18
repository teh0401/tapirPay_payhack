import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Leaf, Users, Shield, Tag } from 'lucide-react';

interface ESGTag {
  id: string;
  name: string;
  category: string;
  score_weight: number;
  description: string;
}

interface MerchantESGTag {
  id: string;
  merchant_id: string;
  tag_id: string;
  is_auto_assigned: boolean;
  assigned_at: string;
  esg_tags: ESGTag;
}

interface ESGTagDisplayProps {
  merchantId: string;
}

export const ESGTagDisplay: React.FC<ESGTagDisplayProps> = ({ merchantId }) => {
  const [merchantTags, setMerchantTags] = useState<MerchantESGTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchantTags();
  }, [merchantId]);

  const fetchMerchantTags = async () => {
    try {
      const { data, error } = await supabase
        .from('merchant_esg_tags')
        .select(`
          *,
          esg_tags (*)
        `)
        .eq('merchant_id', merchantId);

      if (error) {
        console.error('Error fetching merchant ESG tags:', error);
        return;
      }

      setMerchantTags(data as MerchantESGTag[] || []);
    } catch (error) {
      console.error('Error in fetchMerchantTags:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Environmental':
        return <Leaf className="h-3 w-3" />;
      case 'Social':
        return <Users className="h-3 w-3" />;
      case 'Governance':
        return <Shield className="h-3 w-3" />;
      default:
        return <Tag className="h-3 w-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Environmental':
        return 'bg-green-500';
      case 'Social':
        return 'bg-blue-500';
      case 'Governance':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ESG Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-muted rounded w-20"></div>
            <div className="h-6 bg-muted rounded w-24"></div>
            <div className="h-6 bg-muted rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (merchantTags.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ESG Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No ESG tags assigned yet. Complete your profile for AI evaluation.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Tag className="h-4 w-4" />
          ESG Impact Tags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {merchantTags.map((merchantTag) => (
            <Badge
              key={merchantTag.id}
              variant="secondary"
              className={`${getCategoryColor(merchantTag.esg_tags.category)} text-white text-xs flex items-center gap-1`}
            >
              {getCategoryIcon(merchantTag.esg_tags.category)}
              {merchantTag.esg_tags.name}
            </Badge>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          <p>These tags were automatically assigned based on your business profile and help buyers identify your ESG impact.</p>
        </div>
      </CardContent>
    </Card>
  );
};