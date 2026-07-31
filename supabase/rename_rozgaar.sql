-- Rename the simulation module to just "Rozgaar" (no city in the name), since it
-- will cover multiple Pakistani cities rather than Karachi alone.
-- Data only — safe to run, safe to skip if you rename it via the admin UI instead.
update public.modules
   set title = 'Rozgaar'
 where asset_path = 'rozgar-karachi-2041.html';

select title, asset_path from public.modules where asset_path = 'rozgar-karachi-2041.html';
