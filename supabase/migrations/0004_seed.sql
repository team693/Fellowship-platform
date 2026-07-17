-- ============================================================================
-- Heal Digital Fellowships — Seed (OPTIONAL, for local dev / first run)
-- Migration 0004: one example fellowship with the two shipped example modules.
--
-- Safe to run more than once (idempotent on slug / order_index).
-- Delete or edit freely once you add your real content.
-- ============================================================================

insert into public.fellowships (slug, title, description, locale, cover_color, is_published)
values (
  'ai-governance',
  'Applied AI Digital Internship',
  'An immersive introduction to applied AI, ethics, and the UN SDGs through impact simulations, case studies, and real-world applications. Explore a live data dashboard, then apply what you learned in a short assessed scenario.',
  'en',
  '#0f8b80',
  true
)
on conflict (slug) do nothing;

-- Module 1: explore-only dashboard (completion_rule = engagement).
insert into public.modules
  (fellowship_id, title, description, type, order_index, asset_path, completion_rule, completion_config, is_required)
select
  f.id,
  'Explore: The Governance Dashboard',
  'A self-contained interactive dashboard (D3.js). Spend a little time exploring it, then mark it complete to continue.',
  'explore',
  0,
  'example-explore.html',
  'engagement',
  '{"min_seconds": 20}'::jsonb,
  true
from public.fellowships f
where f.slug = 'ai-governance'
on conflict (fellowship_id, order_index) do nothing;

-- Module 2: assessed scenario (completion_rule = reported).
insert into public.modules
  (fellowship_id, title, description, type, order_index, asset_path, completion_rule, completion_config, is_required)
select
  f.id,
  'Assessed: Allocate the Compute',
  'A short scenario that scores your choices and reports a result. You must score at least 70 to pass.',
  'assessed',
  1,
  'example-assessed.html',
  'reported',
  '{"pass_score": 70}'::jsonb,
  true
from public.fellowships f
where f.slug = 'ai-governance'
on conflict (fellowship_id, order_index) do nothing;
