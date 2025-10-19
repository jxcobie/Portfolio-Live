-- Visitor sessions table (enhanced tracking)
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,
  first_visit DATETIME NOT NULL,
  last_visit DATETIME NOT NULL,
  page_views INTEGER DEFAULT 0,
  is_returning BOOLEAN DEFAULT 0,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_resolution TEXT,
  referrer_source TEXT,
  landing_page TEXT,
  exit_page TEXT,
  session_duration INTEGER DEFAULT 0,
  bounce BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Page views table (detailed)
CREATE TABLE IF NOT EXISTS page_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  page_url TEXT NOT NULL,
  page_title TEXT,
  time_on_page INTEGER DEFAULT 0,
  scroll_depth INTEGER DEFAULT 0,
  referrer TEXT,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES visitor_sessions(session_id)
);

-- Daily aggregated stats (for performance)
CREATE TABLE IF NOT EXISTS daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE UNIQUE NOT NULL,
  total_visitors INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  returning_visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  top_page TEXT,
  top_referrer TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
