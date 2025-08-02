import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ESGScoreBadge } from "@/components/ESGScoreBadge";
import { useOffline } from "@/contexts/OfflineContext";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Store, Tag } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface TransactionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: any;
  onPaymentApproved?: (transactionData: any) => void;
}

export function TransactionReviewModal({ 
  isOpen, 
  onClose, 
  transactionData,
  onPaymentApproved
}: TransactionReviewModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addPendingTransaction, addTransaction } = useOffline();
  const { toast } = useToast();
  const { user } = useAuth();

  if (!transactionData) return null;

  // Extract the actual amount from the nested payment data
  const paymentAmount = transactionData.decrypted_data?.payment_data?.amount || 0;

  const handleApprovePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Mock Falcon signing process
      const signedTransaction = {
        ...transactionData,
        user_id: user?.id || transactionData.buyer_id,
        title: transactionData.title || 'QR Payment',
        amount: -(Math.abs(paymentAmount)), // Negative for expense
        transaction_type: 'expense',
        merchant_name: transactionData.decrypted_data?.merchant || transactionData.merchant_name,
        location: transactionData.location,
        tags: transactionData.esgTags || [],
        esg_score: transactionData.esgScore || 0,
        signature: "falcon_signature_" + Date.now(), // Mock signature
        nonce: Math.random().toString(36).substring(7),
        signedAt: Date.now(),
        status: "completed", // Set to completed instead of pending
        description: transactionData.decrypted_data?.description || transactionData.description || "QR Payment",
      };

      // Use addTransaction which handles online/offline properly
      await addTransaction(signedTransaction);
      
      toast({
        title: "Payment Approved",
        description: "Transaction signed and saved offline.",
        duration: 3000,
      });

      // Trigger acknowledgment modal instead of just closing
      if (onPaymentApproved) {
        onPaymentApproved(signedTransaction);
      } else {
        onClose();
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateESGImpact = (tags: string[]) => {
    // Mock ESG scoring based on tags
    const scores = { organic: 15, local: 10, reusable: 12, sustainable: 18 };
    return tags.reduce((total, tag) => total + (scores[tag as keyof typeof scores] || 5), 0);
  };

  const esgImpact = transactionData.esgTags ? 
    calculateESGImpact(transactionData.esgTags) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Confirm Payment
          </DialogTitle>
          <DialogDescription>
            Review the payment details before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Details */}
          <Card>
            <CardContent className="pt-4">
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-primary">
                  MYR {paymentAmount?.toFixed(2) || "0.00"}
                </p>
                <p className="text-muted-foreground">
                  {transactionData.description || "Payment"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <div className="p-2 bg-background rounded-lg">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-sm">
                {transactionData.sellerName || "Merchant"}
              </p>
              <p className="text-xs text-muted-foreground">
                ID: {transactionData.sellerId?.slice(0, 8) || "Unknown"}...
              </p>
            </div>
          </div>

          {/* ESG Tags */}
          {transactionData.esgTags && transactionData.esgTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">ESG Impact</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {transactionData.esgTags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <ESGScoreBadge score={esgImpact} size="small" />
            </div>
          )}

          {/* Expiry Warning */}
          {transactionData.expiresAt && (
            <div className="text-xs text-muted-foreground bg-warning/10 p-2 rounded">
              QR expires at: {new Date(transactionData.expiresAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleApprovePayment} 
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? "Processing..." : "Approve Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}