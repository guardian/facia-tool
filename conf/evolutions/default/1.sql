# --- !Ups

CREATE EXTENSION "uuid-ossp";

CREATE TABLE edition_issues (
    id             TEXT        PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    name           TEXT        NOT NULL,
    issue_date     TIMESTAMPTZ NOT NULL,
    timezone_id    TEXT        NOT NULL,

    created_on     TIMESTAMPTZ NOT NULL,
    created_by     TEXT        NOT NULL,
    created_email  TEXT        NOT NULL,

    launched_on    TIMESTAMPTZ,
    launched_by    TEXT,
    launched_email TEXT
);

CREATE INDEX edition_issues_issue_date_index ON edition_issues(issue_date);

CREATE TABLE fronts (
    id            TEXT    PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    issue_id      TEXT    REFERENCES edition_issues(id) ON DELETE CASCADE NOT NULL,
    index         INT     NOT NULL,

    name          TEXT    NOT NULL,
    is_hidden     BOOLEAN NOT NULL,
    metadata      JSONB,

    updated_on    TIMESTAMPTZ,
    updated_by    TEXT,
    updated_email TEXT
);

CREATE INDEX fronts_issue_id_index ON fronts(issue_id);
ALTER TABLE fronts ADD CONSTRAINT issue_index_must_be_unique UNIQUE (issue_id, index);

CREATE TABLE collections (
    id            TEXT    PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
    front_id      TEXT    REFERENCES fronts(id) ON DELETE CASCADE NOT NULL,
    index         INT     NOT NULL,

    name          TEXT    NOT NULL,
    is_hidden     BOOLEAN NOT NULL,
    metadata      JSONB,
    prefill       TEXT,

    updated_on    TIMESTAMPTZ,
    updated_by    TEXT,
    updated_email TEXT
);

CREATE INDEX collections_front_id_index ON collections(front_id);
ALTER TABLE collections ADD CONSTRAINT collection_index_must_be_unique UNIQUE (front_id, index);

CREATE TABLE articles (
    collection_id  TEXT        REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
    page_code      TEXT        NOT NULL,
    index          INT         NOT NULL,

    metadata       JSONB,

    added_on       TIMESTAMPTZ NOT NULL,
    added_by       TEXT        NOT NULL,
    added_email    TEXT        NOT NULL,
    PRIMARY KEY (collection_id, page_code, index)
);

CREATE INDEX article_collection_id_index ON articles(collection_id);
ALTER TABLE articles ADD CONSTRAINT article_index_must_be_unique UNIQUE (collection_id, index);

# --- !Downs

DROP TABLE edition_issues;
DROP INDEX edition_issues_issue_date_index;

DROP TABLE fronts;
DROP INDEX fronts_issue_id_index;

DROP TABLE collections;
DROP INDEX collections_front_id_index;

DROP TABLE articles;
DROP INDEX article_collection_id_index;

