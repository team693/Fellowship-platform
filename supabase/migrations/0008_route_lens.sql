-- ============================================================================
-- IESP — Route × Lens content model
-- Migration 0008: extensible lookup tables for the two onboarding axes.
--
--   route  = the real Karachi problem a learner works on (extensible lookup,
--            not a hardcoded enum — a 5th route, e.g. food_security, can be
--            added later as a new row with zero schema change).
--   lens   = the learner's discipline (same extensibility requirement).
--
-- Content variants: `module_variants` lets a module's title/description/asset
-- be overridden for a specific lens. If no variant row exists for a learner's
-- lens, the module's own base fields are the default — so authoring 16
-- (route × lens) combinations up front is never required.
-- ============================================================================

create table if not exists public.routes (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  title        text not null,
  description  text,
  -- The real tool this route is built on (public/simulations/<file>.html).
  tool_asset_path text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists public.lenses (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  title        text not null,
  description  text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- Seed the 4 launch routes, each backed by an existing real tool.
insert into public.routes (key, title, description, tool_asset_path, sort_order) values
  ('water_environment', 'Water & Environment', 'Karachi''s water-quality data — from source to household.', 'karachi-water-intelligence.html', 0),
  ('public_health', 'Public Health', 'Maternal health, nutrition, and communicable disease across the city.', 'health-research-platform.html', 1),
  ('urban_safety', 'Urban Safety', 'Incident patterns, hotspots, and what drives them.', 'karachi-safety-observatory.html', 2),
  ('economic_opportunity', 'Economic Opportunity', 'Jobs and economic futures for Karachi to 2041.', 'rozgar-karachi-2041.html', 3)
on conflict (key) do nothing;

-- Seed the 4 launch lenses.
insert into public.lenses (key, title, description, sort_order) values
  ('health', 'Health', 'Clinical, public-health, and care-delivery backgrounds.', 0),
  ('cs_data', 'Computer Science / Data', 'Software, data science, and applied AI backgrounds.', 1),
  ('design_marketing', 'Design & Marketing', 'Design, communication, and brand backgrounds.', 2),
  ('entrepreneurial_finance', 'Entrepreneurial / Finance', 'Business, finance, and founder backgrounds.', 3)
on conflict (key) do nothing;

-- Reference data: readable by anyone (needed for the onboarding picker before
-- a user has enrolled in anything); writable by admins only.
alter table public.routes enable row level security;
alter table public.lenses enable row level security;

drop policy if exists routes_select_all on public.routes;
create policy routes_select_all on public.routes for select to anon, authenticated using (true);
drop policy if exists routes_admin_write on public.routes;
create policy routes_admin_write on public.routes for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists lenses_select_all on public.lenses;
create policy lenses_select_all on public.lenses for select to anon, authenticated using (true);
drop policy if exists lenses_admin_write on public.lenses;
create policy lenses_admin_write on public.lenses for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Tag each module with the route it represents (nullable — not every module
-- needs to belong to a route, e.g. the compulsory core curriculum won't).
alter table public.modules
  add column if not exists route_id uuid references public.routes (id) on delete set null;

-- A learner's onboarding picks. Nullable: not chosen until onboarding runs.
alter table public.profiles
  add column if not exists route_id uuid references public.routes (id) on delete set null;
alter table public.profiles
  add column if not exists lens_id  uuid references public.lenses (id) on delete set null;

-- Per-lens content overrides for a module. Absence of a row for a given
-- (module, lens) means: fall back to the module's own base fields.
create table if not exists public.module_variants (
  id            uuid primary key default gen_random_uuid(),
  module_id     uuid not null references public.modules (id) on delete cascade,
  lens_id       uuid not null references public.lenses (id) on delete cascade,
  title         text,
  description   text,
  asset_path    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (module_id, lens_id)
);

drop trigger if exists trg_module_variants_updated_at on public.module_variants;
create trigger trg_module_variants_updated_at
  before update on public.module_variants
  for each row execute function public.set_updated_at();

alter table public.module_variants enable row level security;

-- Same visibility as the parent module: admins, or users enrolled in the
-- module's fellowship.
drop policy if exists module_variants_select on public.module_variants;
create policy module_variants_select on public.module_variants
  for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.modules m
      join public.enrollments e on e.fellowship_id = m.fellowship_id
      where m.id = module_variants.module_id
        and e.user_id = auth.uid()
    )
  );

drop policy if exists module_variants_admin_write on public.module_variants;
create policy module_variants_admin_write on public.module_variants
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Tag the 4 existing sim modules with their route, matching on asset_path.
update public.modules m
   set route_id = r.id
  from public.routes r
 where m.asset_path = r.tool_asset_path
   and m.route_id is null;
