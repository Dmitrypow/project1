CREATE INDEX IF NOT EXISTS idx_passes_userId ON Passes(userId);
CREATE INDEX IF NOT EXISTS idx_passes_zoneId ON Passes(zoneId);
CREATE INDEX IF NOT EXISTS idx_zones_name ON Zones(name);