-- !Ups

CREATE TABLE packages (
    id            TEXT    PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,

    name          TEXT    NOT NULL,
    is_hidden     BOOLEAN NOT NULL,
    web_metadata      JSONB,
    feast_metadata JSONB,
    prefill       TEXT,

    created_on    TIMESTAMPTZ    DEFAULT now(),
    created_by    TEXT,
    created_email TEXT,

    updated_on    TIMESTAMPTZ,
    updated_by    TEXT,
    updated_email TEXT
);

CREATE INDEX idxPackageName on packages(name);

CREATE TABLE package_cards (
    package_id    TEXT   REFERENCES packages(id) ON DELETE CASCADE NOT NULL,

	card_type	   TEXT 	  NOT NULL, -- 'article','recipe','chef', etc.
    page_code      TEXT        NOT NULL,
    index          INT         NOT NULL,

    metadata       JSONB,

    added_on       TIMESTAMPTZ NOT NULL,
    added_by       TEXT        NOT NULL,
    added_email    TEXT        NOT NULL,
	PRIMARY KEY (package_id, page_code)
);

CREATE INDEX idxPackageCards ON package_cards (package_id);

-- !Downs

DROP TABLE package_cards;
DROP TABLE packages CASCADE;
