import { migrate } from "./migrate";
import { run } from "./dbClient";

async function seed(): Promise<void> {
  await migrate();
  const now = new Date().toISOString();

  // users
  await run(`INSERT OR IGNORE INTO Users (id, email, fullName, role, createdAt) VALUES (1, 'ivanov@test.com', 'Іванов Іван Іванович', 'Студент', '${now}');`);
  await run(`INSERT OR IGNORE INTO Users (id, email, fullName, role, createdAt) VALUES (2, 'petrenko@test.com', 'Петренко Олена Василівна', 'Студент', '${now}');`);
  await run(`INSERT OR IGNORE INTO Users (id, email, fullName, role, createdAt) VALUES (3, 'kovalenko@test.com', 'Коваленко Микола Петрович', 'Викладач', '${now}');`);
  await run(`INSERT OR IGNORE INTO Users (id, email, fullName, role, createdAt) VALUES (4, 'shevchenko@test.com', 'Шевченко Тарас Григорович', 'Адмін', '${now}');`);
  await run(`INSERT OR IGNORE INTO Users (id, email, fullName, role, createdAt) VALUES (5, 'bondarenko@test.com', 'Бондаренко Світлана', 'Студент', '${now}');`);

  // zones
  await run(`INSERT OR IGNORE INTO Zones (id, name, description) VALUES (1, 'Читальний зал', 'Тиха зона для роботи з книгами');`);
  await run(`INSERT OR IGNORE INTO Zones (id, name, description) VALUES (2, 'Медіатека', 'Комп''ютери та доступ до інтернету');`);
  await run(`INSERT OR IGNORE INTO Zones (id, name, description) VALUES (3, 'Коворкінг', 'Зона для групових проектів');`);

  // passes
  await run(`INSERT OR IGNORE INTO Passes (userId, zoneId, reason, validUntil, issuerName, comment, createdAt) VALUES (1, 1, 'Навчання', '2026-06-01', 'Коваленко М.П.', 'Доступ до Читального залу', '${now}');`);
  await run(`INSERT OR IGNORE INTO Passes (userId, zoneId, reason, validUntil, issuerName, comment, createdAt) VALUES (2, 2, 'Лабораторна робота', '2026-06-15', 'Коваленко М.П.', NULL, '${now}');`);

  console.log("Seed completed: 15 rows added.");
}

seed().catch(console.error);
