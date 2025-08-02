
import { DynamicQRDisplay } from "@/components/DynamicQRDisplay";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMerchant } from "@/hooks/useMerchant";
import { useAuth } from "@/contexts/AuthContext";
import { useOffline } from "@/contexts/OfflineContext";
import { useMerchantMode } from "@/contexts/MerchantModeContext";
import { useState } from "react";
import {
  generateKeys,
  encryptPayload,
  signPayload,
  compressPayload,
  encodeVerifyingKey
} from "@/lib/qr-crypto-utils";
import { QRScannerCard } from "@/components/QRScannerCard";
import { TransactionSuccess } from "@/components/TransactionSuccess";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import * as base85 from "@/lib/base85";

export default function Seller() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [qrData, setQrData] = useState<any>(null);
  const [showAckScanner, setShowAckScanner] = useState(false);
  const [showTransactionSuccess, setShowTransactionSuccess] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<any>(null);
  const { merchantProfile } = useMerchant();
  const { user } = useAuth();
  const { isMerchantMode } = useMerchantMode();
  const { addP2PTransaction } = useOffline();
  const { toast } = useToast();

  const generateQR = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const timestamp = Date.now();
    const paymentData = {
      amount: parseFloat(amount),
      timestamp
    };
    
    const rawPayload = {
      user_id: user?.id || null,
      payment_data: paymentData,
      description: description.trim() || "Payment Request",
      merchant: merchantProfile?.business_name || user?.email || "TapirPay Merchant",
      merchant_id: merchantProfile?.id || null,
      expiresAt: timestamp + 10 * 60 * 1000 // 10 minutes
    };

    try {
      // 1. Generate AES & ECDSA keys
      const { aesKey, sk, vk } = generateKeys();
      console.log("Generated keys successfully");

      // 2. Encrypt payload with AES-GCM
      const { cipher, iv } = await encryptPayload(rawPayload, aesKey);
      console.log("Encryption completed - cipher:", cipher.length, "iv:", iv);

      // 3. Sign cipher + iv using ECDSA
      console.log("About to sign payload...");
      const sig = signPayload(cipher, iv, sk);
      console.log("Signature result:", sig);
      
      if (!sig || sig === "") {
        throw new Error("Signature generation failed - empty signature");
      }

      // 4. Encode verification key
      const vk_encoded = encodeVerifyingKey(vk);
      console.log("Verification key encoded:", vk_encoded);

      // 5. Create Payment QR payload
      const paymentQrPayload = {
        type: "PAYMENT",
        user_id: user?.id || null,
        encrypted_data: cipher,
        encryption_key: base85.encode(aesKey),
        signature: sig,
        signature_key: vk_encoded,
        iv
      };

      // 6. Compress for QR
      const compressed = compressPayload(paymentQrPayload);
      console.log("Generated Payment QR payload:", paymentQrPayload);
      console.log("Compressed QR string:", compressed);

      // 7. Create final QR data with both the string and payment info
      const finalQrData = {
        qrString: compressed,
        amount: parseFloat(amount),
        description: description.trim() || "Payment Request",
        merchant: merchantProfile?.business_name || user?.email || "TapirPay Merchant",
        expiresAt: timestamp + 10 * 60 * 1000,
        esgTags: merchantProfile?.esg_rating ? [merchantProfile.esg_rating] : []
      };

      setQrData(finalQrData);
      setAmount("");
      setDescription("");
    } catch (err) {
      console.error("QR generation error:", err);
    }
  };

  const handleAckScanned = async (scannedData: any) => {
    console.log("Acknowledgement QR scanned:", scannedData);
    setShowAckScanner(false);
    
    try {
      // Process the acknowledgment QR using the same logic as Scanner.tsx
      const { decompressPayload, decryptPayload, verifySignature } = await import("@/lib/qr-crypto-utils");
      const base85Module = await import("@/lib/base85");
      
      // Decompress the QR data
      const decompressed = decompressPayload(scannedData);
      console.log("Decompressed ACK payload:", decompressed);
      
      const { type, encrypted_data, encryption_key, signature, signature_key, iv, user_id } = decompressed;
      
      if (type !== "ACK") {
        throw new Error("Invalid QR type - expected ACK");
      }
      
      // Decode encryption key and verify signature
      const keyArray = base85.decode(encryption_key);
      const isValid = verifySignature(encrypted_data, iv, signature, signature_key);
      
      if (!isValid) {
        throw new Error("Signature verification failed");
      }

      // Decrypt the data
      const decrypted = await decryptPayload(encrypted_data, iv, keyArray);
      console.log("Decrypted ACK data:", decrypted);
      
      // Extract payment details
      const buyerId = user_id; // The ACK generator is the buyer
      const sellerId = user?.id; // Current user scanning ACK is the seller
      const amount = Math.abs(decrypted.amount || 0);
      
      if (!buyerId || !sellerId || amount === 0) {
        throw new Error("Invalid transaction data");
      }

      // Create P2P transaction using OfflineContext
      await addP2PTransaction(buyerId, sellerId, amount, {
        title: "QR Payment Transaction",
        description: "Payment via QR Code acknowledgment",
        merchant_name: user?.email || "Merchant",
        location: null,
        tags: ["qr-payment", "acknowledged"],
        esg_score: 0.5
      });
      
      // Create transaction success data for UI
      const transactionData = {
        amount: amount,
        description: `Payment received from customer`,
        merchant: user?.email || "Merchant",
        timestamp: Date.now(),
        transactionId: crypto.randomUUID(),
      };
      
      setCompletedTransaction(transactionData);
      setShowTransactionSuccess(true);
      setQrData(null);
      
      toast({
        title: "Payment Received!",
        description: `Successfully received ${new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(amount)}`,
      });
      
      
    } catch (error) {
      console.error("Failed to process acknowledgment:", error);
      toast({
        title: "Transaction Failed",
        description: "Failed to process payment acknowledgment",
        variant: "destructive"
      });
    }
  };

  const handleNewTransaction = () => {
    setShowTransactionSuccess(false);
    setCompletedTransaction(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4 max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Create Payment QR</h1>
          <p className="text-muted-foreground">
            {isMerchantMode
              ? "Generate a QR code for customers to scan"
              : "Generate a QR code to receive funds"}
          </p>
        </div>

        {showTransactionSuccess && completedTransaction ? (
          <TransactionSuccess
            transactionData={completedTransaction}
            onNewTransaction={handleNewTransaction}
          />
        ) : !qrData ? (
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (MYR)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder={
                    isMerchantMode ? "What are you selling?" : "Note (e.g. reason for payment)"
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={generateQR}
                className="w-full"
                disabled={!amount || parseFloat(amount) <= 0}
              >
                Generate QR Code
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <DynamicQRDisplay
              qrData={qrData}
              onExpired={() => setQrData(null)}
              onNewQR={() => setQrData(null)}
            />
            
            {/* Waiting for Payment Section */}
            <Card className="border-dashed border-2 border-primary">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Waiting for Payment</h3>
                    <p className="text-sm text-muted-foreground">
                      Customer will scan your QR code to complete payment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Next Step Button - More Prominent */}
            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground">
                After customer pays, scan their acknowledgement QR:
              </p>
              <Button
                onClick={() => setShowAckScanner(true)}
                size="lg"
                className="w-full"
              >
                🔍 Scan Acknowledgement QR
              </Button>
            </div>
          </div>
        )}

        <Dialog open={showAckScanner} onOpenChange={setShowAckScanner}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Scan Acknowledgement QR</DialogTitle>
            </DialogHeader>
            <QRScannerCard onQRScanned={handleAckScanned} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
