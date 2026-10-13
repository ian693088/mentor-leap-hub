
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('super_admin','coordinator','member','volunteer');
CREATE TYPE public.content_status AS ENUM ('draft','published','archived');
CREATE TYPE public.review_status AS ENUM ('pending','approved','rejected');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text CHECK (char_length(full_name) <= 120),
  email text,
  phone text CHECK (char_length(phone) <= 30),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- PROGRAMS
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{2,60}$'),
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 120),
  short text CHECK (char_length(short) <= 300),
  body text CHECK (char_length(body) <= 5000),
  icon text NOT NULL DEFAULT 'book',
  sort_order int NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.program_coordinators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_id, user_id)
);

CREATE OR REPLACE FUNCTION public.can_manage_program(_user_id uuid, _program_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id,'super_admin')
    OR (_program_id IS NOT NULL AND public.has_role(_user_id,'coordinator') AND EXISTS (
      SELECT 1 FROM public.program_coordinators WHERE program_id = _program_id AND user_id = _user_id))
$$;
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id,'super_admin') OR public.has_role(_user_id,'coordinator')
$$;

GRANT SELECT ON public.programs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER programs_updated BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Public reads published programs" ON public.programs FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Managers read programs" ON public.programs FOR SELECT TO authenticated USING (public.can_manage_program(auth.uid(), id));
CREATE POLICY "Admins insert programs" ON public.programs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Managers update programs" ON public.programs FOR UPDATE TO authenticated USING (public.can_manage_program(auth.uid(), id)) WITH CHECK (public.can_manage_program(auth.uid(), id));
CREATE POLICY "Admins delete programs" ON public.programs FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

GRANT SELECT, INSERT, DELETE ON public.program_coordinators TO authenticated;
GRANT ALL ON public.program_coordinators TO service_role;
ALTER TABLE public.program_coordinators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own or admin reads assignments" ON public.program_coordinators FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Admins assign coordinators" ON public.program_coordinators FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Admins remove coordinators" ON public.program_coordinators FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

-- profile & role policies
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Admins grant roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Admins revoke roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin') AND user_id <> auth.uid());

-- new user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, left(coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), 120), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CONTENT TABLES (program-scoped)
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 160),
  summary text CHECK (char_length(summary) <= 2000),
  progress int NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 160),
  description text CHECK (char_length(description) <= 3000),
  starts_at timestamptz NOT NULL,
  venue text CHECK (char_length(venue) <= 200),
  capacity int CHECK (capacity IS NULL OR capacity > 0),
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'Training' CHECK (char_length(kind) <= 40),
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 160),
  description text CHECK (char_length(description) <= 3000),
  deadline date,
  link text CHECK (link IS NULL OR link ~ '^https?://'),
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.impact_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 160),
  period text CHECK (char_length(period) <= 60),
  learners_reached int NOT NULL DEFAULT 0 CHECK (learners_reached >= 0),
  sessions_held int NOT NULL DEFAULT 0 CHECK (sessions_held >= 0),
  volunteers_engaged int NOT NULL DEFAULT 0 CHECK (volunteers_engaged >= 0),
  summary text CHECK (char_length(summary) <= 3000),
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['projects','events','opportunities','impact_reports'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t||'_updated', t);
    EXECUTE format('CREATE POLICY "Public reads published" ON public.%I FOR SELECT TO anon, authenticated USING (status = ''published'')', t);
    EXECUTE format('CREATE POLICY "Managers read" ON public.%I FOR SELECT TO authenticated USING (public.can_manage_program(auth.uid(), program_id))', t);
    EXECUTE format('CREATE POLICY "Managers insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.can_manage_program(auth.uid(), program_id))', t);
    EXECUTE format('CREATE POLICY "Managers update" ON public.%I FOR UPDATE TO authenticated USING (public.can_manage_program(auth.uid(), program_id)) WITH CHECK (public.can_manage_program(auth.uid(), program_id))', t);
    EXECUTE format('CREATE POLICY "Managers delete" ON public.%I FOR DELETE TO authenticated USING (public.can_manage_program(auth.uid(), program_id))', t);
  END LOOP;
END $$;

-- NEWS
CREATE TABLE public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200),
  summary text CHECK (char_length(summary) <= 500),
  body text CHECK (char_length(body) <= 20000),
  author_id uuid,
  published_at timestamptz NOT NULL DEFAULT now(),
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT ALL ON public.news_posts TO service_role;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER news_updated BEFORE UPDATE ON public.news_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "Public reads published news" ON public.news_posts FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Staff read news" ON public.news_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR (public.has_role(auth.uid(),'coordinator') AND author_id = auth.uid()));
CREATE POLICY "Staff insert news" ON public.news_posts FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()) AND author_id = auth.uid());
CREATE POLICY "Staff update news" ON public.news_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR (public.has_role(auth.uid(),'coordinator') AND author_id = auth.uid())) WITH CHECK (public.has_role(auth.uid(),'super_admin') OR (public.has_role(auth.uid(),'coordinator') AND author_id = auth.uid()));
CREATE POLICY "Staff delete news" ON public.news_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin') OR (public.has_role(auth.uid(),'coordinator') AND author_id = auth.uid()));

-- APPLICATIONS
CREATE TABLE public.membership_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 255),
  phone text CHECK (char_length(phone) <= 30),
  message text CHECK (char_length(message) <= 1000),
  status public.review_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 255),
  phone text CHECK (char_length(phone) <= 30),
  skills text NOT NULL CHECK (char_length(skills) BETWEEN 2 AND 1000),
  availability text CHECK (char_length(availability) <= 200),
  status public.review_status NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.contact_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 255),
  phone text CHECK (char_length(phone) <= 30),
  topic text NOT NULL DEFAULT 'General' CHECK (char_length(topic) <= 60),
  message text NOT NULL CHECK (char_length(message) BETWEEN 2 AND 2000),
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' AND char_length(email) <= 255),
  phone text CHECK (char_length(phone) <= 30),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_id, email)
);

GRANT INSERT ON public.membership_applications, public.volunteer_applications, public.contact_enquiries, public.event_registrations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.membership_applications, public.volunteer_applications, public.contact_enquiries, public.event_registrations TO authenticated;
GRANT ALL ON public.membership_applications, public.volunteer_applications, public.contact_enquiries, public.event_registrations TO service_role;
ALTER TABLE public.membership_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER membership_updated BEFORE UPDATE ON public.membership_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER volunteer_updated BEFORE UPDATE ON public.volunteer_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Submissions: anyone may submit; user_id must be null (guest) or self; status forced pending
CREATE POLICY "Anyone applies for membership" ON public.membership_applications FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_by IS NULL AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "Own or managers read membership" ON public.membership_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin') OR (program_id IS NOT NULL AND public.can_manage_program(auth.uid(), program_id)));
CREATE POLICY "Admins delete membership" ON public.membership_applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "Anyone volunteers" ON public.volunteer_applications FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND reviewed_by IS NULL AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "Own or staff read volunteers" ON public.volunteer_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "Admins delete volunteers" ON public.volunteer_applications FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "Anyone sends enquiries" ON public.contact_enquiries FOR INSERT TO anon, authenticated
  WITH CHECK (handled = false AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "Admins read enquiries" ON public.contact_enquiries FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Admins update enquiries" ON public.contact_enquiries FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "Admins delete enquiries" ON public.contact_enquiries FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

CREATE OR REPLACE FUNCTION public.event_is_open(_event_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.events e WHERE e.id = _event_id AND e.status = 'published'
    AND (e.capacity IS NULL OR (SELECT count(*) FROM public.event_registrations r WHERE r.event_id = e.id) < e.capacity))
$$;
CREATE POLICY "Anyone registers for open events" ON public.event_registrations FOR INSERT TO anon, authenticated
  WITH CHECK (public.event_is_open(event_id) AND (user_id IS NULL OR user_id = auth.uid()));
CREATE POLICY "Own or managers read registrations" ON public.event_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_manage_program(auth.uid(), e.program_id)));
CREATE POLICY "Own or managers delete registrations" ON public.event_registrations FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND public.can_manage_program(auth.uid(), e.program_id)));

-- REVIEW FUNCTION (only path to approve; grants role server-side)
CREATE OR REPLACE FUNCTION public.review_application(_kind text, _id uuid, _decision public.review_status)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user uuid; v_program uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  IF _decision = 'pending' THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  IF _kind = 'membership' THEN
    SELECT user_id, program_id INTO v_user, v_program FROM membership_applications WHERE id = _id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Not found'; END IF;
    IF NOT (has_role(auth.uid(),'super_admin') OR (v_program IS NOT NULL AND can_manage_program(auth.uid(), v_program))) THEN RAISE EXCEPTION 'Not allowed'; END IF;
    UPDATE membership_applications SET status = _decision, reviewed_by = auth.uid(), reviewed_at = now() WHERE id = _id;
    IF _decision = 'approved' AND v_user IS NOT NULL THEN
      INSERT INTO user_roles(user_id, role) VALUES (v_user, 'member') ON CONFLICT DO NOTHING;
    END IF;
  ELSIF _kind = 'volunteer' THEN
    SELECT user_id INTO v_user FROM volunteer_applications WHERE id = _id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Not found'; END IF;
    IF NOT is_staff(auth.uid()) THEN RAISE EXCEPTION 'Not allowed'; END IF;
    UPDATE volunteer_applications SET status = _decision, reviewed_by = auth.uid(), reviewed_at = now() WHERE id = _id;
    IF _decision = 'approved' AND v_user IS NOT NULL THEN
      INSERT INTO user_roles(user_id, role) VALUES (v_user, 'volunteer') ON CONFLICT DO NOTHING;
    END IF;
  ELSE RAISE EXCEPTION 'Unknown kind';
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.review_application(text, uuid, public.review_status) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.review_application(text, uuid, public.review_status) TO authenticated;

-- SEED
INSERT INTO public.programs (slug,title,short,body,icon,sort_order,status) VALUES
('education','Education & Digital Learning','Learning resources and access to opportunities.','Reading materials, digital lessons, scholarship information and educational activities for learners and schools.','book',1,'published'),
('mentorship','Mentorship & Personal Development','Connecting young people with positive guidance.','Students choose interests like engineering or entrepreneurship and join approved mentoring sessions led by vetted mentors.','users',2,'published'),
('stem','STEM & Technology','STEM, creativity and practical problem-solving.','Robotics, coding, electronics, renewable energy, innovation challenges and hands-on engineering workshops.','cpu',3,'published'),
('talent','Sports, Arts & Talent','Sports, arts and opportunities to grow.','Sports, music, art and drama — with events, showcases and recognition of achievements.','trophy',4,'published'),
('skills','Youth Skills & Employability','Practical skills for work and enterprise.','Skills training, CV support, entrepreneurship programs, internships and links to verified opportunities.','briefcase',5,'published'),
('welfare','Child Welfare & Community Support','Safeguarded support for families.','Coordinating eligible support, referrals and partnerships with qualified organisations under strict safeguarding.','heart',6,'published');

INSERT INTO public.projects (program_id,title,summary,progress,status)
SELECT p.id, v.title, v.summary, v.progress, 'published' FROM (VALUES
 ('stem','Solar Robotics Club','Students build solar-powered robots and compete in county challenges.',60),
 ('education','Community Reading Corner','A shared library space with books and tablets for primary learners.',85),
 ('mentorship','Mentor Circles 2026','Monthly small-group sessions pairing students with young professionals.',35),
 ('talent','Youth Football League','A weekend league promoting teamwork, fitness and discipline.',50)
) v(slug,title,summary,progress) JOIN public.programs p ON p.slug = v.slug;

INSERT INTO public.events (program_id,title,description,starts_at,venue,capacity,status)
SELECT p.id, v.title, v.descr, v.starts::timestamptz, v.venue, v.cap, 'published' FROM (VALUES
 ('stem','Innovation Challenge Showcase Day','Students present their STEM projects to judges and the community.','2026-12-12 09:00+03','Community Hall',150),
 ('mentorship','Career Mentorship Saturday','Meet young professionals in engineering, business and health.','2026-11-21 10:00+03','Baraka Learning Centre',60),
 ('talent','Youth Football Tournament','Under-17 weekend tournament.','2026-11-28 08:00+03','Community Grounds',200)
) v(slug,title,descr,starts,venue,cap) JOIN public.programs p ON p.slug = v.slug;

INSERT INTO public.opportunities (program_id,kind,title,description,deadline,status)
SELECT p.id, v.kind, v.title, v.descr, v.deadline::date, 'published' FROM (VALUES
 ('education','Scholarship','Secondary School Bursary Support','Partial bursaries for needy learners joining secondary school.','2026-11-30'),
 ('stem','Training','Intro to Coding Bootcamp (Ages 14–18)','A four-week beginner coding course.','2026-11-15'),
 ('skills','Internship','Community Projects Assistant','A three-month internship supporting our project team.','2026-12-05'),
 ('stem','Event','Innovation Challenge Showcase Day','Register your team to present a project.','2026-12-12')
) v(slug,kind,title,descr,deadline) JOIN public.programs p ON p.slug = v.slug;

INSERT INTO public.news_posts (title,summary,published_at,status) VALUES
('Robotics club reaches county finals','Our STEM learners presented a solar irrigation prototype to judges.','2026-10-05','published'),
('300 books donated to reading corner','Thanks to partners, the community library doubled its collection.','2026-09-15','published'),
('First mentor circle completed','24 students finished an eight-week personal development journey.','2026-08-20','published');

INSERT INTO public.impact_reports (title,period,learners_reached,sessions_held,volunteers_engaged,summary,status) VALUES
('2026 Year-to-date impact','Jan–Oct 2026',1200,48,40,'Learners reached across all programs, sessions delivered and volunteers engaged.','published');
