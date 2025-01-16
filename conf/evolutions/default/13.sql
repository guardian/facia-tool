# --- !Ups

ALTER TABLE collections ADD targeted_regions jsonb NULL;
ALTER TABLE collections ADD excluded_regions jsonb NULL;

# --- !Downs

ALTER TABLE collections DROP COLUMN targeted_regions;
ALTER TABLE collections DROP COLUMN excluded_regions;
