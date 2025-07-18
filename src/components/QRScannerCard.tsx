import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import QrScanner from "qr-scanner";

interface QRScannerCardProps {
  onQRScanned: (data: any) => void;
}

export function QRScannerCard({ onQRScanned }: QRScannerCardProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      if (videoRef.current && !qrScannerRef.current) {
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => {
            console.log("QR Scanned raw data:", result.data);
            try {
              // First try to parse as JSON (legacy format)
              const data = JSON.parse(result.data);
              console.log("QR parsed as JSON:", data);
              onQRScanned(data);
              stopScanning();
            } catch {
              // If not JSON, treat as compressed base64 data from our new format
              console.log("QR treating as compressed data:", result.data);
              onQRScanned(result.data);
              stopScanning();
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );
      }

      await qrScannerRef.current?.start();
    } catch (err) {
      setError("Failed to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    qrScannerRef.current?.stop();
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      qrScannerRef.current?.destroy();
    };
  }, []);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          QR Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <video
            ref={videoRef}
            className={`w-full aspect-square rounded-lg bg-muted ${
              isScanning ? 'block' : 'hidden'
            }`}
            playsInline
          />
          
          {!isScanning && (
            <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center">
                <CameraOff className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Camera preview will appear here</p>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="outline" className="flex-1">
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Point your camera at a TapirPay QR code to scan
        </p>
      </CardContent>
    </Card>
  );
}