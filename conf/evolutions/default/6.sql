# --- !Ups

ALTER TABLE edition_issues ADD COLUMN temp DATE;

--- Do the work to migrate from timestamps to dates stripping the time (we add an hour as a bodge as some of our data is
--- in GMT+1 which winds up to be the day before
-- noinspection SqlWithoutWhere
UPDATE edition_issues SET temp = (issue_date + INTERVAL '1 hour')::TIMESTAMP::DATE;

ALTER TABLE edition_issues ALTER COLUMN temp SET NOT NULL;
DROP INDEX edition_issues_issue_date_index;
ALTER TABLE edition_issues DROP COLUMN issue_date;
ALTER TABLE edition_issues RENAME COLUMN temp TO issue_date;

CREATE INDEX edition_issues_issue_date_index ON edition_issues(issue_date);

# --- !Downs

ALTER TABLE edition_issues ADD COLUMN temp TIMESTAMPTZ;

--- Do the work to migrate back
-- noinspection SqlWithoutWhere
UPDATE edition_issues SET temp = CONCAT(issue_date, ' 00:00:00 Europe/London')::TIMESTAMPTZ;

ALTER TABLE edition_issues ALTER COLUMN temp SET NOT NULL;
DROP INDEX edition_issues_issue_date_index;
ALTER TABLE edition_issues DROP COLUMN issue_date;
ALTER TABLE edition_issues RENAME COLUMN temp TO issue_date;

CREATE INDEX edition_issues_issue_date_index ON edition_issues(issue_date);
