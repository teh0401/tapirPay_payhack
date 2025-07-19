import { QRScannerCard } from "@/components/QRScannerCard";
import { TransactionReviewModal } from "@/components/TransactionReviewModal";
import { ESGTransactionModal } from "@/components/ESGTransactionModal";
import { ESGImpactModal } from "@/components/ESGImpactModal";
import { AcknowledgementQRModal } from "@/components/AcknowledgementQRModal";
import { Navigation } from "@/components/Navigation";
import { useMerchantPublic } from "@/hooks/useMerchantPublic";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOffline } from "@/contexts/OfflineContext";
import { supabase } from "@/integrations/supabase/client";
import {
  decompressPayload,
  decryptPayload,
  verifySignature,
  extractPayload,
  classifyQrPayload,
  generateKeys,
  encryptPayload,
  signPayload,
  compressPayload,
  encodeVerifyingKey
} from "@/lib/qr-crypto-utils";
import * as base85 from "@/lib/base85";
import { 
  getFalconKeyPair, 
  encryptPayloadWithFalcon 
} from "@/lib/falcon-encryption";

export default function Scanner() {
  const [scannedData, setScannedData] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showESGModal, setShowESGModal] = useState(false);
  const [showAckModal, setShowAckModal] = useState(false);
  const [showESGImpactModal, setShowESGImpactModal] = useState(false);
  const [merchantProfile, setMerchantProfile] = useState<any>(null);
  const [esgImpactData, setEsgImpactData] = useState<any>(null);
  const { getMerchantByQR } = useMerchantPublic();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addP2PTransaction, canAffordPayment, availableBalance, offlinePaymentLimit } = useOffline();

  const handleQRScanned = async (data: any) => {
    console.log("QR Scanned:", data);

    try {
      // Decompress the QR data
      const decompressed = decompressPayload(data);
      console.log("Decompressed payload:", decompressed);
      
      const { type, encrypted_data, encryption_key, signature, signature_key, iv, user_id } = decompressed;
      
      // Decode encryption key and verify signature
      const keyArray = base85.decode(encryption_key);
      const isValid = verifySignature(encrypted_data, iv, signature, signature_key);
      console.log("Signature verification result:", isValid);
      if (!isValid) {
        console.error("Signature verification failed");
        throw new Error("Signature verification failed");
      }

      // Decrypt the data
      const decrypted = await decryptPayload(encrypted_data, iv, keyArray);
      console.log("Decrypted data:", decrypted);

      if (type === "PAYMENT") {
        // Validate payment amount against balance and limits
        const paymentAmount = Math.abs(decrypted.payment_data?.amount || 0);
        
        if (!canAffordPayment(paymentAmount)) {
          let errorMessage = "Payment cannot be processed. ";
          
          if (availableBalance !== null && paymentAmount > availableBalance) {
            errorMessage += `Insufficient balance. Available: MYR ${availableBalance.toFixed(2)}`;
          } else if (paymentAmount > offlinePaymentLimit) {
            errorMessage += `Payment exceeds offline limit of MYR ${offlinePaymentLimit.toFixed(2)}`;
          } else {
            errorMessage += `Payment amount: MYR ${paymentAmount.toFixed(2)}`;
          }
          
          if (availableBalance !== null) {
            errorMessage += `. Available balance: MYR ${availableBalance.toFixed(2)}`;
          }
          errorMessage += `. Offline payment limit: MYR ${offlinePaymentLimit.toFixed(2)}`;
            
          toast({
            title: "Payment Failed",
            description: errorMessage,
            variant: "destructive"
          });
          return;
        }
        
        // Handle Payment QR
        const paymentData = {
          ...decompressed,
          decrypted_data: decrypted,
          type: "PAYMENT"
        };
        
        // Store encrypted copy in local storage using Falcon
        try {
          const keyPair = await getFalconKeyPair();
          const encryptedPayload = await encryptPayloadWithFalcon(paymentData, keyPair);
          const storageKey = `payment_${Date.now()}`;
          localStorage.setItem(storageKey, JSON.stringify(encryptedPayload));
          console.log("Payment data encrypted with Falcon and stored:", storageKey);
        } catch (falconError) {
          console.error("Failed to encrypt payment data with Falcon:", falconError);
        }
        
        setScannedData(paymentData);
        setShowAckModal(true);
        
      } else if (type === "ACK") {
        // Handle Acknowledgement QR - Transaction Complete
        const ackData = {
          ...decompressed,
          decrypted_data: decrypted,
          type: "ACK"
        };
        
        // Get the buyer/seller IDs correctly
        const buyerId = decompressed.user_id; // The ACK generator is the buyer
        const sellerId = user?.id; // Current user scanning ACK is the seller
        const amount = Math.abs(decrypted.amount || 0);
        
        if (!buyerId || !sellerId) {
          toast({
            title: "Transaction Error",
            description: "Unable to identify buyer or seller",
            variant: "destructive"
          });
          return;
        }
        
        // Create P2P transaction (buyer pays seller)
        await addP2PTransaction(buyerId, sellerId, amount, {
          title: "QR Payment Transaction",
          description: "Payment via QR Code",
          merchant_name: decrypted.merchant || "Unknown Merchant",
          location: decrypted.location || null,
          tags: ["qr-payment"],
          esg_score: 0.5 // Default ESG score
        });
        
        // Store encrypted ACK copy in local storage for records using Falcon
        try {
          const keyPair = await getFalconKeyPair();
          const encryptedAckPayload = await encryptPayloadWithFalcon(ackData, keyPair);
          const storageKey = `ack_${Date.now()}`;
          localStorage.setItem(storageKey, JSON.stringify(encryptedAckPayload));
          console.log("ACK data encrypted with Falcon and stored:", storageKey);
        } catch (falconError) {
          console.error("Failed to encrypt ACK data with Falcon:", falconError);
        }
      }
      
    } catch (err) {
      console.error("Invalid QR payload:", err);
      toast({
        title: "Invalid QR Code",
        description: "Failed to process QR code",
        variant: "destructive"
      });
    }
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setScannedData(null);
  };

  const handleESGTransactionConfirm = () => {
    setShowESGModal(false);
    setMerchantProfile(null);
    setScannedData(null);
  };

  const handleShowESGImpact = async (impactData: any) => {
    try {
      // Fetch merchant ESG data from Supabase
      const { data: merchantData, error } = await supabase
        .from('merchant_profiles')
        .select(`
          business_name,
          environmental_score,
          social_score,
          governance_score,
          esg_rating,
          merchant_esg_tags (
            esg_tags (
              name,
              category
            )
          )
        `)
        .eq('id', impactData.merchantId)
        .eq('is_active', true)
        .single();

      if (error || !merchantData) {
        console.error('Failed to fetch merchant ESG data:', error);
        return;
      }

      // Calculate ESG points based on merchant scores and transaction amount
      const baseMultiplier = 0.1; // Base points per MYR
      const amount = impactData.amount;
      
      const environmentalPoints = Math.round((merchantData.environmental_score || 0) * baseMultiplier * amount);
      const socialPoints = Math.round((merchantData.social_score || 0) * baseMultiplier * amount);
      const governancePoints = Math.round((merchantData.governance_score || 0) * baseMultiplier * amount);
      const totalPoints = environmentalPoints + socialPoints + governancePoints;

      // Extract merchant tags
      const merchantTags = merchantData.merchant_esg_tags?.map((tag: any) => tag.esg_tags.name) || [];

      const esgImpact = {
        environmental_points: environmentalPoints,
        social_points: socialPoints,
        governance_points: governancePoints,
        total_points: totalPoints,
        merchant_name: merchantData.business_name,
        merchant_tags: merchantTags,
        impact_description: `Supporting ${merchantData.esg_rating || 'sustainable'} business practices`
      };

      setEsgImpactData(esgImpact);
      setShowESGImpactModal(true);
    } catch (error) {
      console.error('Error calculating ESG impact:', error);
    }
  };

  const handleGenerateAcknowledgement = async (paymentData: any) => {
    try {
      const timestamp = Date.now();
      const ackPayload = {
        amount: paymentData.decrypted_data.payment_data.amount,
        timestamp: paymentData.decrypted_data.payment_data.timestamp
      };

      // Generate new keys for acknowledgement
      const { aesKey, sk, vk } = generateKeys();
      
      // Encrypt the acknowledgement data
      const { cipher, iv } = await encryptPayload(ackPayload, aesKey);
      
      // Sign the encrypted data
      const sig = signPayload(cipher, iv, sk);
      
      // Create acknowledgement QR payload
      const ackQrPayload = {
        type: "ACK",
        status: "ACK",
        user_id: user?.id || null,
        encrypted_data: cipher,
        encryption_key: base85.encode(aesKey),
        signature: sig,
        signature_key: encodeVerifyingKey(vk),
        iv
      };
      
      // Store encrypted copy in local storage using Falcon
      try {
        const keyPair = await getFalconKeyPair();
        const encryptedAckPayload = await encryptPayloadWithFalcon(ackQrPayload, keyPair);
        const storageKey = `ack_generated_${timestamp}`;
        localStorage.setItem(storageKey, JSON.stringify(encryptedAckPayload));
        console.log("Generated ACK encrypted with Falcon and stored:", storageKey);
      } catch (falconError) {
        console.error("Failed to encrypt generated ACK with Falcon:", falconError);
      }
      
      // Compress for QR display
      const compressed = compressPayload(ackQrPayload);
      
      return compressed;
    } catch (err) {
      console.error("Error generating acknowledgement QR:", err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto p-4 max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Scan to Pay</h1>
          <p className="text-muted-foreground">
            Point your camera at a QR code to make a payment
          </p>
        </div>

        <QRScannerCard onQRScanned={handleQRScanned} />

        <TransactionReviewModal
          isOpen={showReviewModal}
          onClose={handleCloseModal}
          transactionData={scannedData}
        />

        {showESGModal && merchantProfile && scannedData && (
          <ESGTransactionModal
            isOpen={showESGModal}
            onClose={() => {
              setShowESGModal(false);
              setMerchantProfile(null);
              setScannedData(null);
            }}
            merchant={merchantProfile}
            transactionAmount={scannedData.amount || 0}
            onConfirm={handleESGTransactionConfirm}
          />
        )}

        {showAckModal && scannedData && (
          <AcknowledgementQRModal
            isOpen={showAckModal}
            onClose={() => {
              setShowAckModal(false);
              setScannedData(null);
            }}
            paymentData={scannedData}
            onGenerateAck={handleGenerateAcknowledgement}
            onShowESGImpact={handleShowESGImpact}
          />
        )}

        {showESGImpactModal && esgImpactData && (
          <ESGImpactModal
            isOpen={showESGImpactModal}
            onClose={() => {
              setShowESGImpactModal(false);
              setEsgImpactData(null);
            }}
            impactData={esgImpactData}
          />
        )}
      </div>
    </div>
  );
}