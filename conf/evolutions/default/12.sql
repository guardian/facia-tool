# --- !Ups

ALTER TABLE collections
    DROP CONSTRAINT collection_index_must_be_unique,
    ADD CONSTRAINT collection_index_must_be_unique UNIQUE (front_id, index) deferrable initially immediate;

# --- !Downs

ALTER TABLE collections
    DROP CONSTRAINT collection_index_must_be_unique,
    ADD CONSTRAINT collection_index_must_be_unique UNIQUE (front_id, index);
