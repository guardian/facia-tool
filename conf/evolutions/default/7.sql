# --- !Ups

ALTER TABLE collections ADD COLUMN path_type TEXT;
UPDATE  collections  SET path_type = 'print-sent' where prefill IS NOT NULL;

# --- !Downs

ALTER TABLE collections DROP COLUMN path_type;

