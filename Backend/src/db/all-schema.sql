-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.areas (
  id bigint NOT NULL DEFAULT nextval('areas_id_seq'::regclass),
  locality_id bigint NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'flagged'::text, 'blocked'::text])),
  code text,
  CONSTRAINT areas_pkey PRIMARY KEY (id),
  CONSTRAINT areas_locality_id_fkey FOREIGN KEY (locality_id) REFERENCES public.localities(id)
);
CREATE TABLE public.committees (
  id bigint NOT NULL DEFAULT nextval('committes_id_seq'::regclass),
  abbr text NOT NULL,
  committee text NOT NULL,
  category text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT committees_pkey PRIMARY KEY (id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  cover_image text,
  logo_image text,
  locality_id bigint,
  area_id bigint,
  school_id bigint,
  number_of_seats bigint,
  fees_per_delegate numeric,
  total_revenue numeric,
  website text,
  instagram text,
  event_phase text NOT NULL DEFAULT 'draft'::text CHECK (event_phase = ANY (ARRAY['draft'::text, 'scheduled'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text])),
  status text NOT NULL DEFAULT '''pending''::text'::text,
  flagged_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  organiser_id uuid,
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_locality_id_fkey FOREIGN KEY (locality_id) REFERENCES public.localities(id),
  CONSTRAINT events_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id),
  CONSTRAINT events_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
  CONSTRAINT events_organiser_id_fkey FOREIGN KEY (organiser_id) REFERENCES public.organisers(id)
);
CREATE TABLE public.leadership_roles (
  id bigint NOT NULL DEFAULT nextval('leadership_roles_id_seq'::regclass),
  abbr text NOT NULL UNIQUE,
  leadership_role text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT leadership_roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.localities (
  id bigint NOT NULL DEFAULT nextval('localities_id_seq'::regclass),
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'unlisted'::text, 'inactive'::text])),
  CONSTRAINT localities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.organiser_evidence (
  id bigint NOT NULL DEFAULT nextval('organiser_evidence_id_seq'::regclass),
  file_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organiser_evidence_pkey PRIMARY KEY (id)
);
CREATE TABLE public.organisers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  userid uuid NOT NULL,
  school_id bigint,
  locality_id bigint,
  role text NOT NULL DEFAULT 'organiser'::text,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['flagged'::text, 'pending'::text, 'approved'::text, 'rejected'::text])),
  received_at timestamp with time zone DEFAULT now(),
  actioned_at timestamp with time zone,
  actioned_by_user_id text,
  review_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  evidence_id bigint,
  CONSTRAINT organisers_pkey PRIMARY KEY (id),
  CONSTRAINT organisers_locality_id_fkey FOREIGN KEY (locality_id) REFERENCES public.localities(id),
  CONSTRAINT organisers_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
  CONSTRAINT organisers_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id),
  CONSTRAINT organisers_evidence_id_fkey FOREIGN KEY (evidence_id) REFERENCES public.organiser_evidence(id)
);
CREATE TABLE public.schools (
  id bigint NOT NULL DEFAULT nextval('schools_id_seq'::regclass) UNIQUE,
  code text NOT NULL,
  name text NOT NULL,
  locality_id bigint,
  area_id bigint,
  status text NOT NULL DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'flagged'::text, 'blocked'::text, 'unlisted'::text])),
  CONSTRAINT schools_pkey PRIMARY KEY (id),
  CONSTRAINT schools_locality_id_fkey FOREIGN KEY (locality_id) REFERENCES public.localities(id),
  CONSTRAINT schools_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.areas(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  username text UNIQUE,
  fullname text,
  birthday date,
  gender text,
  phone_number text,
  phone_e164 text,
  school_id bigint,
  role text NOT NULL DEFAULT 'student'::text CHECK (role = ANY (ARRAY['student'::text, 'teacher'::text, 'organiser'::text])),
  global_role text NOT NULL DEFAULT 'user'::text CHECK (global_role = ANY (ARRAY['user'::text, 'superuser'::text])),
  user_status text NOT NULL DEFAULT 'active'::text CHECK (user_status = ANY (ARRAY['active'::text, 'flagged'::text, 'blocked'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  years_of_experience bigint,
  grade text,
  avatar text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.event_leaders (
  id bigint NOT NULL DEFAULT nextval('event_leaders_id_seq'::regclass),
  eventid uuid NOT NULL,
  leadership_role_id bigint NOT NULL,
  userid uuid NOT NULL,
  ranking bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT event_leaders_pkey PRIMARY KEY (id),
  CONSTRAINT event_leaders_eventid_fkey FOREIGN KEY (eventid) REFERENCES public.events(id),
  CONSTRAINT event_leaders_leadership_role_id_fkey FOREIGN KEY (leadership_role_id) REFERENCES public.leadership_roles(id),
  CONSTRAINT event_leaders_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id)
);

