import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation } from "@/components/Navigation";
import { ESGDashboard } from "@/components/ESGDashboard";
import { MerchantDashboard } from "@/components/MerchantDashboard";
import { ESGMerchantsMap } from "@/components/ESGMerchantsMap";
import { useTransactions } from "@/hooks/useTransactions";
import { useMerchantMode } from "@/contexts/MerchantModeContext";

export default function ESG() {
  const { esgMetrics, loading } = useTransactions();
  const { isMerchantMode } = useMerchantMode();

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
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 text-xs md:text-sm">
            {isMerchantMode && <TabsTrigger value="business-impact" className="px-1 md:px-3">My Business</TabsTrigger>}
            <TabsTrigger value="my-impact" className="px-1 md:px-3">My Impact</TabsTrigger>
            <TabsTrigger value="top-merchants" className="px-1 md:px-3">Top Merchants</TabsTrigger>
            <TabsTrigger value="locate-merchants" className="px-1 md:px-3">Near You</TabsTrigger>
          </TabsList>

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
                <CardTitle>Top ESG Merchants in your area</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Sustainable businesses near you making a positive impact
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
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
                  ].map((merchant) => (
                    <div key={merchant.rank} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                          {merchant.rank}
                        </div>
                        <div>
                          <h3 className="font-semibold">{merchant.name}</h3>
                          <p className="text-sm text-muted-foreground">{merchant.location} • {merchant.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-success">{merchant.score}</div>
                        <p className="text-xs text-muted-foreground">ESG Score</p>
                      </div>
                    </div>
                  ))}
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
