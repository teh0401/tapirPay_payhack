import { supabase } from '@/integrations/supabase/client';

export const calculateUserBalance = async (userId: string): Promise<number> => {
  try {
    // Get all transactions for the user
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, transaction_type')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching transactions for balance calculation:', error);
      return 0;
    }

    // Calculate balance from all transactions
    let balance = 0;
    transactions?.forEach(transaction => {
      if (transaction.transaction_type === 'income') {
        balance += Number(transaction.amount);
      } else if (transaction.transaction_type === 'expense') {
        balance += Number(transaction.amount); // Amount is already negative for expenses
      }
    });

    // Update the profile balance in the database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating profile balance:', updateError);
    }

    return balance;
  } catch (error) {
    console.error('Error calculating balance:', error);
    return 0;
  }
};