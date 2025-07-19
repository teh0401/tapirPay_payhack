import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/hooks/use-toast";

interface AcknowledgementQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: any;
  onGenerateAck: (paymentData: any) => Promise<string>;
  onShowESGImpact?: (impactData: any) => void;
}

export function AcknowledgementQRModal({
  isOpen,
  onClose,
  paymentData,
  onGenerateAck,
  onShowESGImpact
}: AcknowledgementQRModalProps) {
  const [ackQrData, setAckQrData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrSize, setQrSize] = useState(160);
  const { toast } = useToast();

  useEffect(() => {
    const updateQrSize = () => {
      const maxSize = Math.min(200, window.innerWidth - 140);
      setQrSize(Math.max(120, maxSize));
    };
    
    updateQrSize();
    window.addEventListener('resize', updateQrSize);
    return () => window.removeEventListener('resize', updateQrSize);
  }, []);

  const handleGenerateAck = async () => {
    try {
      setIsGenerating(true);
      const ackQr = await onGenerateAck(paymentData);
      setAckQrData(ackQr);
      
      // Check if this is an ESG merchant and show impact
      const merchantId = paymentData.decrypted_data?.merchant_id;
      const amount = paymentData.decrypted_data?.payment_data?.amount || 0;
      
      if (merchantId && onShowESGImpact) {
        // Trigger ESG impact calculation and display
        onShowESGImpact({
          merchantId,
          amount,
          merchantName: paymentData.decrypted_data?.merchant || "ESG Merchant"
        });
      }
      
      toast({
        title: "Acknowledgement QR Generated",
        description: "Show this QR code to the merchant to complete the transaction"
      });
    } catch (err) {
      console.error("Failed to generate acknowledgement QR:", err);
      toast({
        title: "Error",
        description: "Failed to generate acknowledgement QR",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    setAckQrData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>Payment Confirmation</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">
                    MYR {paymentData.decrypted_data?.payment_data?.amount?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span className="text-sm">
                    {paymentData.decrypted_data?.payment_data?.timestamp ? 
                      new Date(paymentData.decrypted_data.payment_data.timestamp).toLocaleString() : 
                      "Unknown"
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Merchant:</span>
                  <span className="text-sm">
                    {paymentData.decrypted_data?.merchant || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="text-sm">
                    {paymentData.decrypted_data?.description || "No description"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!ackQrData ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Confirm the payment details above and generate an acknowledgement QR code.
              </p>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleClose} 
                  variant="outline" 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateAck} 
                  className="flex-1"
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "Confirm & Generate QR"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-center">Acknowledgement QR</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center p-3">
                  <div className="bg-white p-2 sm:p-4 rounded-lg">
                    <QRCodeSVG 
                      value={ackQrData} 
                      size={qrSize}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <p className="text-sm text-muted-foreground text-center">
                Show this QR code to the merchant to complete the transaction.
              </p>
              
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}