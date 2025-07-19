import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Check, 
  TreePine, 
  Coffee, 
  Gift, 
  Banknote,
  Sparkles,
  Heart
} from 'lucide-react';
import { TreeGrowthAnimation } from './TreeGrowthAnimation';

interface RedemptionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  redeemedItem: {
    category: string;
    value: string;
    points: number;
  } | null;
}

const categoryIcons = {
  'Cashback': Banknote,
  'Food & Drinks': Coffee,
  'Eco-Products': Gift,
  'Green Impact': TreePine,
};

const categoryColors = {
  'Cashback': 'text-green-600',
  'Food & Drinks': 'text-orange-600',
  'Eco-Products': 'text-blue-600',
  'Green Impact': 'text-emerald-600',
};

const categoryBgColors = {
  'Cashback': 'bg-green-50',
  'Food & Drinks': 'bg-orange-50',
  'Eco-Products': 'bg-blue-50',
  'Green Impact': 'bg-emerald-50',
};

export const RedemptionConfirmation: React.FC<RedemptionConfirmationProps> = ({
  isOpen,
  onClose,
  redeemedItem
}) => {
  if (!redeemedItem) return null;

  const IconComponent = categoryIcons[redeemedItem.category as keyof typeof categoryIcons] || Gift;
  const iconColor = categoryColors[redeemedItem.category as keyof typeof categoryColors] || 'text-blue-600';
  const bgColor = categoryBgColors[redeemedItem.category as keyof typeof categoryBgColors] || 'bg-blue-50';
  
  // Check if this is the "Plant 1 Tree" redemption
  const isPlantTreeRedemption = redeemedItem.category === 'Green Impact' && redeemedItem.value === 'Plant 1 Tree';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center space-y-6 py-4">
          {/* Success Animation */}
          {isPlantTreeRedemption ? (
            <div className="relative mx-auto w-24 h-24">
              <div className={`${bgColor} rounded-full w-24 h-24 flex items-center justify-center animate-scale-in overflow-hidden`}>
                <TreeGrowthAnimation size="md" autoPlay={true} />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center animate-fade-in">
                <Check className="h-5 w-5 text-white" />
              </div>
            </div>
          ) : (
            <div className="relative mx-auto w-20 h-20">
              <div className={`${bgColor} rounded-full w-20 h-20 flex items-center justify-center animate-scale-in`}>
                <IconComponent className={`h-10 w-10 ${iconColor}`} />
              </div>
              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full w-8 h-8 flex items-center justify-center animate-fade-in">
                <Check className="h-5 w-5 text-white" />
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              Redemption Successful!
            </h2>
            <p className="text-gray-600">
              You've successfully redeemed your impact points
            </p>
          </div>

          {/* Redeemed Item Card */}
          <Card className={`${bgColor} border-none`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm text-gray-600 mb-1">{redeemedItem.category}</p>
                  <p className="font-semibold text-gray-900 text-lg">{redeemedItem.value}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Points Used</p>
                  <p className="font-bold text-gray-900">{redeemedItem.points.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Message */}
          <div className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="h-5 w-5" />
              <span className="font-medium">Thank You for Making an Impact!</span>
            </div>
            <p className="text-sm text-emerald-100">
              {redeemedItem.category === 'Green Impact' && 'Your contribution helps create a more sustainable world.'}
              {redeemedItem.category === 'Eco-Products' && 'Sustainable living starts with conscious choices.'}
              {redeemedItem.category === 'Food & Drinks' && 'Enjoy your reward from our eco-conscious partners.'}
              {redeemedItem.category === 'Cashback' && 'Your sustainable spending has been rewarded.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button 
              onClick={onClose}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
            >
              Continue Making Impact
            </Button>
            <p className="text-xs text-gray-500">
              Keep earning points by supporting ESG-conscious merchants!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};