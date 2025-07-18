-- Create function to handle P2P transactions (buyer and seller)
CREATE OR REPLACE FUNCTION public.create_p2p_transaction(
  buyer_id uuid,
  seller_id uuid,
  amount decimal(10,2),
  title text DEFAULT 'P2P Transaction',
  description text DEFAULT NULL,
  merchant_name text DEFAULT NULL,
  location text DEFAULT NULL,
  tags text[] DEFAULT NULL,
  esg_score decimal(3,2) DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  buyer_transaction_id uuid;
  seller_transaction_id uuid;
  result jsonb;
BEGIN
  -- Validate inputs
  IF buyer_id IS NULL OR seller_id IS NULL OR amount <= 0 THEN
    RAISE EXCEPTION 'Invalid transaction parameters';
  END IF;
  
  -- Create buyer transaction (expense - negative amount)
  INSERT INTO public.transactions (
    user_id,
    title,
    description,
    amount,
    currency,
    transaction_type,
    status,
    merchant_name,
    location,
    tags,
    esg_score,
    created_at,
    updated_at
  ) VALUES (
    buyer_id,
    title,
    description,
    -ABS(amount), -- Negative for buyer (expense)
    'MYR',
    'expense',
    'completed',
    merchant_name,
    location,
    tags,
    esg_score,
    NOW(),
    NOW()
  ) RETURNING id INTO buyer_transaction_id;
  
  -- Create seller transaction (income - positive amount)
  INSERT INTO public.transactions (
    user_id,
    title,
    description,
    amount,
    currency,
    transaction_type,
    status,
    merchant_name,
    location,
    tags,
    esg_score,
    created_at,
    updated_at
  ) VALUES (
    seller_id,
    title,
    description,
    ABS(amount), -- Positive for seller (income)
    'MYR',
    'income',
    'completed',
    merchant_name,
    location,
    tags,
    esg_score,
    NOW(),
    NOW()
  ) RETURNING id INTO seller_transaction_id;
  
  -- Update buyer balance (subtract amount)
  UPDATE public.profiles 
  SET balance = balance - ABS(amount),
      updated_at = NOW()
  WHERE user_id = buyer_id;
  
  -- Update seller balance (add amount)
  UPDATE public.profiles 
  SET balance = balance + ABS(amount),
      updated_at = NOW()
  WHERE user_id = seller_id;
  
  -- Return transaction IDs
  result := jsonb_build_object(
    'buyer_transaction_id', buyer_transaction_id,
    'seller_transaction_id', seller_transaction_id,
    'amount', amount,
    'buyer_id', buyer_id,
    'seller_id', seller_id
  );
  
  RETURN result;
END;
$$;