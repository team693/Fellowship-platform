-- ============================================================================
-- Optional data fix (NOT a schema change — safe to run, safe to skip).
--
-- The program page now reads modules with no topic (`route_id is null`) as
-- week-1 CORE content. "Case Study: Safe Water for Every Home" is really part
-- of the Water & Environment topic, so without this it would show up under
-- week 1 by mistake.
--
-- The same thing can be done through the UI: Admin → Programs → the program →
-- edit the module → set its Topic. This file is just the faster route.
--
-- Idempotent.
-- ============================================================================

update public.modules m
   set route_id = r.id
  from public.routes r
 where r.key = 'water_environment'
   and m.route_id is null
   and m.title = 'Case Study: Safe Water for Every Home';

-- Check the result: everything with a topic is weeks 2-4, everything without
-- is week-1 core.
select coalesce(r.title, '— week 1 core —') as topic, m.title, m.is_required
  from public.modules m
  left join public.routes r on r.id = m.route_id
 order by r.sort_order nulls first, m.order_index;
