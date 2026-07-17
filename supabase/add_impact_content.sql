-- ============================================================================
-- Heal — Load the 4 real simulations into your EXISTING internship.
-- Paste into the Supabase SQL Editor and Run once. Idempotent.
--
-- What it does:
--   1. Adds the modules.sdgs column (if missing).
--   2. Renames the internship to "Applied AI Impact Internship".
--   3. Removes the two placeholder demo modules.
--   4. Inserts the four simulations, each mapped to its UN SDGs.
--
-- The simulation HTML files must be deployed under public/simulations/
-- (they are, once this branch is deployed).
-- ============================================================================

-- 1. SDG column.
alter table public.modules
  add column if not exists sdgs smallint[] not null default '{}';

-- 2. Rename the internship (no "digital" on the certificate).
update public.fellowships
   set title = 'Applied AI Impact Internship'
 where slug = 'ai-governance';

-- 3. Remove the placeholder demo modules (frees order_index 0 and 1).
delete from public.modules m
using public.fellowships f
where m.fellowship_id = f.id
  and f.slug = 'ai-governance'
  and m.asset_path in ('example-explore.html', 'example-assessed.html');

-- 4. Insert the four simulations.
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

-- 5. Example native, server-graded case study (MCQ + multi + matching +
--    numeric + order + essay). Requires migration 0007 to have run.
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
