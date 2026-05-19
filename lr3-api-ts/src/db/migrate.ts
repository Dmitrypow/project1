import fs from "fs";
import path from "path";
import { run, all, escapeSql } from "./dbClient";

export async function migrate(): Promise<void> {
  await run("PRAGMA foreign_keys = ON;");

  await run(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      appliedAt TEXT NOT NULL
    );
  `);

  const migrationsDir = path.join(__dirname, "migrations");
  if (!fs.existsSync(migrationsDir)) fs.mkdirSync(migrationsDir);

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied = await all<{ filename: string }>(
    "SELECT filename FROM schema_migrations;"
  );
  const appliedSet = new Set(applied.map((x) => x.filename));

  for (const file of files) {
    if (appliedSet.has(file)) continue;

    const sqlContent = fs.readFileSync(
      path.join(migrationsDir, file),
      "utf8"
    );
    const statements = sqlContent
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const sql of statements) {
      await run(sql + ";");
    }

    await run(
      `INSERT INTO schema_migrations (filename, appliedAt) VALUES ('${escapeSql(file)}', '${new Date().toISOString()}');`
    );
    console.log(`Migration applied: ${file}`);
  }
}
