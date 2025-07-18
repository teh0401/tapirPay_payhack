-- Add balance field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN balance DECIMAL(10,2) DEFAULT 0.00;