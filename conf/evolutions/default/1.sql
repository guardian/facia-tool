# --- !Ups

-- TODO use uuid in raw form isntead of converting to text in various PK
CREATE EXTENSION "uuid-ossp";

CREATE TABLE edition_issues (
    id             TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name           TEXT NOT NULL,
    publish_date   TIMESTAMPTZ NOT NULL,

    created_on     TIMESTAMPTZ NOT NULL,
    created_by     TEXT NOT NULL,
    created_email  TEXT NOT NULL
);

CREATE TABLE fronts (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    issue_id      TEXT REFERENCES edition_issues(id) ON DELETE CASCADE NOT NULL,
    index         INT NOT NULL,

    name          TEXT NOT NULL,
    is_hidden     BOOLEAN NOT NULL,
    metadata      JSONB,

    updated_on    TIMESTAMPTZ,
    updated_by    TEXT,
    updated_email TEXT
);

ALTER TABLE fronts ADD CONSTRAINT issue_index_must_be_unique UNIQUE (issue_id, index);

CREATE TABLE collections (
    id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    front_id      TEXT REFERENCES fronts(id) ON DELETE CASCADE NOT NULL,
    index         INT NOT NULL,

    name          TEXT NOT NULL,
    prefill       TEXT,
    is_hidden     BOOLEAN NOT NULL,
    metadata      JSONB,

    updated_on    TIMESTAMPTZ,
    updated_by    TEXT,
    updated_email TEXT
);

ALTER TABLE collections ADD CONSTRAINT collection_index_must_be_unique UNIQUE (front_id, index);

CREATE TYPE PUBLICATION_STATUS AS ENUM (
    'live',
    'draft'
);

CREATE TABLE trails (
    collection_id  TEXT REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
    status         PUBLICATION_STATUS NOT NULL,
    id             TEXT NOT NULL,

    metadata       JSONB,

    added_on       TIMESTAMPTZ NOT NULL,
    added_by       TEXT,
    PRIMARY KEY (collection_id, status, id)
);

# --- !Downs

DROP TABLE edition_issues;

DROP TABLE fronts;

DROP TABLE collections;

DROP TABLE trails;
