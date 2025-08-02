import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOffline } from "@/contexts/OfflineContext";
import { Cloud, Clock, RefreshCw, X } from "lucide-react";
import { useState, useEffect } from "react";
import { decryptPayloadWithFalcon } from "@/lib/falcon-encryption";

export function SyncQueue() {
  const { pendingTransactions, syncPendingTransactions, clearPendingTransactions, isOnline } = useOffline();
  const [decryptedTransactions, setDecryptedTransactions] = useState<any[]>([]);

  // Decrypt pending transactions to show correct amounts
  useEffect(() => {
    const decryptTransactions = async () => {
      const decrypted = [];
      for (const encryptedTransaction of pendingTransactions) {
        try {
          const decryptedData = await decryptPayloadWithFalcon(encryptedTransaction);
          decrypted.push(decryptedData);
        } catch (error) {
          console.error('Failed to decrypt transaction for display:', error);
          // Add placeholder with no amount info
          decrypted.push({ description: "Encrypted Payment", amount: 0 });
        }
      }
      setDecryptedTransactions(decrypted);
    };

    if (pendingTransactions.length > 0) {
      decryptTransactions();
    } else {
      setDecryptedTransactions([]);
    }
  }, [pendingTransactions]);

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
          {decryptedTransactions.slice(0, 3).map((transaction, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span className="truncate">
                {transaction.description || transaction.title || "Payment"}
              </span>
              <span className="text-muted-foreground">
                MYR {Math.abs(transaction.amount || 0).toFixed(2)}
              </span>
            </div>
          ))}
          
          {pendingTransactions.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{pendingTransactions.length - 3} more transactions
            </p>
          )}
        </div>

        <div className="flex items-center justify-center text-xs text-muted-foreground">
          {isOnline ? (
            <span className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Auto-syncing...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Cloud className="h-3 w-3" />
              Will sync when online
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}