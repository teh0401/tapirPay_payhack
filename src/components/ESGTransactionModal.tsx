import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useESGData } from '@/hooks/useESGData';
import { Leaf, Users, Shield, Sparkles, CheckCircle } from 'lucide-react';

interface MerchantProfile {
  id: string;
  business_name: string;
  esg_score: number;
  environmental_score: number;
  social_score: number;
  governance_score: number;
}

interface ESGTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: MerchantProfile;
  transactionAmount: number;
  onConfirm: () => void;
}

export const ESGTransactionModal: React.FC<ESGTransactionModalProps> = ({
  isOpen,
  onClose,
  merchant,
  transactionAmount,
  onConfirm
}) => {
  const { awardESGPoints } = useESGData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate ESG points based on merchant scores and transaction amount
  const calculateESGPoints = () => {
    const baseMultiplier = Math.min(transactionAmount / 10, 10); // Cap at 10x multiplier
    const environmentalPoints = Math.round((merchant.environmental_score || 0) * baseMultiplier / 100);
    const socialPoints = Math.round((merchant.social_score || 0) * baseMultiplier / 100);
    const governancePoints = Math.round((merchant.governance_score || 0) * baseMultiplier / 100);
    
    return {
      environmental: Math.max(environmentalPoints, 1), // Minimum 1 point
      social: Math.max(socialPoints, 1),
      governance: Math.max(governancePoints, 1),
      total: Math.max(environmentalPoints + socialPoints + governancePoints, 3)
    };
  };

  const esgPoints = calculateESGPoints();

  const handleConfirmTransaction = async () => {
    setIsProcessing(true);
    try {
      await awardESGPoints(
        merchant.id,
        transactionAmount,
        esgPoints.environmental,
        esgPoints.social,
        esgPoints.governance
      );
      
      setShowSuccess(true);
      setTimeout(() => {
        onConfirm();
        onClose();
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error processing ESG transaction:', error);
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm">
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">ESG Impact Recorded!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You earned {esgPoints.total} ESG points for supporting sustainable business!
            </p>
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-green-500 text-white">
                +{esgPoints.environmental} Environmental
              </Badge>
              <Badge variant="secondary" className="bg-blue-500 text-white">
                +{esgPoints.social} Social
              </Badge>
              <Badge variant="secondary" className="bg-purple-500 text-white">
                +{esgPoints.governance} Governance
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-600" />
            ESG Impact Purchase
          </DialogTitle>
          <DialogDescription>
            You're about to support an ESG-conscious business!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Merchant Info */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium">{merchant.business_name}</h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">ESG Score:</span>
                <Badge variant="secondary">{merchant.esg_score || 0}/100</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">Transaction Amount:</span>
                <span className="text-lg font-bold">MYR {transactionAmount.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <h5 className="text-sm font-medium">ESG Points You'll Earn:</h5>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Leaf className="h-3 w-3 text-green-600" />
                      <span className="text-xs">Environmental</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      +{esgPoints.environmental}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="h-3 w-3 text-blue-600" />
                      <span className="text-xs">Social</span>
                    </div>
                    <Badge variant="outline" className="text-blue-600">
                      +{esgPoints.social}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Shield className="h-3 w-3 text-purple-600" />
                      <span className="text-xs">Governance</span>
                    </div>
                    <Badge variant="outline" className="text-purple-600">
                      +{esgPoints.governance}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-center pt-2 border-t">
                  <span className="text-sm font-medium">Total: </span>
                  <Badge variant="default">+{esgPoints.total} ESG Points</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTransaction}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Confirm Purchase'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};