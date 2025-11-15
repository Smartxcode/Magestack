CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  last_fetched DATETIME NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
  title,
  content,
  source UNINDEXED,
  url UNINDEXED,
  tokenize = 'unicode61 remove_diacritics 2',
  content='documents',
  content_rowid='id'
);

CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
  INSERT INTO documents_fts(rowid, title, content, source, url)
  VALUES (new.id, new.title, new.content, new.source, new.url);
END;

CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
  INSERT INTO documents_fts(documents_fts, rowid, title, content, source, url)
  VALUES('delete', old.id, old.title, old.content, old.source, old.url);
END;

CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
  INSERT INTO documents_fts(documents_fts, rowid, title, content, source, url)
  VALUES('delete', old.id, old.title, old.content, old.source, old.url);
  INSERT INTO documents_fts(rowid, title, content, source, url)
  VALUES (new.id, new.title, new.content, new.source, new.url);
END;
