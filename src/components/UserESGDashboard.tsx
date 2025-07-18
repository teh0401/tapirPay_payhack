import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useESGData } from '@/hooks/useESGData';
import { Leaf, Users, Shield, TrendingUp, Award } from 'lucide-react';

export const UserESGDashboard = () => {
  const { userESGPoints, esgTransactions, loading } = useESGData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">ESG Impact Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-muted rounded"></div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
              <div className="h-16 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't show ESG dashboard if user has no points or transactions
  if (!userESGPoints || (userESGPoints.total_points === 0 && esgTransactions.length === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4" />
            ESG Impact Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-3">
            <div className="text-muted-foreground">
              <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">No ESG Impact Yet</p>
              <p className="text-xs text-muted-foreground">
                Start supporting ESG-conscious merchants to earn impact points and track your sustainable spending!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentTransactions = esgTransactions.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* ESG Points Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4" />
            Your ESG Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-primary">{userESGPoints.total_points}</div>
            <p className="text-xs text-muted-foreground">Total ESG Points Earned</p>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Leaf className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium">Environmental</span>
              </div>
              <span className="text-lg font-bold text-green-600">{userESGPoints.environmental_points}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-medium">Social</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{userESGPoints.social_points}</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Shield className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-medium">Governance</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{userESGPoints.governance_points}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent ESG Transactions */}
      {recentTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent ESG Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">MYR {transaction.transaction_amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.transaction_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    +{transaction.total_points_earned} ESG points
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};