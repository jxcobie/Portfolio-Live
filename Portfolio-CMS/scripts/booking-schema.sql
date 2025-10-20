-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration INTEGER NOT NULL,
  meeting_type TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'confirmed' CHECK(status IN ('confirmed', 'cancelled', 'completed', 'no-show')),
  meeting_link TEXT,
  google_event_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Working hours configuration (default schedule)
CREATE TABLE IF NOT EXISTS working_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  is_working BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Day-specific availability overrides
CREATE TABLE IF NOT EXISTS availability_overrides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  is_available BOOLEAN NOT NULL,
  custom_hours TEXT,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Time slot blocks (specific time periods blocked)
CREATE TABLE IF NOT EXISTS blocked_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Available slots (custom available periods for specific dates)
CREATE TABLE IF NOT EXISTS available_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  slot_duration INTEGER DEFAULT 30,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_availability_overrides_date ON availability_overrides(date);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots(date);
CREATE INDEX IF NOT EXISTS idx_available_slots_date ON available_slots(date);

-- Insert default working hours (Monday-Friday, 9AM-5PM, skip 12-1PM lunch)
INSERT INTO working_hours (day_of_week, start_time, end_time, is_working) VALUES
  (1, '09:00', '12:00', 1), -- Monday morning
  (1, '13:00', '17:00', 1), -- Monday afternoon
  (2, '09:00', '12:00', 1), -- Tuesday morning
  (2, '13:00', '17:00', 1), -- Tuesday afternoon
  (3, '09:00', '12:00', 1), -- Wednesday morning
  (3, '13:00', '17:00', 1), -- Wednesday afternoon
  (4, '09:00', '12:00', 1), -- Thursday morning
  (4, '13:00', '17:00', 1), -- Thursday afternoon
  (5, '09:00', '12:00', 1), -- Friday morning
  (5, '13:00', '17:00', 1), -- Friday afternoon
  (0, '09:00', '17:00', 0), -- Sunday (not working)
  (6, '09:00', '17:00', 0); -- Saturday (not working)
