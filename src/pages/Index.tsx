
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { QrCode, Store, Receipt, Leaf, HandCoins, Gift } from "lucide-react";
import { useMerchantMode } from "@/contexts/MerchantModeContext";
import { useESGData } from "@/hooks/useESGData";

import { BalanceCard } from "@/components/BalanceCard";
import { RewardsModal } from "@/components/RewardsModal";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { isMerchantMode } = useMerchantMode();
  const { userESGPoints } = useESGData();
  
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  
  // Get total impact points from ESG data
  const totalImpactPoints = userESGPoints?.total_points || 0;

  return (
    <div className="container mx-auto p-4 max-w-md space-y-6">
      <div className="text-center py-6">
        <img 
          src="/lovable-uploads/9589f914-fcb3-46fd-ab30-53cdc42a6de6.png" 
          alt="TapirPay Logo" 
          className="w-16 h-16 mx-auto mb-4 rounded-full"
        />
        <h1 className="text-3xl font-bold text-foreground mb-2">TapirPay</h1>
        <p className="text-muted-foreground">No Signal? No Problem. Pay with TapirPay</p>
      </div>

      <BalanceCard />

      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-card transition-shadow" onClick={() => navigate('/scanner')}>
          <CardContent className="text-center p-6">
            <QrCode className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">Scan & Pay</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-card transition-shadow" onClick={() => navigate('/seller')}>
          <CardContent className="text-center p-6">
            {isMerchantMode ? (
              <Store className="h-8 w-8 mx-auto mb-2 text-primary" />
            ) : (
              <HandCoins className="h-8 w-8 mx-auto mb-2 text-primary" />
            )}
            <p className="font-medium">{isMerchantMode ? 'Sell' : 'Receive'}</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-card transition-shadow" onClick={() => navigate('/transactions')}>
          <CardContent className="text-center p-6">
            <Receipt className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">History</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-card transition-shadow" onClick={() => navigate('/esg')}>
          <CardContent className="text-center p-6">
            <Leaf className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-medium">ESG</p>
          </CardContent>
        </Card>
      </div>

      {/* Impact Points Collection Box */}
      <Card className="bg-emerald-900 text-white border-emerald-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Gift className="h-6 w-6 text-emerald-200" />
              <div>
                <p className="text-emerald-100 text-sm">Impact Points Collected</p>
                <p className="text-2xl font-bold text-white">
                  {totalImpactPoints.toLocaleString()}
                </p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-600"
              onClick={() => setShowRewardsModal(true)}
            >
              Redeem
            </Button>
          </div>
        </CardContent>
      </Card>

      <RewardsModal 
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        totalPoints={totalImpactPoints}
      />
    </div>
  );
};

export default Index;
