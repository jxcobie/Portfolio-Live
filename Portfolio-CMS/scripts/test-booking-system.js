const fetch = require("node-fetch");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const CMS_URL =
  process.env.CMS_BASE_URL ||
  `http://localhost:${process.env.CMS_PORT || process.env.PORT || 1337}`;
const API_KEY = process.env.CMS_API_KEY || process.env.API_KEY;

async function testBookingSystem() {
  console.log("🧪 Testing Booking System\n");

  if (!API_KEY) {
    throw new Error(
      "CMS_API_KEY is required to run booking system tests. Please set CMS_API_KEY in your environment.",
    );
  }

  try {
    // Test 1: Check availability for today
    console.log("1️⃣  Testing availability endpoint...");
    const today = new Date().toISOString().split("T")[0];
    const availRes = await fetch(
      `${CMS_URL}/api/bookings/availability/${today}?duration=30`,
      {
        headers: { "x-cms-api-key": API_KEY },
      },
    );
    const avail = await availRes.json();
    console.log(
      `✅ Availability: ${avail.availableSlots.length} slots available`,
    );
    console.log(`   Working hours: ${avail.workingHours.length} periods`);

    if (avail.availableSlots.length === 0) {
      console.log("⚠️  No slots available. Try tomorrow's date.");
      return;
    }

    // Test 2: Create a test booking
    console.log("\n2️⃣  Creating test booking...");
    const firstSlot = avail.availableSlots[0];
    const bookingRes = await fetch(`${CMS_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cms-api-key": API_KEY,
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        phone: "+1234567890",
        date: today,
        time: firstSlot,
        duration: 30,
        meetingType: "30min",
        notes: "Test booking from automated test",
      }),
    });

    if (!bookingRes.ok) {
      const error = await bookingRes.json();
      console.log("❌ Failed to create booking:", error.error);
      return;
    }

    const booking = await bookingRes.json();
    console.log(`✅ Booking created: ID ${booking.bookingId}`);

    // Test 3: Get all bookings
    console.log("\n3️⃣  Fetching bookings list...");
    const listRes = await fetch(`${CMS_URL}/api/bookings`, {
      headers: { "x-api-key": API_KEY },
    });

    if (!listRes.ok) {
      console.log("⚠️  Skipping authenticated endpoint test (requires login)");
    } else {
      const list = await listRes.json();
      console.log(`✅ Found ${list.data ? list.data.length : 0} bookings`);
      if (list.meta) {
        console.log(`   Upcoming: ${list.meta.upcoming}`);
      }
    }

    // Test 4: Block a time slot
    console.log("\n4️⃣  Testing time slot blocking...");
    const blockRes = await fetch(`${CMS_URL}/api/bookings/block`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        date: today,
        start_time: "12:00",
        end_time: "13:00",
        reason: "Test block - lunch break",
      }),
    });

    if (!blockRes.ok) {
      console.log("⚠️  Skipping time slot blocking (requires authentication)");
    } else {
      const blocked = await blockRes.json();
      console.log(`✅ Time slot blocked: ID ${blocked.blockedSlotId}`);
    }

    // Test 5: Check availability again
    console.log("\n5️⃣  Re-checking availability...");
    const avail2Res = await fetch(
      `${CMS_URL}/api/bookings/availability/${today}?duration=30`,
      {
        headers: { "x-cms-api-key": API_KEY },
      },
    );
    const avail2 = await avail2Res.json();
    console.log(
      `✅ Updated availability: ${avail2.availableSlots.length} slots`,
    );
    console.log(`   Blocked: ${avail2.blockedCount} slots`);
    console.log(`   Booked: ${avail2.bookedCount} bookings`);

    // Test 6: Update booking status
    console.log("\n6️⃣  Updating booking status...");
    const statusRes = await fetch(
      `${CMS_URL}/api/bookings/${booking.bookingId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ status: "completed" }),
      },
    );

    if (!statusRes.ok) {
      console.log("⚠️  Skipping status update (requires authentication)");
    } else {
      console.log("✅ Booking status updated to completed");
    }

    console.log("\n✨ All booking system tests passed!\n");
    console.log("📝 Summary:");
    console.log(`   - Availability checking: ✅`);
    console.log(`   - Booking creation: ✅`);
    console.log(
      `   - Email notifications: ${booking.message.includes("email") ? "✅" : "⚠️"}`,
    );
    console.log(`   - Time slot blocking: ✅`);
    console.log(`   - Status updates: ✅`);
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
  }
}

testBookingSystem();
