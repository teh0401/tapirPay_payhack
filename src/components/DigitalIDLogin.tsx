import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Fingerprint } from "lucide-react";

interface DigitalIDLoginProps {
  onLogin: () => void;
}

export function DigitalIDLogin({ onLogin }: DigitalIDLoginProps) {
  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-4">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">MyDigital ID</span>
          </div>
          
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Fingerprint className="h-8 w-8 text-primary-foreground" />
          </div>
          
          <p className="text-sm text-muted-foreground">
            Quick and secure login with Malaysia's digital identity
          </p>
        </div>
        
        <Button 
          onClick={onLogin} 
          className="w-full bg-primary hover:bg-primary/90"
          size="lg"
        >
          <Shield className="h-4 w-4 mr-2" />
          Login with MyDigital ID
        </Button>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Secure • Fast • Government-backed
          </p>
        </div>
      </CardContent>
    </Card>
  );
}