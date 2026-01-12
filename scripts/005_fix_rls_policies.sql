-- Drop the problematic recursive RLS policies
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "progress_select_admin" ON public.progress;
DROP POLICY IF EXISTS "payments_select_admin" ON public.payments;

-- Create a stored function to check admin status (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Replace admin RLS policies with non-recursive versions for profiles
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Replace admin RLS policies with non-recursive versions for progress
CREATE POLICY "progress_select_admin"
  ON public.progress FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Replace admin RLS policies with non-recursive versions for payments
CREATE POLICY "payments_select_admin"
  ON public.payments FOR SELECT
  USING (public.is_admin(auth.uid()));
