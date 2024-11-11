# --- !Ups

ALTER TABLE articles RENAME TO cards;
ALTER TABLE cards ADD COLUMN card_type TEXT NOT NULL DEFAULT 'article';
ALTER TABLE cards RENAME COLUMN page_code TO id;

# --- !Downs

ALTER TABLE cards RENAME COLUMN id TO page_code;
ALTER TABLE cards DROP COLUMN card_type;
ALTER TABLE cards RENAME TO articles;
