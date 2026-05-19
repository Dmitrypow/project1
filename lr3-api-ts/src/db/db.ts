import path from "path";
import fs from "fs";
import sqlite3 from "sqlite3";

const dataDir = path.join(__dirname, "../../data");
const dbPath = path.join(dataDir, "app.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new (sqlite3.verbose().Database)(dbPath, (err) => {
  if (err) {
    console.error("Failed to open SQLite DB:", err.message);
    process.exit(1);
  }
  console.log("SQLite DB opened:", dbPath);
});

export { db };
