import { useOffline } from "@/contexts/OfflineContext";
import { WifiOff, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const { isOnline } = useOffline();
  const [showBanner, setShowBanner] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setHasBeenOffline(true);
      // Hide banner after 5 seconds
      const timer = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(timer);
    } else if (hasBeenOffline) {
      // Hide banner after 5 seconds when coming back online
      const timer = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  if (!showBanner) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-glow to-accent text-primary-foreground shadow-elegant">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-repeat animate-pulse" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}
          />
        </div>
        
        <div className="relative px-4 py-3">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <WifiOff className="h-5 w-5 animate-bounce" />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-yellow-400 rounded-full animate-ping" />
              </div>
              <span className="font-semibold text-sm md:text-base">
                {!isOnline ? "OFFLINE MODE" : "BACK ONLINE"}
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-1 text-xs opacity-90">
              <Zap className="h-3 w-3 animate-pulse" />
              <span>TapirPay keeps you connected</span>
            </div>
          </div>
          
          {!isOnline && (
            <div className="text-center mt-1">
              <p className="text-xs opacity-90 animate-fade-in">
                No signal? No problem! Continue making secure payments offline.
              </p>
            </div>
          )}
        </div>

        {/* Animated border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-primary-glow animate-pulse" />
      </div>
    </div>
  );
}