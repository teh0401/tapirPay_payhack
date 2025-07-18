import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";
import klMapOverlay from "@/assets/kl-map-overlay.jpg";

const mockMerchants = [
  {
    id: 1,
    name: "Eco Mart KLCC",
    esgScore: 98,
    rating: "A+",
    category: "Sustainable Retail",
    position: { top: "30%", left: "45%" }, // KLCC area
    color: "bg-green-600"
  },
  {
    id: 2,
    name: "GreenTech KL",
    esgScore: 92,
    rating: "A+",
    category: "Clean Technology",
    position: { top: "25%", left: "40%" }, // Mont Kiara
    color: "bg-green-600"
  },
  {
    id: 3,
    name: "Urban Farm Bangsar",
    esgScore: 88,
    rating: "A",
    category: "Organic Food",
    position: { top: "45%", left: "35%" }, // Bangsar
    color: "bg-green-400"
  },
  {
    id: 4,
    name: "Solar City Sdn Bhd",
    esgScore: 85,
    rating: "A",
    category: "Renewable Energy",
    position: { top: "60%", left: "55%" }, // Cheras
    color: "bg-green-400"
  },
  {
    id: 5,
    name: "KL Recycle Hub",
    esgScore: 88,
    rating: "A",
    category: "Waste Management",
    position: { top: "20%", left: "50%" }, // Wangsa Maju
    color: "bg-green-400"
  },
  {
    id: 6,
    name: "Artisan Craft Pavilion",
    esgScore: 71,
    rating: "B+",
    category: "Sustainable Crafts",
    position: { top: "38%", left: "42%" }, // Bukit Bintang
    color: "bg-yellow-600"
  },
  {
    id: 7,
    name: "EcoRide KL",
    esgScore: 75,
    rating: "B+",
    category: "Green Transportation",
    position: { top: "35%", left: "60%" }, // Ampang
    color: "bg-yellow-600"
  },
  {
    id: 8,
    name: "Bamboo Home KL",
    esgScore: 63,
    rating: "B",
    category: "Eco-Furniture",
    position: { top: "15%", left: "35%" }, // Kepong
    color: "bg-yellow-400"
  }
];

export const ESGMerchantsMap = () => {
  const [selectedMerchant, setSelectedMerchant] = useState<number | null>(null);

  const handleMerchantClick = (merchantId: number) => {
    setSelectedMerchant(selectedMerchant === merchantId ? null : merchantId);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Map Container */}
        <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-muted-foreground/20 h-[600px] overflow-hidden">
          {/* Realistic Map Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-80 rounded-lg"
            style={{ backgroundImage: `url(${klMapOverlay})` }}
          />
          
          {/* Subtle overlay to maintain readability */}
          <div className="absolute inset-0 bg-white/20 rounded-lg" />

          {/* Map Title */}
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Find ESG Merchants
            </h3>
            <p className="text-sm text-muted-foreground">Sustainable businesses near you</p>
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h4 className="font-medium text-sm mb-2">ESG Rating</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span className="text-xs">A+ (90-100)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-xs">A (80-89)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                <span className="text-xs">B+ (70-79)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-xs">B (60-69)</span>
              </div>
            </div>
          </div>

          {/* Central KL Landmark */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-primary/20 rounded-full w-16 h-16 flex items-center justify-center">
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <Star className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-xs font-medium text-center mt-1">Your Location</p>
          </div>

          {/* Merchant Markers */}
          {mockMerchants.map((merchant) => (
            <div
              key={merchant.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer ${
                selectedMerchant === merchant.id ? 'z-50' : 'z-10'
              }`}
              style={{ top: merchant.position.top, left: merchant.position.left }}
              onClick={() => handleMerchantClick(merchant.id)}
            >
              {/* Marker */}
              <div className={`w-4 h-4 rounded-full ${merchant.color} border-2 border-white shadow-lg relative z-10 hover:scale-110 transition-transform`}>
                <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-30"></div>
              </div>

              {/* Tooltip */}
              {selectedMerchant === merchant.id && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="bg-background border shadow-lg rounded-lg p-3 min-w-[200px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{merchant.name}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{merchant.category}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {merchant.rating}
                          </Badge>
                          <span className="text-xs font-medium">{merchant.esgScore} ESG Score</span>
                        </div>
                      </div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="border-4 border-transparent border-t-background"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Map Controls */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
            <div className="flex flex-col gap-1">
              <button className="w-8 h-8 bg-background hover:bg-muted rounded border text-xs font-bold">+</button>
              <button className="w-8 h-8 bg-background hover:bg-muted rounded border text-xs font-bold">-</button>
            </div>
          </div>

          {/* Stats */}
          <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">{mockMerchants.length}</div>
              <div className="text-xs text-muted-foreground">ESG Merchants</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            🌱 Organic Food
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            ⚡ Clean Energy
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            ♻️ Waste Management
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            🚗 Green Transport
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            🏠 Sustainable Living
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
