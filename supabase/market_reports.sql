-- Create market_reports table
CREATE TABLE IF NOT EXISTS public.market_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  location text NOT NULL,
  year text NOT NULL,
  content text NOT NULL,
  marketing_linkedin text,
  marketing_whatsapp text,
  marketing_email text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.market_reports ENABLE ROW LEVEL SECURITY;

-- Create public select policy
CREATE POLICY "public_select" ON public.market_reports
FOR SELECT
USING (true);