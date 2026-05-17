-- Run this in the Supabase SQL Editor to set up your database
-- Run this first to drop old tables (if re-running):
--   DROP TABLE IF EXISTS books CASCADE;
--   DROP TABLE IF EXISTS bibs CASCADE;

CREATE TABLE IF NOT EXISTS bibs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bib_id UUID NOT NULL REFERENCES bibs(id) ON DELETE CASCADE,
  isbn TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT '',
  cover_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  genre TEXT NOT NULL DEFAULT '',
  added_at TIMESTAMPTZ DEFAULT now(),
  is_new BOOLEAN DEFAULT true,
  raw_data TEXT
);

CREATE INDEX IF NOT EXISTS books_bib_id_idx ON books(bib_id);
CREATE UNIQUE INDEX IF NOT EXISTS books_bib_id_isbn_unique ON books(bib_id, isbn);
