
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Banknote, 
  Coffee, 
  Gift, 
  TreePine, 
  Sparkles,
  ArrowRight,
  Zap
} from 'lucide-react';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalPoints: number;
}

const rewardCategories = [
  {
    icon: Banknote,
    title: 'Cashback',
    description: 'Convert points to MYR credits',
    options: [
      { points: 100, value: 'MYR 5.00', available: true },
      { points: 500, value: 'MYR 30.00', available: true },
      { points: 1000, value: 'MYR 65.00', available: false }
    ],
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    icon: Coffee,
    title: 'Food & Drinks',
    description: 'Redeem at partner restaurants',
    options: [
      { points: 150, value: 'Free Coffee', available: true },
      { points: 300, value: 'Lunch Voucher', available: true },
      { points: 600, value: 'Dinner for 2', available: false }
    ],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    icon: Gift,
    title: 'Eco-Products',
    description: 'Sustainable lifestyle items',
    options: [
      { points: 200, value: 'Bamboo Tumbler', available: true },
      { points: 400, value: 'Solar Power Bank', available: true },
      { points: 800, value: 'Eco-Friendly Kit', available: false }
    ],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    icon: TreePine,
    title: 'Green Impact',
    description: 'Environmental initiatives',
    options: [
      { points: 50, value: 'Plant 1 Tree', available: true },
      { points: 250, value: 'Coral Restoration', available: true },
      { points: 500, value: 'Solar Panel Fund', available: false }
    ],
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50'
  }
];

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  totalPoints
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            Redeem Your Impact Points
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Points Balance */}
          <Card className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm">Available Points</p>
                  <p className="text-2xl font-bold">
                    {totalPoints.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/20 rounded-full p-3">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Categories */}
          <div className="grid gap-4">
            {rewardCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.title} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`${category.bgColor} p-4`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-white rounded-lg p-2">
                          <IconComponent className={`h-5 w-5 ${category.color}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{category.title}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      {category.options.map((option, index) => (
                        <div 
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            option.available && totalPoints >= option.points
                              ? 'border-green-200 bg-green-50' 
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant={option.available && totalPoints >= option.points ? "default" : "secondary"}
                              className="min-w-[80px] justify-center"
                            >
                              {option.points} pts
                            </Badge>
                            <span className="font-medium text-gray-900">{option.value}</span>
                          </div>
                          
                          <Button
                            size="sm"
                            variant={option.available && totalPoints >= option.points ? "default" : "outline"}
                            disabled={!option.available || totalPoints < option.points}
                            className="flex items-center gap-1"
                          >
                            {option.available && totalPoints >= option.points ? (
                              <>
                                Redeem
                                <ArrowRight className="h-3 w-3" />
                              </>
                            ) : (
                              totalPoints < option.points ? 'Need More Points' : 'Coming Soon'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              Earn more points by supporting ESG-conscious merchants!
            </p>
            <Button variant="outline" onClick={onClose}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
