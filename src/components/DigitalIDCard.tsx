import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, CheckCircle, AlertCircle, Link } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DigitalIDCardProps {
  digitalId: string;
  isVerified: boolean;
  onVerificationUpdate?: (isVerified: boolean, digitalId: string) => void;
}

export function DigitalIDCard({ digitalId, isVerified, onVerificationUpdate }: DigitalIDCardProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const { toast } = useToast();

  const handleLinkDigitalID = async () => {
    setIsLinking(true);
    
    // Simulate linking process
    setTimeout(() => {
      setIsLinking(false);
      setShowLinkDialog(false);
      
      // Generate a proper digital ID number
      const newDigitalId = `MY${new Date().getFullYear()}${Math.floor(Math.random() * 900000 + 100000)}`;
      
      // Call the callback to update the parent component
      if (onVerificationUpdate) {
        onVerificationUpdate(true, newDigitalId);
      }
      
      toast({
        title: "MyDigital ID Linked Successfully!",
        description: "Your digital identity has been verified and linked to your account.",
      });
    }, 2000);
  };

  return (
    <>
      <Card className="bg-gradient-primary text-primary-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              MyDigital ID
            </span>
            <Badge 
              variant={isVerified ? "default" : "destructive"}
              className={isVerified ? "bg-success text-success-foreground" : ""}
            >
              {isVerified ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {isVerified ? "Verified" : "Unverified"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm opacity-90">Digital Identity</p>
              {isVerified ? (
                <p className="font-mono text-lg font-bold">{digitalId}</p>
              ) : (
                <p className="text-sm opacity-75 italic">Not linked</p>
              )}
            </div>
            
            {!isVerified ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowLinkDialog(true)}
                className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Link className="h-4 w-4 mr-2" />
                Link MyDigital ID
              </Button>
            ) : (
              <p className="text-xs opacity-75">
                Linked to Malaysian national identity system
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Link Digital ID Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Link MyDigital ID
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Connect Your Digital Identity</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Link your MyDigital ID to verify your identity and enable enhanced features.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleLinkDigitalID}
                disabled={isLinking}
                className="w-full"
              >
                {isLinking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Linking...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Connect MyDigital ID
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
                disabled={isLinking}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              This is a demo. In the real app, you would be redirected to the official MyDigital ID authentication flow.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}