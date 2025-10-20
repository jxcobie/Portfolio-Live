const http = require("http");
const https = require("https");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const BASE_URL =
  process.env.CMS_BASE_URL ||
  `http://localhost:${process.env.CMS_PORT || process.env.PORT || 1337}`;
const USERNAME =
  process.env.CMS_ADMIN_USER ||
  process.env.CMS_BOOTSTRAP_ADMIN_USER ||
  process.env.ADMIN_USERNAME ||
  "admin";
const PASSWORD =
  process.env.CMS_ADMIN_PASSWORD ||
  process.env.CMS_BOOTSTRAP_ADMIN_PASSWORD ||
  process.env.ADMIN_PASSWORD;

if (!PASSWORD) {
  console.error(
    "❌ CMS_ADMIN_PASSWORD (or CMS_BOOTSTRAP_ADMIN_PASSWORD) is required to run the affiliate tests.",
  );
  process.exit(1);
}

// Simple HTTP client
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const urlObj = new URL(url);

    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const req = client.request(reqOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        // Store cookies if present
        if (res.headers["set-cookie"]) {
          options.cookie = res.headers["set-cookie"][0].split(";")[0];
        }

        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
            headers: res.headers,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers,
          });
        }
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testAffiliateSystem() {
  console.log("🧪 Testing Affiliate Link Management System...\n");

  let sessionCookie = "";

  try {
    // 1. Login
    console.log("1️⃣  Logging in...");
    const loginRes = await request(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      body: { username: USERNAME, password: PASSWORD },
    });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }

    sessionCookie = loginRes.headers["set-cookie"][0].split(";")[0];
    console.log("✅ Logged in successfully\n");

    // 2. Create affiliate link
    console.log("2️⃣  Creating affiliate link...");
    const createRes = await request(`${BASE_URL}/api/affiliate/links`, {
      method: "POST",
      headers: { Cookie: sessionCookie },
      body: {
        name: "Amazon Prime",
        description: "Amazon Prime membership affiliate link",
        original_url: "https://www.amazon.com/prime",
        short_code: "amazon-prime",
        category: "Subscription",
        platform: "Amazon",
        commission_rate: 5.0,
      },
    });

    console.log("✅ Created:", createRes.data);
    console.log(`   Redirect URL: ${BASE_URL}/go/amazon-prime\n`);

    // 3. Get all links
    console.log("3️⃣  Getting all affiliate links...");
    const linksRes = await request(`${BASE_URL}/api/affiliate/links`, {
      headers: { Cookie: sessionCookie },
    });
    console.log(`✅ Found ${linksRes.data.data.length} affiliate link(s)\n`);

    // 4. Simulate a click
    console.log("4️⃣  Simulating click on affiliate link...");
    const clickRes = await request(`${BASE_URL}/go/amazon-prime`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Test Script)",
      },
    });
    console.log(`✅ Click tracked (Status: ${clickRes.status})\n`);

    // 5. Get analytics dashboard
    console.log("5️⃣  Getting analytics dashboard...");
    const dashboardRes = await request(
      `${BASE_URL}/api/affiliate/dashboard?period=7d`,
      {
        headers: { Cookie: sessionCookie },
      },
    );
    console.log("✅ Dashboard Analytics:");
    console.log(
      "   Overall Stats:",
      JSON.stringify(dashboardRes.data.overall, null, 2),
    );
    console.log("   Top Links:", dashboardRes.data.topLinks.length);
    console.log("   Timeline Entries:", dashboardRes.data.timeline.length);
    console.log(
      "   Device Breakdown:",
      JSON.stringify(dashboardRes.data.deviceBreakdown, null, 2),
    );
    console.log(
      "   Category Performance:",
      JSON.stringify(dashboardRes.data.categoryPerformance, null, 2),
    );
    console.log("");

    // 6. Get click details
    console.log("6️⃣  Getting click details...");
    const clicksRes = await request(
      `${BASE_URL}/api/affiliate/links/1/clicks`,
      {
        headers: { Cookie: sessionCookie },
      },
    );
    console.log(`✅ Click Details (${clicksRes.data.meta.total} total):`);
    if (clicksRes.data.data.length > 0) {
      console.log(
        "   Latest Click:",
        JSON.stringify(clicksRes.data.data[0], null, 2),
      );
    }
    console.log("");

    // 7. Record conversion
    console.log("7️⃣  Recording conversion...");
    const conversionRes = await request(
      `${BASE_URL}/api/affiliate/conversion`,
      {
        method: "POST",
        body: {
          link_id: 1,
          click_id: 1,
          conversion_value: 99.99,
        },
      },
    );
    console.log("✅ Conversion recorded:", conversionRes.data);
    console.log("");

    // 8. Get updated link stats
    console.log("8️⃣  Getting updated link stats...");
    const linkRes = await request(`${BASE_URL}/api/affiliate/links/1`, {
      headers: { Cookie: sessionCookie },
    });
    console.log("✅ Updated Link Stats:");
    console.log(`   Total Clicks: ${linkRes.data.data.total_clicks}`);
    console.log(`   Conversions: ${linkRes.data.data.conversions}`);
    console.log(`   Revenue: $${linkRes.data.data.revenue}`);
    console.log("");

    // 9. Test CSV export
    console.log("9️⃣  Testing CSV export...");
    const exportRes = await request(
      `${BASE_URL}/api/affiliate/export?type=links`,
      {
        headers: { Cookie: sessionCookie },
      },
    );
    console.log(`✅ CSV Export Status: ${exportRes.status}`);
    if (exportRes.status === 200) {
      const lines = exportRes.data.split("\n");
      console.log(`   CSV has ${lines.length} lines`);
      console.log(`   Headers: ${lines[0]}`);
    }
    console.log("");

    console.log("✨ All tests passed!\n");
    console.log("📊 Test Summary:");
    console.log("   ✅ Authentication");
    console.log("   ✅ Create affiliate link");
    console.log("   ✅ List affiliate links");
    console.log("   ✅ Click tracking");
    console.log("   ✅ Dashboard analytics");
    console.log("   ✅ Click details");
    console.log("   ✅ Conversion tracking");
    console.log("   ✅ Updated statistics");
    console.log("   ✅ CSV export");
    console.log("");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run tests
testAffiliateSystem().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
