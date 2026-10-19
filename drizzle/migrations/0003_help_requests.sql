CREATE TABLE public.help_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) <= 255),
  phone text CHECK (phone IS NULL OR char_length(phone) <= 30),
  need text NOT NULL CHECK (char_length(need) BETWEEN 2 AND 3000),
  status public.review_status NOT NULL DEFAULT 'pending',
  reviewed_at timestamptz,
  approval_email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.help_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.help_requests TO authenticated;
GRANT ALL ON public.help_requests TO service_role;
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a pending help request" ON public.help_requests FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_at IS NULL AND approval_email_sent_at IS NULL AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "Admins read help requests" ON public.help_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins update help requests" ON public.help_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins delete help requests" ON public.help_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));