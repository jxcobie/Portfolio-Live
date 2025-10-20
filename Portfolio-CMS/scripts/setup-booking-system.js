#!/usr/bin/env node

/**
 * Quick setup script for Calendar Booking System
 * Run: node setup-booking-system.js
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

console.log("\n🚀 Setting up Calendar Booking System...\n");

const dbPath = path.join(__dirname, "cms_database.db");
const db = new sqlite3.Database(dbPath);

const tables = [
  {
    name: "bookings",
    sql: `CREATE TABLE IF NOT EXISTS bookings (
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
    )`,
  },
  {
    name: "booking_reminders",
    sql: `CREATE TABLE IF NOT EXISTS booking_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id INTEGER NOT NULL,
      reminder_type TEXT CHECK(reminder_type IN ('confirmation', '24h', '1h')),
      sent_at DATETIME,
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    )`,
  },
  {
    name: "blocked_slots",
    sql: `CREATE TABLE IF NOT EXISTS blocked_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  },
];

const indexes = [
  "CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date)",
  "CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email)",
  "CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)",
  "CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots(date)",
];

db.serialize(() => {
  // Create tables
  tables.forEach((table) => {
    db.run(table.sql, (err) => {
      if (err) {
        console.error(`❌ Error creating ${table.name} table:`, err.message);
      } else {
        console.log(`✅ Table '${table.name}' created successfully`);
      }
    });
  });

  // Create indexes
  indexes.forEach((index) => {
    db.run(index, (err) => {
      if (err) {
        console.error(`❌ Error creating index:`, err.message);
      }
    });
  });

  console.log("\n✅ Database setup complete!");
  console.log("\n📋 Next steps:");
  console.log("   1. Install nodemailer: npm install nodemailer");
  console.log("   2. Add email config to .env (see BOOKING-SYSTEM-SETUP.md)");
  console.log(
    "   3. Add API routes to server.js (see BOOKING-SYSTEM-SETUP.md)",
  );
  console.log("   4. Create BookingCalendar component in frontend");
  console.log("   5. Add bookings section to admin panel");
  console.log("\n📖 Full setup guide: BOOKING-SYSTEM-SETUP.md\n");
});

db.close();
