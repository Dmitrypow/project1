const { migrate } = require("./migrate");
const { run } = require("./dbClient");

async function seed() {
  await migrate();
  const now = new Date().toISOString();

  //users
  await run(`INSERT OR IGNORE INTO Users (id, email, fullName, role, createdAt) VALUES (1, 'ivanov@test.com', 'Іванов Іван Іванович', 'Студент', '${now}');`);
  await run(`INSERT OR IGNORE INTO Users (id, email, fullName, role, createdAt) VALUES (2, 'petrenko@test.com', 'Петренко Олена Василівна', 'Студент', '${now}');`);
  await run(`INSERT OR IGNORE INTO Users (id, email, fullName, role, createdAt) VALUES (3, 'kovalenko@test.com', 'Коваленко Микола Петрович', 'Викладач', '${now}');`);
  await run(`INSERT OR IGNORE INTO Users (id, email, fullName, role, createdAt) VALUES (4, 'shevchenko@test.com', 'Шевченко Тарас Григорович', 'Адмін', '${now}');`);
  await run(`INSERT OR IGNORE INTO Users (id, email, fullName, role, createdAt) VALUES (5, 'bondarenko@test.com', 'Бондаренко Світлана', 'Студент', '${now}');`);

  //rooms
  await run(`INSERT OR IGNORE INTO Rooms (id, number, capacity) VALUES (1, '301-A', 15);`);
  await run(`INSERT OR IGNORE INTO Rooms (id, number, capacity) VALUES (2, '204-Б', 20);`);
  await run(`INSERT OR IGNORE INTO Rooms (id, number, capacity) VALUES (3, '102', 30);`);

  //passes
  await run(`INSERT OR IGNORE INTO Passes (userId, roomId, reason, validUntil, issuerName, comment, createdAt) VALUES (1, 1, 'Лабораторна робота', '2026-06-01', 'Коваленко М.П.', 'Доступ до ПК №3', '${now}');`);
  await run(`INSERT OR IGNORE INTO Passes (userId, roomId, reason, validUntil, issuerName, comment, createdAt) VALUES (2, 1, 'Навчання', '2026-06-15', 'Коваленко М.П.', NULL, '${now}');`);
  await run(`INSERT OR IGNORE INTO Passes (userId, roomId, reason, validUntil, issuerName, comment, createdAt) VALUES (1, 2, 'Робота над проектом', '2026-07-01', 'Шевченко Т.Г.', 'Курсова робота', '${now}');`);
  await run(`INSERT OR IGNORE INTO Passes (userId, roomId, reason, validUntil, issuerName, comment, createdAt) VALUES (3, 3, 'Технічне обслуговування', '2026-05-20', 'Шевченко Т.Г.', 'Планова перевірка', '${now}');`);
  await run(`INSERT OR IGNORE INTO Passes (userId, roomId, reason, validUntil, issuerName, comment, createdAt) VALUES (5, 2, 'Навчання', '2026-06-30', 'Коваленко М.П.', NULL, '${now}');`);
  await run(`INSERT OR IGNORE INTO Passes (userId, roomId, reason, validUntil, issuerName, comment, createdAt) VALUES (2, 3, 'Лабораторна робота', '2026-06-10', 'Коваленко М.П.', 'ПК №7', '${now}');`);
  await run(`INSERT OR IGNORE INTO Passes (userId, roomId, reason, validUntil, issuerName, comment, createdAt) VALUES (4, 1, 'Технічне обслуговування', '2026-05-25', 'Шевченко Т.Г.', NULL, '${now}');`);

  console.log("Seed completed: 15 rows added.");
}

seed().catch(console.error);