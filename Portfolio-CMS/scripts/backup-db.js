const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Paths
const dbPath = path.join(__dirname, "..", "cms_database.db");
const backupsDir = path.join(__dirname, "..", "backups");
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
const backupPath = path.join(backupsDir, `backup_${timestamp}.db`);

// Create backups directory if it doesn't exist
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

console.log("🔄 Starting database backup...");
console.log(`📁 Source: ${dbPath}`);
console.log(`📦 Destination: ${backupPath}`);

// Copy database file
fs.copyFile(dbPath, backupPath, (err) => {
  if (err) {
    console.error("❌ Backup failed:", err);
    process.exit(1);
  }

  console.log("✅ Database backed up successfully!");

  // Clean up old backups (keep last 10)
  fs.readdir(backupsDir, (err, files) => {
    if (err) {
      console.error("Error reading backups directory:", err);
      return;
    }

    const backupFiles = files
      .filter((f) => f.startsWith("backup_") && f.endsWith(".db"))
      .sort()
      .reverse();

    if (backupFiles.length > 10) {
      const filesToDelete = backupFiles.slice(10);
      filesToDelete.forEach((file) => {
        fs.unlink(path.join(backupsDir, file), (err) => {
          if (err) {
            console.error(`Error deleting old backup ${file}:`, err);
          } else {
            console.log(`🗑️  Deleted old backup: ${file}`);
          }
        });
      });
    }

    console.log(`📊 Total backups: ${Math.min(backupFiles.length, 10)}`);
  });

  // Show backup size
  const stats = fs.statSync(backupPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`💾 Backup size: ${fileSizeInMB} MB`);
});
