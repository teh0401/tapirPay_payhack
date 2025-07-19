import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ESGScoreBadge } from "@/components/ESGScoreBadge";
import { DigitalIDCard } from "@/components/DigitalIDCard";
import { Navigation } from "@/components/Navigation";
import { InstallPrompt } from "@/components/InstallPrompt";
import { MerchantModeToggle } from "@/components/MerchantModeToggle";
import { UserESGDashboard } from "@/components/UserESGDashboard";
import { User, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useMerchantMode } from "@/contexts/MerchantModeContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { format } from "date-fns";

export default function Profile() {
  const { signOut, user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { isMerchantMode } = useMerchantMode();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      console.log('Starting sign out process...', { user, hasSession: !!user });
      const { error } = await signOut();
      console.log('Sign out result:', { error });
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to sign out. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log('Sign out successful, navigating to auth...');
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully.",
        });
        navigate("/auth");
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleVerificationUpdate = async (isVerified: boolean, digitalId: string) => {
    if (profile) {
      await updateProfile({
        is_verified: isVerified,
        digital_id: digitalId
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-4 max-w-md space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-4 max-w-md">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <p className="text-lg font-medium mb-2">Profile not found</p>
                <p className="text-sm">Unable to load your profile information</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4 max-w-md space-y-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your TapirPay account and ESG rewards
          </p>
        </div>

        {/* Install Prompt */}
        <InstallPrompt />

        {/* User Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4 mb-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>{getInitials(profile.full_name || 'User')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                <p className="text-muted-foreground text-sm">{profile.email}</p>
                {profile.phone && (
                  <p className="text-muted-foreground text-sm">{profile.phone}</p>
                )}
              </div>
            </div>
            
            <ESGScoreBadge score={profile.esg_score} size="large" />
            <div className="mt-2">
              <Badge variant={profile.esg_level === 'Excellent' ? 'default' : 'secondary'}>
                Environmental Impact Level: {profile.esg_level}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Digital ID Card */}
        <DigitalIDCard 
          digitalId={profile.digital_id || 'Not Available'} 
          isVerified={profile.is_verified || false} 
          onVerificationUpdate={handleVerificationUpdate}
        />

        {/* Merchant Mode Toggle */}
        <MerchantModeToggle />

        {/* User Rewards Section - Only show in normal user mode */}
        {!isMerchantMode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                ESG Rewards & Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Earn points by shopping at ESG-certified merchants
                </p>
                <Badge variant="secondary" className="text-xs">
                  Sustainable Shopping Rewards Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Member Since */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Member since {format(new Date(profile.created_at), 'dd/MM/yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>


        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => navigate("/settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </div>
  );
}