# --- !Ups

ALTER TABLE fronts RENAME COLUMN can_rename TO is_special;

# --- !Downs

ALTER TABLE fronts RENAME COLUMN is_special TO can_rename;
