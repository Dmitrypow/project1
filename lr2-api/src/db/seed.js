const { initDb } = require("./initDb");
const { run } = require("./dbClient");

async function seed() {
  await initDb();
  const now = new Date().toISOString();

  await run(`INSERT OR IGNORE INTO Users (email, fullName, role, createdAt) VALUES ('ivanov@test.com', 'Іванов Іван', 'Студент', '${now}');`);
  await run(`INSERT OR IGNORE INTO Rooms (number, capacity) VALUES ('301-A', 15);`);
  await run(`INSERT INTO Passes (userId, roomId, reason, validUntil, issuerName, comment, createdAt) VALUES (1, 1, 'Навчання', '2026-06-01', 'Шевченко Т.Г.', 'Тест', '${now}');`);

  console.log("Seed completed");
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});