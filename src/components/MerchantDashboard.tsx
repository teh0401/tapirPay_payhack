import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RefreshCw, 
  Edit, 
  ExternalLink, 
  TrendingUp, 
  Leaf, 
  Users, 
  Shield,
  Info,
  AlertCircle
} from 'lucide-react';
import { useMerchant } from '@/hooks/useMerchant';
import { MerchantSignupForm } from './MerchantSignupForm';
import { ESGTagDisplay } from './ESGTagDisplay';
import { ESGAppealModal } from './ESGAppealModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const MerchantDashboard = () => {
  const { merchantProfile, evaluating, updateMerchantProfile, requestReEvaluation } = useMerchant();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);

  if (!merchantProfile) {
    return null;
  }

  const getESGRatingColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'high':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getESGIcon = (score: number) => {
    if (score >= 70) return <Leaf className="h-4 w-4" />;
    if (score >= 40) return <Users className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const handleEditSuccess = async (data: any) => {
    try {
      await updateMerchantProfile(data);
      setShowEditForm(false);
    } catch (error) {
      // Error handled in the hook
    }
  };

  const hasOnlinePresence = merchantProfile.website_url || 
                           merchantProfile.instagram_url || 
                           merchantProfile.facebook_url || 
                           merchantProfile.linkedin_url;

  return (
    <>
      <div className="space-y-4">
        {/* Business Info */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{merchantProfile.business_name}</h3>
            <p className="text-sm text-muted-foreground">{merchantProfile.business_type}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditForm(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        {/* ESG Score */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              ESG Impact Score
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs space-y-1">
                      <p className="font-medium">ESG Score Explanation:</p>
                      <p className="text-xs">Environmental, Social, and Governance impact based on your online presence and business practices.</p>
                      <p className="text-xs">• Environmental: Sustainability practices</p>
                      <p className="text-xs">• Social: Community impact</p>
                      <p className="text-xs">• Governance: Ethical business practices</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getESGIcon(merchantProfile.esg_score || 0)}
                <span className="text-2xl font-bold">{merchantProfile.esg_score || 0}/100</span>
              </div>
              <Badge 
                variant="secondary" 
                className={`${getESGRatingColor(merchantProfile.esg_rating || 'Pending')} text-white`}
              >
                {merchantProfile.esg_rating || 'Pending'} Impact
              </Badge>
            </div>
            
            {/* ESG Score Breakdown */}
            {(merchantProfile.environmental_score || merchantProfile.social_score || merchantProfile.governance_score) && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Leaf className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium">Environmental</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{merchantProfile.environmental_score || 0}</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-3 w-3 text-blue-600" />
                    <span className="text-xs font-medium">Social</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{merchantProfile.social_score || 0}</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Shield className="h-3 w-3 text-purple-600" />
                    <span className="text-xs font-medium">Governance</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{merchantProfile.governance_score || 0}</span>
                </div>
              </div>
            )}
            
            {merchantProfile.esg_reason && (
              <p className="text-sm text-muted-foreground italic">
                "{merchantProfile.esg_reason}"
              </p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={requestReEvaluation}
                disabled={evaluating}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${evaluating ? 'animate-spin' : ''}`} />
                {evaluating ? 'Re-evaluating...' : 'Re-evaluate'}
              </Button>
              
              <Button
                onClick={() => setShowAppealModal(true)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Appeal Score
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ESG Tags */}
        <ESGTagDisplay merchantId={merchantProfile.id} />

        {/* Online Presence */}
        {hasOnlinePresence && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Online Presence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {merchantProfile.website_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Website</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(merchantProfile.website_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {merchantProfile.instagram_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Instagram</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(merchantProfile.instagram_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {merchantProfile.facebook_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Facebook</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(merchantProfile.facebook_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {merchantProfile.linkedin_url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">LinkedIn</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(merchantProfile.linkedin_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {!hasOnlinePresence && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Add your online presence to improve ESG evaluation accuracy
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditForm(true)}
                className="mt-2"
              >
                Add Online Links
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Merchant Profile</DialogTitle>
            <DialogDescription>
              Update your business information and online presence.
            </DialogDescription>
          </DialogHeader>
          <MerchantSignupForm
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditForm(false)}
            loading={evaluating}
          />
        </DialogContent>
      </Dialog>

      <ESGAppealModal
        isOpen={showAppealModal}
        onClose={() => setShowAppealModal(false)}
        merchantId={merchantProfile.id}
      />
    </>
  );
};