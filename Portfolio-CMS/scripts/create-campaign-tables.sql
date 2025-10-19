-- Campaigns table (for different comment formats)
CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK(platform IN ('twitter', 'linkedin', 'instagram', 'other')),
  comment_format TEXT NOT NULL,
  description TEXT,
  target_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tracked links table
CREATE TABLE IF NOT EXISTS tracked_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Click events table (detailed tracking)
CREATE TABLE IF NOT EXISTS link_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  country TEXT,
  device_type TEXT CHECK(device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (link_id) REFERENCES tracked_links(id) ON DELETE CASCADE
);

-- Campaign performance summary (for quick analytics)
CREATE TABLE IF NOT EXISTS campaign_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER UNIQUE NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  avg_time_to_click INTEGER DEFAULT 0,
  last_click DATETIME,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_ip ON link_clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_tracked_links_short_code ON tracked_links(short_code);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON campaigns(platform);
