# --- !Ups

CREATE TABLE published_issue_status (
    id               TEXT PRIMARY KEY
    , issue_id       TEXT REFERENCES edition_issues(id) ON DELETE CASCADE NOT NULL
    , status         TEXT NOT NULL
    , launched_on    TIMESTAMPTZ NOT NULL
    , launched_by    TEXT NOT NULL
    , launched_email TEXT NOT NULL
    , published_on   TIMESTAMPTZ
    , message        TEXT
);

# --- !Downs
DROP TABLE published_issue_status;
