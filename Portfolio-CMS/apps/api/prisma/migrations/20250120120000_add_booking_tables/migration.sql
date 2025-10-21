-- Generated via `prisma migrate diff --from-url --to-schema-datamodel`
-- Adds booking and scheduling tables required for modernized CMS
CREATE TABLE "bookings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "meeting_type" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT DEFAULT 'confirmed',
    "meeting_link" TEXT,
    "google_event_id" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "booking_reminders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "booking_id" INTEGER NOT NULL,
    "reminder_type" TEXT,
    "sent_at" DATETIME,
    CONSTRAINT "booking_reminders_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "working_hours" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "is_working" BOOLEAN DEFAULT true,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "availability_overrides" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "is_available" BOOLEAN NOT NULL,
    "custom_hours" TEXT,
    "reason" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "blocked_slots" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "available_slots" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "slot_duration" INTEGER DEFAULT 30,
    "notes" TEXT,
    "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_bookings_date" ON "bookings"("date");
CREATE INDEX "idx_bookings_status" ON "bookings"("status");
CREATE INDEX "booking_reminders_booking_id_idx" ON "booking_reminders"("booking_id");
CREATE UNIQUE INDEX "availability_overrides_date_key" ON "availability_overrides"("date");
CREATE INDEX "idx_availability_overrides_date" ON "availability_overrides"("date");
CREATE INDEX "idx_blocked_slots_date" ON "blocked_slots"("date");
CREATE INDEX "idx_available_slots_date" ON "available_slots"("date");
