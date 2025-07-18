
import { DynamicQRDisplay } from "@/components/DynamicQRDisplay";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMerchant } from "@/hooks/useMerchant";
import { useAuth } from "@/contexts/AuthContext";
import { useMerchantMode } from "@/contexts/MerchantModeContext";
import { useState } from "react";
import {
  generateKeys,
  encryptPayload,
  signPayload,
  compressPayload,
  encodeVerifyingKey
} from "@/lib/qr-crypto-utils";
import * as base85 from "@/lib/base85";

export default function Seller() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [qrData, setQrData] = useState<any>(null);
  const { merchantProfile } = useMerchant();
  const { user } = useAuth();
  const { isMerchantMode } = useMerchantMode();

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

        {!qrData ? (
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
          <DynamicQRDisplay
            qrData={qrData}
            onExpired={() => setQrData(null)}
            onNewQR={() => setQrData(null)}
          />
        )}
      </div>
    </div>
  );
}
