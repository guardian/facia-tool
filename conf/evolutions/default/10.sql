# --- !Ups

UPDATE  collections  SET content_prefill_window_start = CONCAT(cast((select issue_date from edition_issues where edition_issues.id = (select issue_id from fronts where fronts.id = front_id)) as text), ' 00:00:00.00 UTC')::TIMESTAMP where prefill IS NOT NULL;
UPDATE  collections  SET content_prefill_window_end = CONCAT(cast((select issue_date from edition_issues where edition_issues.id = (select issue_id from fronts where fronts.id = front_id)) as text), ' 00:00:00.00 UTC')::TIMESTAMP where prefill IS NOT NULL;

-- refining changes from 9.sql script
-- it turns out time concat with 00:00:00.00 UTC time is more appropriate in actual environments

