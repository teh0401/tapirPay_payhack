import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

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
      
      // Normal transaction fetching for real users
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

      setTransactions(data?.map(transaction => ({
        ...transaction,
        transaction_type: transaction.transaction_type as 'income' | 'expense',
        status: transaction.status as 'completed' | 'pending' | 'failed'
      })) || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions.",
        variant: "destructive",
      });
      
      // Don't use demo data as fallback for real users
      setTransactions([]);
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
      
      // Normal ESG metrics fetching for real users
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
        setEsgMetrics(data);
      } else {
        // No ESG metrics available for real users with no transactions
        setEsgMetrics(null);
      }
    } catch (error) {
      console.error('Error fetching ESG metrics:', error);
      // Don't use demo data as fallback for real users
      setEsgMetrics(null);
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