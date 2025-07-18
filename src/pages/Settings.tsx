import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [offlineLimit, setOfflineLimit] = useState<string>("100");

  useEffect(() => {
    // Load saved offline limit from localStorage
    const savedLimit = localStorage.getItem("offlinePaymentLimit");
    if (savedLimit) {
      setOfflineLimit(savedLimit);
    }
  }, []);

  const handleSaveLimit = () => {
    const limit = parseFloat(offlineLimit);
    if (isNaN(limit) || limit < 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than or equal to 0.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("offlinePaymentLimit", offlineLimit);
    toast({
      title: "Settings Saved",
      description: `Offline payment limit set to MYR ${limit.toFixed(2)}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4 max-w-md space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your payment preferences</p>
          </div>
        </div>

        {/* Offline Payment Limit Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Offline Payment Limit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offlineLimit">Maximum offline payment amount (MYR)</Label>
              <Input
                id="offlineLimit"
                type="number"
                value={offlineLimit}
                onChange={(e) => setOfflineLimit(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
              <p className="text-sm text-muted-foreground">
                This limits how much you can spend when offline before requiring connection.
              </p>
            </div>
            
            <Button 
              onClick={handleSaveLimit}
              className="w-full"
            >
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Additional settings can be added here */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              TapirPay v1.0.0 - Sustainable payment solutions for a better tomorrow.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}