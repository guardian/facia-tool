# --- !Ups

ALTER TABLE collections ALTER COLUMN updated_on SET NOT NULL;
ALTER TABLE collections ALTER COLUMN updated_by SET NOT NULL;
ALTER TABLE collections ALTER COLUMN updated_email SET NOT NULL;

# --- !Downs

ALTER TABLE collections ALTER COLUMN updated_on DROP NOT NULL;
ALTER TABLE collections ALTER COLUMN updated_by DROP NOT NULL;
ALTER TABLE collections ALTER COLUMN updated_email DROP NOT NULL;
