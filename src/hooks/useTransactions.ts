import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { useOffline } from '@/contexts/OfflineContext';
import localforage from 'localforage';
import { getFalconKeyPair, decryptPayloadWithFalcon } from '@/lib/falcon-encryption';

export interface Transaction {
  id: string;
  title: string;
  description?: string;
  amount: number;
  currency: string;
  transaction_type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'failed';
  merchant_name?: string;
  location?: string;
  tags?: string[];
  esg_score: number;
  created_at: string;
  category?: {
    name: string;
    icon: string;
    color: string;
    esg_impact: number;
  };
}

export interface ESGMetrics {
  environmental_score: number;
  social_score: number;
  governance_score: number;
  overall_score: number;
  carbon_footprint: number;
  sustainable_spending: number;
  total_spending: number;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [esgMetrics, setEsgMetrics] = useState<ESGMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { isOnline, pendingTransactions } = useOffline();

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchESGMetrics();
    } else {
      setTransactions([]);
      setEsgMetrics(null);
      setLoading(false);
    }
  }, [user]);

  // Refetch when online status changes
  useEffect(() => {
    if (user && isOnline) {
      fetchTransactions();
    }
  }, [isOnline]);

  // Listen for transaction changes to refresh data (with debouncing)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleTransactionChange = () => {
      if (user) {
        // Debounce the refresh to prevent multiple rapid calls
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          fetchTransactions();
          fetchESGMetrics();
        }, 100);
      }
    };

    window.addEventListener('transactionCreated', handleTransactionChange);
    
    return () => {
      window.removeEventListener('transactionCreated', handleTransactionChange);
      clearTimeout(timeout);
    };
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      // Check if this is a demo user (bypass mode)
      if (user.id === '00000000-0000-0000-0000-000000000000' || 
          session?.access_token === 'demo-bypass-token') {
        // Return mock transactions for demo user
        const mockTransactions: Transaction[] = [
          {
            id: 'demo-1',
            title: 'Sustainable Food Purchase',
            description: 'Local organic vegetables',
            amount: -85.50,
            currency: 'MYR',
            transaction_type: 'expense',
            status: 'completed',
            merchant_name: 'Teh Organic Farm',
            location: 'Penang, Malaysia',
            tags: ['organic', 'local'],
            esg_score: 0.98,
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'demo-2',
            title: 'Electric Vehicle Charging',
            description: 'EV charging at sustainable station',
            amount: -15.00,
            currency: 'MYR',
            transaction_type: 'expense',
            status: 'completed',
            merchant_name: 'GreenCharge Malaysia',
            location: 'Kuala Lumpur, Malaysia',
            tags: ['ev', 'green'],
            esg_score: 1.0,
            created_at: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            id: 'demo-3',
            title: 'Renewable Energy Investment',
            description: 'Solar panel subscription',
            amount: -200.00,
            currency: 'MYR',
            transaction_type: 'expense',
            status: 'completed',
            merchant_name: 'SolarTech KL',
            location: 'Kuala Lumpur, Malaysia',
            tags: ['solar', 'investment'],
            esg_score: 1.0,
            created_at: new Date(Date.now() - 604800000).toISOString(),
          }
        ];
        
        setTransactions(mockTransactions);
        console.log("Demo transactions loaded:", mockTransactions);
        return;
      }
      
      // Try to load cached transactions first (always show something)
      const cachedTransactions = await localforage.getItem<Transaction[]>(`transactions_${user.id}`);
      if (cachedTransactions) {
        setTransactions(cachedTransactions);
        console.log("Loaded cached transactions:", cachedTransactions);
      }

      // If offline, merge with pending transactions and return
      if (!isOnline) {
        const offlineTransactions = [...(cachedTransactions || [])];
        
        // Add pending transactions with 'pending' status - decrypt them first to show proper amounts and recipient info
        for (const encryptedPending of pendingTransactions) {
          try {
            // Decrypt the pending transaction to show proper amount and details
            const decryptedPending = await decryptPayloadWithFalcon(encryptedPending);
            
            // Determine if this transaction belongs to the current user
            const isUserTransaction = decryptedPending.user_id === user?.id || 
                                    decryptedPending.buyer_id === user?.id || 
                                    decryptedPending.seller_id === user?.id;
            
            if (isUserTransaction) {
              // For income transactions, determine correct merchant/sender name
              let merchantName = decryptedPending.merchant_name;
              if (decryptedPending.transaction_type === 'income') {
                // For income, try to get sender name from various fields
                merchantName = decryptedPending.sender_name || 
                             decryptedPending.buyer_email || 
                             decryptedPending.sender_email ||
                             `User ${decryptedPending.buyer_id?.slice(-8) || 'Unknown'}`;
              }
              
              const pendingTransaction: Transaction = {
                id: decryptedPending.id || `pending_${Date.now()}`,
                title: decryptedPending.title || 'Offline Transaction',
                description: decryptedPending.description,
                amount: decryptedPending.amount || 0,
                currency: decryptedPending.currency || 'MYR',
                transaction_type: decryptedPending.transaction_type || 'expense',
                status: 'pending',
                merchant_name: merchantName,
                location: decryptedPending.location,
                tags: decryptedPending.tags,
                esg_score: decryptedPending.esg_score || 0,
                created_at: decryptedPending.created_at || new Date().toISOString(),
              };
            
              // Add to beginning (most recent first)
              offlineTransactions.unshift(pendingTransaction);
            }
          } catch (error) {
            console.error('Failed to decrypt pending transaction for display:', error);
            // Skip failed decryption instead of showing placeholder
            // This prevents showing incorrect transaction details
          }
        }
        
        setTransactions(offlineTransactions);
        setLoading(false);
        return;
      }

      // Online: fetch from database
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, icon, color, esg_impact)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const freshTransactions: Transaction[] = data?.map(transaction => ({
        id: transaction.id,
        title: transaction.title,
        description: transaction.description || undefined,
        amount: transaction.amount,
        currency: transaction.currency || 'MYR',
        transaction_type: transaction.transaction_type as 'income' | 'expense',
        status: transaction.status as 'completed' | 'pending' | 'failed',
        merchant_name: transaction.merchant_name || undefined,
        location: transaction.location || undefined,
        tags: transaction.tags || undefined,
        esg_score: transaction.esg_score || 0,
        created_at: transaction.created_at,
        category: transaction.category || undefined
      })) || [];

      // Cache the fresh data (only the mapped Transaction objects)
      await localforage.setItem(`transactions_${user.id}`, freshTransactions);
      
      // Merge with pending transactions (show pending at the top)
      const allTransactions = [...freshTransactions];
      
      // Decrypt and process pending transactions
      for (const encryptedPending of pendingTransactions) {
        try {
          // Decrypt the pending transaction
          const decryptedTransaction = await decryptPayloadWithFalcon(encryptedPending);
          
          // For income transactions, determine correct merchant/sender name
          let merchantName = decryptedTransaction.merchant_name;
          if (decryptedTransaction.transaction_type === 'income') {
            // For income, try to get sender name from various fields
            merchantName = decryptedTransaction.sender_name || 
                         decryptedTransaction.buyer_email || 
                         decryptedTransaction.sender_email ||
                         `User ${decryptedTransaction.buyer_id?.slice(-8) || 'Unknown'}`;
          }
          
          const pendingTransaction: Transaction = {
            id: decryptedTransaction.id || `pending_${Date.now()}`,
            title: decryptedTransaction.title || 'Offline Transaction',
            description: decryptedTransaction.description,
            amount: decryptedTransaction.amount || 0,
            currency: decryptedTransaction.currency || 'MYR',
            transaction_type: decryptedTransaction.transaction_type || 'expense',
            status: 'pending',
            merchant_name: merchantName,
            location: decryptedTransaction.location,
            tags: decryptedTransaction.tags,
            esg_score: decryptedTransaction.esg_score || 0,
            created_at: decryptedTransaction.created_at || new Date().toISOString(),
          };
          
          // Add to beginning (most recent first)
          allTransactions.unshift(pendingTransaction);
        } catch (error) {
          console.error('Failed to decrypt pending transaction:', error);
          // Add a placeholder for failed decryption
          allTransactions.unshift({
            id: `pending_failed_${Date.now()}`,
            title: 'Encrypted Transaction',
            description: 'Failed to decrypt offline transaction',
            amount: 0,
            currency: 'MYR',
            transaction_type: 'expense',
            status: 'pending',
            esg_score: 0,
            created_at: new Date().toISOString(),
          });
        }
      }

      setTransactions(allTransactions);
      console.log("Fetched and cached transactions:", allTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      
      // If online fetch fails, try to use cached data
      try {
        const cachedTransactions = await localforage.getItem<Transaction[]>(`transactions_${user.id}`);
        if (cachedTransactions) {
          setTransactions(cachedTransactions);
          console.log("Fallback to cached transactions due to error");
        } else {
          setTransactions([]);
        }
      } catch (cacheError) {
        console.error('Error loading cached transactions:', cacheError);
        setTransactions([]);
      }
      
      // Show error only if we don't have cached data
      const hasCachedData = await localforage.getItem<Transaction[]>(`transactions_${user.id}`);
      if (!hasCachedData) {
        toast({
          title: "Error",
          description: "Failed to load transactions.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchESGMetrics = async () => {
    if (!user) return;
    
    try {
      // Check if this is a demo user (bypass mode)
      if (user.id === '00000000-0000-0000-0000-000000000000' || 
          session?.access_token === 'demo-bypass-token') {
        // Return mock ESG metrics for demo user
        const mockESGMetrics: ESGMetrics = {
          environmental_score: 0.95,
          social_score: 0.88,
          governance_score: 0.85,
          overall_score: 0.90,
          carbon_footprint: 0.8,
          sustainable_spending: 1650.25,
          total_spending: 1850.25
        };
        
        setEsgMetrics(mockESGMetrics);
        console.log("Demo ESG metrics loaded:", mockESGMetrics);
        return;
      }
      
      // Try to load cached ESG metrics first
      const cachedESGMetrics = await localforage.getItem<ESGMetrics>(`esg_metrics_${user.id}`);
      if (cachedESGMetrics) {
        setEsgMetrics(cachedESGMetrics);
        console.log("Loaded cached ESG metrics:", cachedESGMetrics);
      }

      // If offline, use cached data and return
      if (!isOnline) {
        if (!cachedESGMetrics) {
          setEsgMetrics(null);
        }
        return;
      }

      // Online: fetch from database
      const { data, error } = await supabase
        .from('esg_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const esgData: ESGMetrics = {
          environmental_score: data.environmental_score || 0,
          social_score: data.social_score || 0,
          governance_score: data.governance_score || 0,
          overall_score: data.overall_score || 0,
          carbon_footprint: data.carbon_footprint || 0,
          sustainable_spending: data.sustainable_spending || 0,
          total_spending: data.total_spending || 0
        };
        
        // Cache the fresh data
        await localforage.setItem(`esg_metrics_${user.id}`, esgData);
        setEsgMetrics(esgData);
        console.log("Fetched and cached ESG metrics:", esgData);
      } else {
        // No ESG metrics available
        setEsgMetrics(null);
        // Clear cached data if none available
        await localforage.removeItem(`esg_metrics_${user.id}`);
      }
    } catch (error) {
      console.error('Error fetching ESG metrics:', error);
      
      // If online fetch fails, try to use cached data
      try {
        const cachedESGMetrics = await localforage.getItem<ESGMetrics>(`esg_metrics_${user.id}`);
        if (cachedESGMetrics) {
          setEsgMetrics(cachedESGMetrics);
          console.log("Fallback to cached ESG metrics due to error");
        } else {
          setEsgMetrics(null);
        }
      } catch (cacheError) {
        console.error('Error loading cached ESG metrics:', cacheError);
        setEsgMetrics(null);
      }
    }
  };

  const generateCashFlowData = () => {
    // Generate cash flow data based on transactions
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    // The current balance should always be the profile balance
    const currentBalance = profile?.balance || 0;
    
    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => 
        t.created_at.split('T')[0] === date
      );
      
      const dayIncome = dayTransactions
        .filter(t => t.transaction_type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const dayExpenses = dayTransactions
        .filter(t => t.transaction_type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        income: dayIncome,
        expenses: -dayExpenses,
        balance: currentBalance // Use the actual current balance, not a calculated one
      };
    });
  };

  return {
    transactions,
    esgMetrics,
    loading,
    cashFlowData: generateCashFlowData(),
    refetch: () => {
      fetchTransactions();
      fetchESGMetrics();
    }
  };
}