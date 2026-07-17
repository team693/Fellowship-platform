-- ============================================================================
-- Heal Digital Impact Internships — Seed (OPTIONAL, for local dev / first run)
-- Migration 0004: one example internship with the four shipped simulations,
-- each mapped to the UN SDGs it covers.
--
-- Requires 0006_sdgs.sql to have run first (adds the modules.sdgs column).
-- Safe to run more than once (idempotent on slug / order_index).
-- ============================================================================

insert into public.fellowships (slug, title, description, locale, cover_color, is_published)
values (
  'ai-governance',
  'Applied AI Impact Internship',
  'Work through real-world impact simulations mapped to the UN Sustainable Development Goals — water intelligence, public health, urban safety, and the future of work — then apply what you learn. Earn a verifiable Impact Certification.',
  'en',
  '#0f8b80',
  true
)
on conflict (slug) do nothing;

-- Simulation modules (all engagement-based dashboards/simulations).
insert into public.modules
  (fellowship_id, title, description, type, order_index, asset_path, completion_rule, completion_config, is_required, sdgs)
select f.id, m.title, m.description, m.type, m.order_index, m.asset_path,
       m.completion_rule, m.completion_config::jsonb, m.is_required, m.sdgs
from public.fellowships f
cross join (values
  (
    'Karachi Water Intelligence',
    'An interactive water-quality intelligence dashboard. Explore the data, then mark complete to continue.',
    'explore', 0, 'karachi-water-intelligence.html', 'engagement',
    '{"min_seconds": 45}', true, array[6,11,3]::smallint[]
  ),
  (
    'Health Research Platform — Shaoor aur Shifa',
    'Explore a public-health research platform spanning maternal health, nutrition, and communicable diseases.',
    'explore', 1, 'health-research-platform.html', 'engagement',
    '{"min_seconds": 45}', true, array[3]::smallint[]
  ),
  (
    'Mahfooz Karachi — Safety Observatory',
    'A city safety observatory. Explore the indicators and what drives them.',
    'explore', 2, 'karachi-safety-observatory.html', 'engagement',
    '{"min_seconds": 45}', true, array[11,16,3]::smallint[]
  ),
  (
    'Rozgar — Karachi 2041',
    'A 3D simulation of jobs and economic futures for the city. Explore the scenarios.',
    'explore', 3, 'rozgar-karachi-2041.html', 'engagement',
    '{"min_seconds": 45}', true, array[8,9,11]::smallint[]
  )
) as m(title, description, type, order_index, asset_path, completion_rule, completion_config, is_required, sdgs)
where f.slug = 'ai-governance'
on conflict (fellowship_id, order_index) do nothing;

-- Example native, server-graded case study. Requires 0007_activities.sql.
with fw as (
  select id from public.fellowships where slug = 'ai-governance'
),
ins as (
  insert into public.modules
    (fellowship_id, title, description, type, kind, order_index, asset_path,
     completion_rule, completion_config, is_required, sdgs)
  select fw.id,
         'Case Study: Safe Water for Every Home',
         'Apply what you explored in the Water Intelligence dashboard. Answer the questions and write a short response — graded on our servers.',
         'case_study', 'activity', 4, '',
         'reported', '{"pass_score": 70}'::jsonb, true, array[6,3]::smallint[]
  from fw
  on conflict (fellowship_id, order_index) do nothing
  returning id
)
insert into public.activities (module_id, spec)
select id, '{"intro":"Scenario: a low-income neighbourhood reports rising waterborne illness. You advise the city water authority, using what you explored in the Water Intelligence dashboard.","pass_score":70,"questions":[{"id":"q1","type":"mcq","prompt":"Which indicator most directly signals unsafe drinking water?","options":["Average household income","Fecal coliform (E. coli) count","Number of streetlights"],"answer":1},{"id":"q2","type":"multi","prompt":"Which actions reduce waterborne disease risk? (choose all that apply)","options":["Chlorination of supply","Fixing leaking sewage lines","Raising water tariffs only","Public handwashing campaigns"],"answers":[0,1,3]},{"id":"q3","type":"matching","prompt":"Match each UN SDG to its focus.","left":["SDG 6","SDG 3"],"right":["Good Health and Well-being","Clean Water and Sanitation"],"pairs":{"0":1,"1":0}},{"id":"q4","type":"numeric","prompt":"A shared tank serves 4 homes of 5 people each. How many people rely on it?","answer":20,"tolerance":0},{"id":"q5","type":"order","prompt":"Order the response steps from first to last.","items":["Treat the water source","Detect the contamination","Confirm cases drop"],"correctOrder":[1,0,2]},{"id":"q6","type":"essay","prompt":"In 60+ words, propose one intervention and how you would measure its impact.","minWords":60}]}'::jsonb
from ins
on conflict (module_id) do nothing;
