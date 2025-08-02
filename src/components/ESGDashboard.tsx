
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Users, Shield, TrendingUp, Gift } from "lucide-react";
import { useESGData } from "@/hooks/useESGData";

import { RewardsModal } from "@/components/RewardsModal";
import { VisualImpactSummary } from "@/components/VisualImpactSummary";
import { useState } from "react";

interface ESGMetrics {
  environmental_score: number;
  social_score: number;
  governance_score: number;
  overall_score: number;
  carbon_footprint: number;
  sustainable_spending: number;
  total_spending: number;
}

interface ESGDashboardProps {
  metrics: ESGMetrics;
}

export function ESGDashboard({ metrics }: ESGDashboardProps) {
  const { userESGPoints } = useESGData();
  
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const sustainablePercentage = (metrics.sustainable_spending / metrics.total_spending) * 100;
  
  // Get total impact points from ESG data
  const totalImpactPoints = userESGPoints?.total_points || 1000;
  
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-success";
    if (score >= 0.6) return "text-warning";
    return "text-destructive";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 0.8) return "Excellent";
    if (score >= 0.6) return "Good";
    if (score >= 0.4) return "Fair";
    return "Needs Improvement";
  };

  const getScoreVariant = (score: number) => {
    if (score >= 0.8) return "default";
    if (score >= 0.6) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall ESG Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.overall_score)}`}>
              {(metrics.overall_score * 100).toFixed(0)}%
            </div>
            <Badge variant={getScoreVariant(metrics.overall_score)} className="mt-1">
              {getScoreBadge(metrics.overall_score)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Footprint</CardTitle>
            <Leaf className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.carbon_footprint.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              kg CO₂ this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sustainable Spending</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {sustainablePercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              MYR {metrics.sustainable_spending.toFixed(2)} of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact Rating</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              A-
            </div>
            <p className="text-xs text-muted-foreground">
              Top 15% in Malaysia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Impact Points</CardTitle>
            <Gift className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {totalImpactPoints.toLocaleString()}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => setShowRewardsModal(true)}
            >
              Redeem
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environmental</CardTitle>
            <Leaf className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {(metrics.environmental_score * 100).toFixed(0)}%
              </span>
              <Badge variant={getScoreVariant(metrics.environmental_score)}>
                {getScoreBadge(metrics.environmental_score)}
              </Badge>
            </div>
            <Progress value={metrics.environmental_score * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Renewable energy, sustainable products, carbon footprint
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {(metrics.social_score * 100).toFixed(0)}%
              </span>
              <Badge variant={getScoreVariant(metrics.social_score)}>
                {getScoreBadge(metrics.social_score)}
              </Badge>
            </div>
            <Progress value={metrics.social_score * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Local businesses, fair trade, community impact
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Governance</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {(metrics.governance_score * 100).toFixed(0)}%
              </span>
              <Badge variant={getScoreVariant(metrics.governance_score)}>
                {getScoreBadge(metrics.governance_score)}
              </Badge>
            </div>
            <Progress value={metrics.governance_score * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Ethical practices, transparency, accountability
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ESG Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span className="text-sm">
                Your renewable energy purchases reduced CO₂ emissions by 15kg this month
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm">
                Supporting 8 local businesses contributes to community economic growth
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span className="text-sm">
                Consider increasing fair-trade purchases to improve your social score
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-chart-1 rounded-full"></div>
              <span className="text-sm font-bold">
                You earned 124 impact points this week from sustainable transactions
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visual Impact Summary */}
      <VisualImpactSummary />

      <RewardsModal 
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        totalPoints={totalImpactPoints}
      />
    </div>
  );
}
