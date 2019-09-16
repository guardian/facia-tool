# --- !Ups

CREATE TABLE issue_versions (
  id               TEXT PRIMARY KEY
  , issue_id       TEXT REFERENCES edition_issues(id) ON DELETE CASCADE NOT NULL
  , launched_on    TIMESTAMPTZ NOT NULL
  , launched_by    TEXT NOT NULL
  , launched_email TEXT NOT NULL
);

CREATE TABLE issue_versions_events (
  version_id   TEXT REFERENCES issue_versions(id) ON DELETE CASCADE NOT NULL
  , event_time TIMESTAMPTZ NOT NULL
  , status     TEXT NOT NULL
  , message    TEXT
  , PRIMARY KEY (version_id, event_time)
);

# --- !Downs
DROP TABLE issue_versions_events;
DROP TABLE issue_versions;
