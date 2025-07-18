import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Wallet } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function BalanceCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [reloadAmount, setReloadAmount] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();

  const handleReload = async () => {
    if (!user || !reloadAmount) return;
    
    const amount = parseFloat(reloadAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to reload.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const newBalance = (profile?.balance || 0) + amount;
      
      const result = await updateProfile({ balance: newBalance });
      
      if (result.error) throw result.error;

      toast({
        title: "Balance Reloaded",
        description: `Successfully added MYR ${amount.toFixed(2)} to your account`,
      });
      
      setReloadAmount("");
      setDialogOpen(false);
    } catch (error) {
      console.error('Error reloading balance:', error);
      toast({
        title: "Reload Failed",
        description: "Unable to reload balance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const balance = profile?.balance || 0;

  return (
    <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Wallet className="h-6 w-6 text-primary-foreground/80" />
            <div>
              <p className="text-primary-foreground/70 text-sm font-medium">Account Balance</p>
              <p className="text-2xl font-bold text-primary-foreground">
                MYR {balance.toFixed(2)}
              </p>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Reload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reload Balance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Amount (MYR)</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={reloadAmount}
                    onChange={(e) => setReloadAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <Button 
                  onClick={handleReload} 
                  disabled={isLoading || !reloadAmount}
                  className="w-full"
                >
                  {isLoading ? "Processing..." : "Reload Balance"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}