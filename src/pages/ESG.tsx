import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { ESGDashboard } from "@/components/ESGDashboard";
import { MerchantDashboard } from "@/components/MerchantDashboard";
import { ESGMerchantsMap } from "@/components/ESGMerchantsMap";
import { AIMerchantSearch } from "@/components/AIMerchantSearch";
import { useTransactions } from "@/hooks/useTransactions";
import { useMerchantMode } from "@/contexts/MerchantModeContext";
import { useAIMerchantSearch } from "@/hooks/useAIMerchantSearch";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export default function ESG() {
  const { esgMetrics, loading } = useTransactions();
  const { isMerchantMode } = useMerchantMode();
  const { searchMerchants, clearResults, loading: searchLoading, results } = useAIMerchantSearch();

  // Set default tab based on merchant mode
  const defaultTab = isMerchantMode ? "business-impact" : "my-impact";

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
            <h1 className="text-3xl font-bold tracking-tight">ESG Dashboard</h1>
            <p className="text-muted-foreground">Track your environmental, social and governance impact</p>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-4">
          <div className="w-full overflow-x-auto">
            <TabsList className="inline-flex w-auto min-w-full sm:w-full h-12 bg-muted rounded-lg p-1">
              {isMerchantMode && (
                <TabsTrigger 
                  value="business-impact" 
                  className="flex-1 sm:flex-none min-w-0 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
                >
                  My Business
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="my-impact" 
                className="flex-1 sm:flex-none min-w-0 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                My Impact
              </TabsTrigger>
              <TabsTrigger 
                value="top-merchants" 
                className="flex-1 sm:flex-none min-w-0 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                Top Merchants
              </TabsTrigger>
              <TabsTrigger 
                value="locate-merchants" 
                className="flex-1 sm:flex-none min-w-0 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                Near You
              </TabsTrigger>
            </TabsList>
          </div>

          {isMerchantMode && (
            <TabsContent value="business-impact">
              <Card>
                <CardHeader>
                  <CardTitle>My Business Impact</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage your merchant profile and track your business ESG performance
                  </p>
                </CardHeader>
                <CardContent>
                  <MerchantDashboard />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="my-impact">
            {esgMetrics ? (
              <ESGDashboard metrics={esgMetrics} />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-muted-foreground">
                    <p className="text-lg font-medium mb-2">ESG data not available</p>
                    <p className="text-sm">Complete more transactions to see your ESG impact</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="top-merchants">
            <Card>
              <CardHeader>
                <CardTitle>
                  {results ? `Search Results for "${results.searchQuery}"` : 'Top ESG Merchants in your area'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {results ? 'AI-powered search results ordered by ESG performance' : 'Sustainable businesses near you making a positive impact'}
                </p>
                {results && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearResults}
                    className="mt-2 w-fit"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Show All Merchants
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <AIMerchantSearch 
                    onResults={(searchResults) => {
                      searchMerchants(searchResults.searchQuery);
                    }}
                    loading={searchLoading}
                  />
                  
                  <div className="space-y-4">
                    {(results?.merchants || [
                      { rank: 1, name: "Eco Mart KLCC", location: "KLCC", score: 98, category: "Sustainable Retail" },
                      { rank: 2, name: "GreenTech KL Solutions", location: "Mont Kiara", score: 96, category: "Clean Technology" },
                      { rank: 3, name: "Urban Farm Bangsar", location: "Bangsar", score: 94, category: "Organic Food" },
                      { rank: 4, name: "Solar City Sdn Bhd", location: "Cheras", score: 92, category: "Renewable Energy" },
                      { rank: 5, name: "KL Recycle Hub", location: "Wangsa Maju", score: 90, category: "Waste Management" },
                      { rank: 6, name: "Artisan Craft Pavilion", location: "Bukit Bintang", score: 88, category: "Sustainable Crafts" },
                      { rank: 7, name: "EcoRide KL", location: "Ampang", score: 86, category: "Green Transportation" },
                      { rank: 8, name: "Bamboo Home KL", location: "Kepong", score: 84, category: "Eco-Furniture" },
                      { rank: 9, name: "Clean Energy KL", location: "Sentul", score: 82, category: "Solar Solutions" },
                      { rank: 10, name: "Sustainable Bites", location: "Mid Valley", score: 80, category: "Organic Food" }
                    ]).map((merchant) => (
                      <div key={merchant.rank} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            {merchant.rank}
                          </div>
                          <div>
                            <h3 className="font-semibold">{merchant.name}</h3>
                            <p className="text-sm text-muted-foreground">{merchant.location} • {merchant.category}</p>
                            {merchant.relevance && (
                              <p className="text-xs text-primary mt-1">✨ {merchant.relevance}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-success">{merchant.score}</div>
                          <p className="text-xs text-muted-foreground">ESG Score</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locate-merchants">
            <Card>
              <CardHeader>
                <CardTitle>Merchants Near You</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Find and discover sustainable businesses in your area with high ESG ratings
                </p>
              </CardHeader>
              <CardContent>
                <ESGMerchantsMap />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
