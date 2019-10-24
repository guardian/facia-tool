# --- !Ups

ALTER TABLE collections ADD COLUMN content_prefill_window_start TIMESTAMPTZ;
ALTER TABLE collections ADD COLUMN content_prefill_window_end TIMESTAMPTZ;
UPDATE  collections  SET content_prefill_window_start = CONCAT(cast((select issue_date from edition_issues where edition_issues.id = (select issue_id from fronts where fronts.id = front_id)) as text), ' 01:00:00.00 UTC')::TIMESTAMP where prefill IS NOT NULL;
UPDATE  collections  SET content_prefill_window_end = CONCAT(cast((select issue_date from edition_issues where edition_issues.id = (select issue_id from fronts where fronts.id = front_id)) as text), ' 01:00:00.00 UTC')::TIMESTAMP where prefill IS NOT NULL;

-- Why [content_prefill_window_start] and [content_prefill_window_end] will be issue_date + 1 hour while migration ?
-- look at 6.sql issue_date is in GMT+1
-- [content_prefill_window_start] and [content_prefill_window_end] are in UTC
-- by using CONCAT ' 01:00:00.00 UTC' we will have issue_date=2019-10-11 and [content_prefill_window_start] and [content_prefill_window_end]=2019-10-11 00:00:00+00
-- while migration
-- os it will by like issue_date with start of the day time
-- otherwise without that CONCAT ' 01:00:00.00 UTC' we may get for example issue_date=2019-10-11 and [content_prefill_window_start] and [content_prefill_window_end]=2019-10-10 23:00:00+00

# --- !Downs

ALTER TABLE collections DROP COLUMN content_prefill_window_start;
ALTER TABLE collections DROP COLUMN content_prefill_window_end;
