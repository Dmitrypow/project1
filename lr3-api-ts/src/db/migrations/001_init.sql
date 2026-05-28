CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY,
    fullName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('Студент', 'Викладач', 'Адмін')),
    createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Zones (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS Passes (
    id INTEGER PRIMARY KEY,
    userId INTEGER NOT NULL,
    zoneId INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK (reason IN ('Навчання', 'Лабораторна робота', 'Робота над проектом', 'Технічне обслуговування')),
    validUntil TEXT NOT NULL,
    issuerName TEXT NOT NULL,
    comment TEXT,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (zoneId) REFERENCES Zones(id) ON DELETE CASCADE
);