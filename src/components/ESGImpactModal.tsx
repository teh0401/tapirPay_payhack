import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Users, Shield, Sparkles } from "lucide-react";

interface ESGImpactData {
  environmental_points: number;
  social_points: number;
  governance_points: number;
  total_points: number;
  merchant_name: string;
  merchant_tags?: string[];
  impact_description: string;
}

interface ESGImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  impactData: ESGImpactData;
}

export function ESGImpactModal({ isOpen, onClose, impactData }: ESGImpactModalProps) {
  const impactItems = [
    {
      icon: Leaf,
      label: "Environmental Impact",
      points: impactData.environmental_points,
      color: "bg-green-500",
      description: "Supporting eco-friendly practices"
    },
    {
      icon: Users,
      label: "Social Impact",
      points: impactData.social_points,
      color: "bg-blue-500",
      description: "Contributing to social welfare"
    },
    {
      icon: Shield,
      label: "Governance Impact",
      points: impactData.governance_points,
      color: "bg-purple-500",
      description: "Promoting ethical business practices"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            ESG Impact Earned!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Merchant Info */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-4 text-center">
              <h3 className="font-semibold text-lg">{impactData.merchant_name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {impactData.impact_description}
              </p>
              {impactData.merchant_tags && (
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {impactData.merchant_tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Points */}
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              +{impactData.total_points}
            </div>
            <div className="text-sm text-muted-foreground">Total ESG Points</div>
          </div>

          {/* Impact Breakdown */}
          <div className="space-y-3">
            {impactItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`p-2 rounded-full ${item.color}`}>
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">+{item.points}</div>
                  <div className="text-xs text-muted-foreground">points</div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}