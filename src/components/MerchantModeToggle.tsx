import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Store, Plus, RefreshCw, Info } from 'lucide-react';
import { useMerchant } from '@/hooks/useMerchant';
import { useMerchantMode } from '@/contexts/MerchantModeContext';
import { MerchantSignupForm } from './MerchantSignupForm';
import { MerchantDashboard } from './MerchantDashboard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const MerchantModeToggle = () => {
  const { merchantProfile, loading, createMerchantProfile, evaluating } = useMerchant();
  const { isMerchantMode, setMerchantMode } = useMerchantMode();
  const [showSignupForm, setShowSignupForm] = useState(false);

  const handleMerchantModeToggle = (enabled: boolean) => {
    if (enabled && !merchantProfile) {
      setShowSignupForm(true);
    } else {
      setMerchantMode(enabled);
    }
  };

  const handleSignupSuccess = async (data: any) => {
    try {
      await createMerchantProfile(data);
      setMerchantMode(true);
      setShowSignupForm(false);
    } catch (error) {
      // Error handled in the hook
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Merchant Mode
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Enable Merchant Mode to get your business ESG score evaluated and start receiving ESG benefits
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              checked={isMerchantMode}
              onCheckedChange={handleMerchantModeToggle}
              disabled={evaluating}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isMerchantMode ? (
            merchantProfile ? (
              // User has a merchant profile but is in user mode
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You have a merchant profile for <span className="font-medium">{merchantProfile.business_name}</span>. 
                  Switch to merchant mode to access your merchant dashboard.
                </p>
                <Button
                  onClick={() => setMerchantMode(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Store className="h-4 w-4 mr-2" />
                  Switch to Merchant Mode
                </Button>
              </div>
            ) : (
              // User doesn't have a merchant profile
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Sign up as a merchant to get your business ESG impact score and be eligible for ESG benefits.
                </p>
                <Button
                  onClick={() => setShowSignupForm(true)}
                  className="w-full"
                  disabled={evaluating}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {evaluating ? 'Processing...' : 'Sign Up as Merchant'}
                </Button>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Merchant mode is active. Visit the ESG page to manage your business profile and view your ESG impact.
              </p>
              <Badge variant="default" className="w-fit">
                <Store className="h-3 w-3 mr-1" />
                Merchant Mode Active
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSignupForm} onOpenChange={setShowSignupForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sign Up as Merchant</DialogTitle>
            <DialogDescription>
              Provide your business information to get started with ESG evaluation and ESG seller benefits.
            </DialogDescription>
          </DialogHeader>
          <MerchantSignupForm
            onSuccess={handleSignupSuccess}
            onCancel={() => setShowSignupForm(false)}
            loading={evaluating}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
