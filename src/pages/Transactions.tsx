import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { CashFlowChart } from "@/components/CashFlowChart";
import { ESGDashboard } from "@/components/ESGDashboard";
import { SyncQueue } from "@/components/SyncQueue";
import { useTransactions } from "@/hooks/useTransactions";
import { useProfile } from "@/hooks/useProfile";
import { useOffline } from "@/contexts/OfflineContext";
import { useESGData } from "@/hooks/useESGData";
import { ArrowUpRight, ArrowDownRight, Filter, Download, Plus, Shield } from "lucide-react";
import { format } from "date-fns";

export default function Transactions() {
  const { transactions, esgMetrics, loading, cashFlowData } = useTransactions();
  const { profile } = useProfile();
  const { pendingTransactions } = useOffline();
  const { esgTransactions } = useESGData();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.transaction_type === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getAmountColor = (type: string, amount: number) => {
    if (type === 'income') return 'text-success';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto p-4 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">Track your finances</p>
          </div>
        </div>

        {/* Pending Sync Queue */}
        {pendingTransactions.length > 0 && (
          <SyncQueue />
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <CashFlowChart data={cashFlowData} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {/* Transaction Summary */}
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Transaction Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{profile.total_transactions}</p>
                      <p className="text-xs text-muted-foreground">Total Transactions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">MYR {profile.balance?.toFixed(2) || '0.00'}</p>
                      <p className="text-xs text-muted-foreground">Current Balance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'income' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('income')}
              >
                Income
              </Button>
              <Button
                variant={filter === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('expense')}
              >
                Expenses
              </Button>
              <Button variant="outline" size="sm" className="ml-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {transaction.transaction_type === 'income' ? (
                            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                              <ArrowUpRight className="h-5 w-5 text-success" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                              <ArrowDownRight className="h-5 w-5 text-destructive" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{transaction.title}</h3>
                            {transaction.category?.icon && (
                              <span className="text-sm">{transaction.category.icon}</span>
                            )}
                            <Badge variant={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                          {transaction.merchant_name && (
                            <p className="text-sm text-muted-foreground mb-1">
                              {transaction.transaction_type === 'income' ? 'From: ' : 'To: '}
                              {transaction.merchant_name}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.created_at), 'dd/MM/yyyy, h:mm a')}
                          </p>
                          {transaction.tags && transaction.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {transaction.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${getAmountColor(transaction.transaction_type, transaction.amount)}`}>
                          {transaction.transaction_type === 'income' ? '+' : '-'}{transaction.currency} {Math.abs(transaction.amount).toFixed(2)}
                        </div>
                        {transaction.esg_score > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ESG Score: {(transaction.esg_score * 100).toFixed(0)}%
                          </div>
                        )}
                        {transaction.esg_score > 0 && (
                          <div className="text-xs text-success mt-1 font-medium">
                            +{Math.floor(transaction.esg_score * Math.abs(transaction.amount))} impact points
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTransactions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium mb-2">No transactions found</p>
                    <p className="text-sm">Try adjusting your filters or add a new transaction</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
