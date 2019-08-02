# --- !Ups


ALTER TABLE fronts ADD COLUMN can_rename BOOLEAN NOT NULL DEFAULT FALSE;

# --- !Downs

ALTER TABLE fronts DROP COLUMN can_rename;


