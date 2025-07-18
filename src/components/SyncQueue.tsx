import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOffline } from "@/contexts/OfflineContext";
import { Cloud, Clock, RefreshCw, X } from "lucide-react";

export function SyncQueue() {
  const { pendingTransactions, syncPendingTransactions, clearPendingTransactions, isOnline } = useOffline();

  return (
    <Card className="border-warning/50 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warning" />
            Pending Sync
          </span>
          <Badge variant="secondary">
            {pendingTransactions.length} transaction{pendingTransactions.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {pendingTransactions.slice(0, 3).map((transaction, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="truncate">
                {transaction.description || "Payment"}
              </span>
              <span className="text-muted-foreground">
                MYR {transaction.amount?.toFixed(2) || "0.00"}
              </span>
            </div>
          ))}
          
          {pendingTransactions.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{pendingTransactions.length - 3} more transactions
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={syncPendingTransactions}
            disabled={!isOnline}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            {isOnline ? "Sync Now" : "Offline"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearPendingTransactions}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
          
          {!isOnline && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Cloud className="h-3 w-3 mr-1" />
              Will sync when online
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}