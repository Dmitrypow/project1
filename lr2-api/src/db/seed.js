const { migrate } = require("./migrate");
const { run } = require("./dbClient");

async function seed() {
  await migrate();
  const now = new Date().toISOString();

  await run(`INSERT OR IGNORE INTO Users (id, email, fullName, role, createdAt) VALUES (1, 'ivanov@test.com', 'Іванов Іван', 'Студент', '${now}');`);
  await run(`INSERT OR IGNORE INTO Rooms (id, number, capacity) VALUES (1, '301-A', 15);`);
  await run(`INSERT OR IGNORE INTO Passes (userId, roomId, reason, validUntil, issuerName, comment, createdAt) VALUES (1, 1, 'Лабораторна робота', '2026-06-01', 'Петров В.В.', 'Тест', '${now}');`);

  console.log("Seed completed: 5-20 rows added.");
}

seed().catch(console.error);