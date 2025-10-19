-- Income records table
CREATE TABLE IF NOT EXISTS income_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  client_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_date DATE,
  invoice_number TEXT,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'received', 'overdue', 'cancelled')),
  category TEXT CHECK(category IN ('project', 'consulting', 'maintenance', 'other')),
  description TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- Monthly income summary
CREATE TABLE IF NOT EXISTS monthly_income (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_income DECIMAL(10,2) DEFAULT 0,
  project_income DECIMAL(10,2) DEFAULT 0,
  consulting_income DECIMAL(10,2) DEFAULT 0,
  maintenance_income DECIMAL(10,2) DEFAULT 0,
  other_income DECIMAL(10,2) DEFAULT 0,
  UNIQUE(year, month)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_income_date ON income_records(payment_date);
CREATE INDEX IF NOT EXISTS idx_income_status ON income_records(status);
CREATE INDEX IF NOT EXISTS idx_income_project ON income_records(project_id);
