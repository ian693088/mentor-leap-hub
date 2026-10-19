CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (NEW.id, left(coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), 120), NEW.email, left(NEW.raw_user_meta_data->>'phone', 30))
  ON CONFLICT (id) DO NOTHING;
  IF lower(NEW.email) IN ('ian693088@gmail.com','barakaian88@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'super_admin') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE lower(email) IN ('ian693088@gmail.com','barakaian88@gmail.com')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.grant_admin_by_email(_email text) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin') THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT id INTO _uid FROM public.profiles WHERE lower(email) = lower(trim(_email));
  IF _uid IS NULL THEN RETURN 'not_found'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, 'super_admin') ON CONFLICT DO NOTHING;
  RETURN 'ok';
END $$;
REVOKE ALL ON FUNCTION public.grant_admin_by_email(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.grant_admin_by_email(text) TO authenticated;