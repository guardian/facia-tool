# --- !Ups

ALTER TABLE collections ADD COLUMN path_type TEXT;
UPDATE  collections  SET path_type = 'printSent' where prefill IS NOT NULL;
UPDATE  collections  SET path_type = 'search' where prefill = '?tag=type/crossword';

# --- !Downs

ALTER TABLE collections DROP COLUMN path_type;

