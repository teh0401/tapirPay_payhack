import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TransactionSuccessProps {
  transactionData: {
    amount: number;
    description: string;
    merchant: string;
    timestamp: number;
    transactionId?: string;
  };
  onNewTransaction: () => void;
}

export function TransactionSuccess({ transactionData, onNewTransaction }: TransactionSuccessProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Payment Received',
          text: `Payment of ${formatCurrency(transactionData.amount)} received from ${transactionData.merchant}`,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payment Received!</h2>
          <p className="text-muted-foreground">Your transaction has been completed successfully</p>
        </div>
      </div>

      {/* Transaction Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Transaction Details
            <Badge variant="secondary">Completed</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount</span>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(transactionData.amount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">From</span>
            <span className="font-medium">{transactionData.merchant}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Description</span>
            <span className="font-medium text-right max-w-48 truncate">
              {transactionData.description}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Date & Time</span>
            <span className="font-medium">{formatDate(transactionData.timestamp)}</span>
          </div>
          
          {transactionData.transactionId && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {transactionData.transactionId.slice(0, 8)}...
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={onNewTransaction}
          className="w-full"
          size="lg"
        >
          Create New Payment QR
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4" />
            Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}