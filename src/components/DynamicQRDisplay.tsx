
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Clock, RefreshCw, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DynamicQRDisplayProps {
  qrData: any;
  onExpired: () => void;
  onNewQR: () => void;
}

export function DynamicQRDisplay({ qrData, onExpired, onNewQR }: DynamicQRDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const { toast } = useToast();

  // Timer logic
  useEffect(() => {
    if (qrData?.expiresAt) {
      const updateTimer = () => {
        const remaining = Math.max(0, qrData.expiresAt - Date.now());
        setTimeLeft(remaining);
        if (remaining <= 0) onExpired();
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [qrData, onExpired]);

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const copyQRData = () => {
    // qrData should now contain the final QR string from Seller.tsx
    const qrString = typeof qrData === 'string' ? qrData : qrData.qrString || JSON.stringify(qrData);
    navigator.clipboard.writeText(qrString).then(() => {
      toast({
        title: "Copied",
        description: "QR data copied to clipboard",
      });
    });
  };

  const getExpiryColor = () => {
    const minutes = timeLeft / 60000;
    if (minutes > 5) return "text-success";
    if (minutes > 2) return "text-warning";
    return "text-destructive";
  };

  // Extract QR string and payment info
  const qrString = typeof qrData === 'string' ? qrData : qrData.qrString;
  const paymentInfo = typeof qrData === 'object' ? qrData : null;

  return (
    <Card className="shadow-qr">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment QR Code</span>
          {timeLeft > 0 && (
            <Badge variant="outline" className={`flex items-center gap-1 ${getExpiryColor()}`}>
              <Clock className="h-3 w-3" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg">
          {qrString ? (
            <QRCodeSVG value={qrString} size={192} />
          ) : (
            <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
              <p className="text-xs text-muted-foreground text-center">Generating QR...</p>
            </div>
          )}
        </div>

        {/* Payment Info */}
        {paymentInfo && (
          <div className="text-center space-y-2">
            <p className="text-2xl font-bold text-primary">
              MYR {paymentInfo.amount?.toFixed(2) || '0.00'}
            </p>
            <p className="text-muted-foreground">{paymentInfo.description || 'Payment Request'}</p>
          </div>
        )}

        {paymentInfo?.esgTags?.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">ESG Tags:</p>
            <div className="flex flex-wrap gap-1">
              {paymentInfo.esgTags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={copyQRData} className="flex-1">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button onClick={onNewQR} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            New QR
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Show this QR code to customers to receive payment
        </p>
      </CardContent>
    </Card>
  );
}
