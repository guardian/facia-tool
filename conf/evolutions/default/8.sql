# --- !Ups

CREATE TABLE edition_issues_publication_history (
    id               TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT
    , issue_id       TEXT REFERENCES edition_issues(id) ON DELETE CASCADE NOT NULL
    , status         TEXT NOT NULL
    , launched_on    TIMESTAMPTZ NOT NULL
    , launched_by    TEXT NOT NULL
    , launched_email TEXT NOT NULL
    , published_on   TIMESTAMPTZ
    , message        TEXT
);

# --- !Downs
DROP TABLE edition_issues_publication_history;
