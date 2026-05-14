const { run } = require("./dbClient");

async function initDb() {
  await run("PRAGMA foreign_keys = ON;");

  await run(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('Студент', 'Викладач', 'Адмін')),
      createdAt TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Rooms (
      id INTEGER PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      capacity INTEGER NOT NULL CHECK (capacity > 0)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Passes (
      id INTEGER PRIMARY KEY,
      userId INTEGER NOT NULL,
      roomId INTEGER NOT NULL,
      reason TEXT NOT NULL CHECK (reason IN ('Навчання', 'Лабораторна робота', 'Робота над проектом', 'Технічне обслуговування')),
      validUntil TEXT NOT NULL,
      issuerName TEXT NOT NULL,
      comment TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY (roomId) REFERENCES Rooms(id) ON DELETE CASCADE
    );
  `);

  console.log("DB schema initialized");
}

module.exports = { initDb };