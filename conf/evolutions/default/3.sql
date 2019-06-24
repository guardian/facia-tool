# --- !Ups

ALTER TABLE articles DROP COLUMN added_by;
ALTER TABLE articles DROP COLUMN added_email;

# --- !Downs

ALTER TABLE articles ADD COLUMN added_by TEXT;
ALTER TABLE articles ADD COLUMN added_email TEXT;
