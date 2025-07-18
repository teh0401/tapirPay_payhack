import { useOffline } from "@/contexts/OfflineContext";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Clock } from "lucide-react";

export function SyncStatusIndicator() {
  const { isOnline, pendingTransactions, toggleOfflineMode } = useOffline();

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <Badge 
        variant={isOnline ? "default" : "destructive"} 
        className="flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
        onClick={toggleOfflineMode}
      >
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {isOnline ? "Online" : "Offline"}
      </Badge>
      
      {pendingTransactions.length > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {pendingTransactions.length} pending
        </Badge>
      )}
    </div>
  );
}