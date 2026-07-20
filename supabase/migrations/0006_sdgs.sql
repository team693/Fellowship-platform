-- ============================================================================
-- IESP — SDG mapping
-- Migration 0006: tag each module with the UN Sustainable Development Goals it
-- covers, so students can see which SDGs they are progressing through.
-- ============================================================================

alter table public.modules
  add column if not exists sdgs smallint[] not null default '{}';

comment on column public.modules.sdgs is
  'UN SDG numbers (1-17) this module covers, e.g. {3,6,11}.';
