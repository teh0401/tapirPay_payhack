import React, { createContext, useContext, useEffect, useState } from 'react';
import localforage from 'localforage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getFalconKeyPair, 
  encryptPayloadWithFalcon, 
  decryptPayloadWithFalcon, 
  verifyFalconPayload 
} from '@/lib/falcon-encryption';

interface OfflineContextType {
  isOnline: boolean;
  pendingTransactions: any[];
  syncPendingTransactions: () => Promise<void>;
  addPendingTransaction: (transaction: any) => Promise<void>;
  clearPendingTransactions: () => Promise<void>;
  toggleOfflineMode: () => void;
  addTransaction: (transaction: any) => Promise<void>;
  addP2PTransaction: (buyerId: string, sellerId: string, amount: number, transactionDetails?: any) => Promise<void>;
  availableBalance: number | null;
  offlinePaymentLimit: number;
  updateStoredBalance: (balance: number) => void;
  canAffordPayment: (amount: number) => boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [manualOffline, setManualOffline] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [offlinePaymentLimit] = useState<number>(100.00); // MYR 100 default limit
  const { toast } = useToast();
  const { user } = useAuth();

  // Combine actual network status with manual override
  const effectiveOnlineStatus = navigator.onLine && !manualOffline;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online - multiple attempts for reliability
      const attemptSync = () => {
        if (navigator.onLine && pendingTransactions.length > 0) {
          console.log('Auto-syncing pending transactions...');
          syncPendingTransactions();
        }
      };

      // Immediate attempt
      attemptSync();
      // Backup attempt in case first fails
      setTimeout(attemptSync, 500);
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending transactions and stored balance on mount
    loadPendingTransactions();
    loadStoredBalance();

    // Periodic auto-sync check when online (every 2 seconds to prevent spam)
    const syncInterval = setInterval(() => {
      if (navigator.onLine && !manualOffline && pendingTransactions.length > 0) {
        console.log('Periodic auto-sync check...');
        syncPendingTransactions();
      }
    }, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, [manualOffline, pendingTransactions.length]);

  const loadStoredBalance = async () => {
    try {
      const storedBalance = await localforage.getItem<number>('userBalance');
      if (storedBalance !== null) {
        setAvailableBalance(storedBalance);
      }
    } catch (error) {
      console.error('Failed to load stored balance:', error);
    }
  };

  const updateStoredBalance = (balance: number) => {
    setAvailableBalance(balance);
    localforage.setItem('userBalance', balance).catch(error => {
      console.error('Failed to store balance:', error);
    });
  };

  const canAffordPayment = (amount: number) => {
    if (availableBalance === null) {
      // If balance not available, allow payments up to offline limit
      return amount <= offlinePaymentLimit;
    }
    
    // Check both available balance and offline payment limit
    return amount <= availableBalance && amount <= offlinePaymentLimit;
  };

  const toggleOfflineMode = () => {
    setManualOffline(!manualOffline);
  };

  const loadPendingTransactions = async () => {
    try {
      const pending = await localforage.getItem<any[]>('pendingTransactions') || [];
      setPendingTransactions(pending);
    } catch (error) {
      console.error('Failed to load pending transactions:', error);
    }
  };

  const addPendingTransaction = async (transaction: any) => {
    try {
      // Get Falcon key pair
      const keyPair = await getFalconKeyPair();
      
      // Encrypt the transaction payload with Falcon
      const encryptedTransaction = await encryptPayloadWithFalcon(
        { ...transaction, timestamp: Date.now() }, 
        keyPair
      );
      
      const updated = [...pendingTransactions, encryptedTransaction];
      await localforage.setItem('pendingTransactions', updated);
      setPendingTransactions(updated);
      
      toast({
        title: "Transaction Saved",
        description: "Transaction encrypted and saved offline with Falcon.",
      });
    } catch (error) {
      console.error('Failed to save pending transaction:', error);
      toast({
        title: "Error",
        description: "Failed to encrypt and save transaction offline.",
        variant: "destructive",
      });
    }
  };

  // New function to handle transactions - auto-sync if online, queue if offline
  const addTransaction = async (transaction: any) => {
    if (effectiveOnlineStatus) {
      // If online, sync immediately
      try {
        const { id, ...transactionData } = transaction;
        
        // Generate a proper UUID for the transaction if needed
        const transactionId = id && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) 
          ? id 
          : undefined; // Let Supabase generate a new UUID
        
        // Ensure required fields are present and clean up QR-specific fields
        const formattedTransaction = {
          user_id: transactionData.user_id || transactionData.buyer_id || user?.id,
          created_at: transactionData.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          title: transactionData.title || 'Transaction',
          amount: transactionData.amount || 0,
          transaction_type: transactionData.transaction_type || 'expense',
          currency: transactionData.currency || 'MYR',
          status: transactionData.status || 'completed',
          description: transactionData.description || null,
          merchant_name: transactionData.merchant_name || null,
          location: transactionData.location || null,
          tags: transactionData.tags || [],
          esg_score: transactionData.esg_score || 0,
          ...(transactionId && { id: transactionId }),
        };
        
        // Remove any fields that shouldn't be in the transactions table
        const { 
          buyer_id: removeBuyerId, 
          seller_id: removeSellerId, 
          type: removeType,
          encrypted_data: removeEncryptedData,
          encryption_key: removeEncryptionKey,
          signature: removeSignature,
          signature_key: removeSignatureKey,
          iv: removeIv,
          decrypted_data: removeDecryptedData,
          nonce: removeNonce,
          signedAt: removeSignedAt,
          expiresAt: removeExpiresAt,
          ...cleanTransaction 
        } = {...transactionData, ...formattedTransaction};
        
        console.log("About to insert transaction for real user:", {
          userId: user?.id,
          cleanTransaction
        });
        
        const { error } = await supabase
          .from('transactions')
          .insert([cleanTransaction]);
          
          if (error) {
            console.error('Error syncing transaction immediately:', error);
            // If immediate sync fails, add to pending queue
            await addPendingTransaction(transaction);
          } else {
            console.log("Transaction successfully inserted to database:", cleanTransaction.id);
            
            // Force immediate refresh of transaction and profile data
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('transactionCreated'));
            }, 100);
            
            toast({
              title: "Transaction Synced",
              description: "Transaction saved and synced to server.",
            });
          }
      } catch (error) {
        console.error('Failed to sync transaction immediately:', error);
        // If immediate sync fails, add to pending queue
        await addPendingTransaction(transaction);
      }
    } else {
      // If offline, add to pending queue
      await addPendingTransaction(transaction);
    }
  };

  // New function to handle P2P transactions (buyer and seller)
  const addP2PTransaction = async (buyerId: string, sellerId: string, amount: number, transactionDetails?: any) => {
    if (effectiveOnlineStatus) {
      // If online, use the database function to create both transactions
      try {
        const { data, error } = await supabase.rpc('create_p2p_transaction', {
          buyer_id: buyerId,
          seller_id: sellerId,
          amount: Math.abs(amount),
          title: transactionDetails?.title || 'P2P Transaction',
          description: transactionDetails?.description || null,
          merchant_name: transactionDetails?.merchant_name || null,
          location: transactionDetails?.location || null,
          tags: transactionDetails?.tags || null,
          esg_score: transactionDetails?.esg_score || 0
        });

        if (error) {
          console.error('Error creating P2P transaction:', error);
          throw error;
        }

          // Force immediate refresh with delay to ensure DB consistency
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('transactionCreated'));
          }, 100);
         
         toast({
           title: "Transaction Complete",
           description: "P2P transaction processed successfully.",
         });
      } catch (error) {
        console.error('Failed to process P2P transaction:', error);
        
        // If immediate processing fails, create individual transactions for pending queue
        const buyerTransaction = {
          id: `tx_buyer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: buyerId,
          title: transactionDetails?.title || 'P2P Payment',
          description: transactionDetails?.description || 'Payment to seller',
          amount: -Math.abs(amount),
          currency: 'MYR',
          transaction_type: 'expense',
          status: 'completed',
          merchant_name: transactionDetails?.merchant_name || null,
          location: transactionDetails?.location || null,
          tags: transactionDetails?.tags || ['p2p'],
          esg_score: transactionDetails?.esg_score || 0,
          created_at: new Date().toISOString(),
          seller_id: sellerId // Store for later P2P processing
        };

        const sellerTransaction = {
          id: `tx_seller_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: sellerId,
          title: transactionDetails?.title || 'P2P Receipt',
          description: transactionDetails?.description || 'Payment from buyer',
          amount: Math.abs(amount),
          currency: 'MYR',
          transaction_type: 'income',
          status: 'completed',
          merchant_name: transactionDetails?.merchant_name || null,
          location: transactionDetails?.location || null,
          tags: transactionDetails?.tags || ['p2p'],
          esg_score: transactionDetails?.esg_score || 0,
          created_at: new Date().toISOString(),
          buyer_id: buyerId // Store for later P2P processing
        };

        await addPendingTransaction(buyerTransaction);
        await addPendingTransaction(sellerTransaction);
      }
    } else {
      // If offline, create individual transactions for pending queue
      const buyerTransaction = {
        id: `tx_buyer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: buyerId,
        title: transactionDetails?.title || 'P2P Payment',
        description: transactionDetails?.description || 'Payment to seller',
        amount: -Math.abs(amount),
        currency: 'MYR',
        transaction_type: 'expense',
        status: 'completed',
        merchant_name: transactionDetails?.merchant_name || null,
        location: transactionDetails?.location || null,
        tags: transactionDetails?.tags || ['p2p'],
        esg_score: transactionDetails?.esg_score || 0,
        created_at: new Date().toISOString(),
        seller_id: sellerId
      };

      const sellerTransaction = {
        id: `tx_seller_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: sellerId,
        title: transactionDetails?.title || 'P2P Receipt',
        description: transactionDetails?.description || 'Payment from buyer',
        amount: Math.abs(amount),
        currency: 'MYR',
        transaction_type: 'income',
        status: 'completed',
        merchant_name: transactionDetails?.merchant_name || null,
        location: transactionDetails?.location || null,
        tags: transactionDetails?.tags || ['p2p'],
        esg_score: transactionDetails?.esg_score || 0,
        created_at: new Date().toISOString(),
        buyer_id: buyerId
      };

      await addPendingTransaction(buyerTransaction);
      await addPendingTransaction(sellerTransaction);
    }
  };

  const clearPendingTransactions = async () => {
    try {
      await localforage.setItem('pendingTransactions', []);
      setPendingTransactions([]);
      
      toast({
        title: "Transactions Cleared",
        description: "All pending transactions have been cancelled.",
      });
    } catch (error) {
      console.error('Failed to clear pending transactions:', error);
      toast({
        title: "Error",
        description: "Failed to clear pending transactions.",
        variant: "destructive",
      });
    }
  };

  const syncPendingTransactions = async () => {
    if (!effectiveOnlineStatus || pendingTransactions.length === 0) return;

    try {
      console.log('Syncing encrypted transactions to Supabase:', pendingTransactions);
      
      const failedTransactions: any[] = [];
      
      // Sync each encrypted transaction to Supabase
      for (const encryptedTransaction of pendingTransactions) {
        try {
          // Decrypt and verify the transaction using Falcon
          const transaction = await decryptPayloadWithFalcon(encryptedTransaction);
          console.log('Decrypted transaction:', transaction);
          
          // Verify payload integrity
          const isValid = await verifyFalconPayload(encryptedTransaction);
          if (!isValid) {
            console.error('Falcon verification failed for transaction');
            failedTransactions.push(encryptedTransaction);
            continue;
          }
          
          const { timestamp, id, ...transactionData } = transaction;
          
          // Generate a proper UUID for the transaction if needed
          const transactionId = id && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) 
            ? id 
            : undefined; // Let Supabase generate a new UUID
          
          // Ensure required fields are present and clean up QR-specific fields
          const formattedTransaction = {
            user_id: transactionData.user_id || transactionData.buyer_id || user?.id,
            created_at: transactionData.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            title: transactionData.title || 'Offline Transaction',
            amount: transactionData.amount || 0,
            transaction_type: transactionData.transaction_type || 'expense',
            currency: transactionData.currency || 'MYR',
            status: transactionData.status || 'completed',
            description: transactionData.description || null,
            merchant_name: transactionData.merchant_name || null,
            location: transactionData.location || null,
            tags: transactionData.tags || [],
            esg_score: transactionData.esg_score || 0,
            ...(transactionId && { id: transactionId }), // Only include id if it's a valid UUID
          };
          
          // Remove any fields that shouldn't be in the transactions table
          const { 
            buyer_id: removeBuyerId, 
            seller_id: removeSellerId, 
            type: removeType,
            encrypted_data: removeEncryptedData,
            encryption_key: removeEncryptionKey,
            signature: removeSignature,
            signature_key: removeSignatureKey,
            iv: removeIv,
            decrypted_data: removeDecryptedData,
            nonce: removeNonce,
            signedAt: removeSignedAt,
            expiresAt: removeExpiresAt,
            ...cleanTransaction 
          } = {...transactionData, ...formattedTransaction};
          
          console.log('Syncing verified transaction:', cleanTransaction);
          
          const { error } = await supabase
            .from('transactions')
            .insert([cleanTransaction]);
            
          if (error) {
            console.error('Error syncing transaction:', error);
            failedTransactions.push(encryptedTransaction);
          } else {
            console.log('Falcon-encrypted transaction synced successfully');
          }
        } catch (decryptError) {
          console.error('Failed to decrypt transaction:', decryptError);
          failedTransactions.push(encryptedTransaction);
        }
      }

      // Remove successfully synced transactions, keep failed ones
      const remainingTransactions = failedTransactions;
      await localforage.setItem('pendingTransactions', remainingTransactions);
      setPendingTransactions(remainingTransactions);

      if (failedTransactions.length === 0) {
         // Force immediate refresh with delay to ensure DB consistency
         setTimeout(() => {
           window.dispatchEvent(new CustomEvent('transactionCreated'));
         }, 200);
         
         toast({
           title: "Sync Complete",
           description: `${pendingTransactions.length} Falcon-encrypted transactions verified and synced.`,
         });
      } else {
        toast({
          title: "Partial Sync",
          description: `${pendingTransactions.length - failedTransactions.length} synced, ${failedTransactions.length} failed verification.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to sync transactions:', error);
      toast({
        title: "Sync Failed",
        description: "Some transactions could not be decrypted or synced.",
        variant: "destructive",
      });
    }
  };

  return (
    <OfflineContext.Provider value={{
      isOnline: effectiveOnlineStatus,
      pendingTransactions,
      syncPendingTransactions,
      addPendingTransaction,
      clearPendingTransactions,
      toggleOfflineMode,
      addTransaction,
      addP2PTransaction,
      availableBalance,
      offlinePaymentLimit,
      updateStoredBalance,
      canAffordPayment,
    }}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}