CREATE TABLE public.gallery_photos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 storage_path text NOT NULL UNIQUE,
 title text NOT NULL,
 event_name text NOT NULL DEFAULT '',
 event_date date,
 caption text NOT NULL DEFAULT '',
 published boolean NOT NULL DEFAULT false,
 created_by uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;
GRANT ALL ON public.gallery_photos TO service_role;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public reads published gallery" ON public.gallery_photos FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins read all gallery" ON public.gallery_photos FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins create gallery" ON public.gallery_photos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'super_admin') AND created_by = auth.uid());
CREATE POLICY "Admins edit gallery" ON public.gallery_photos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins delete gallery" ON public.gallery_photos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Published gallery images readable" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'event-gallery' AND EXISTS (SELECT 1 FROM public.gallery_photos p WHERE p.storage_path = name AND p.published));
CREATE POLICY "Admins read gallery files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'event-gallery' AND public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins upload gallery files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'event-gallery' AND public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Admins remove gallery files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'event-gallery' AND public.has_role(auth.uid(), 'super_admin'));
