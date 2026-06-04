import { all, get, run } from "../db/dbClient";
import { Pass, CreatePassDto, UpdatePassDto } from "../dtos/passes.dto";

export interface PassFilters {
  reason?: string;
  limit?: string | number;
}

export async function getAll(filters: PassFilters = {}): Promise<Pass[]> {
  const maxRows = Number(filters.limit) || 50;
  const params: unknown[] = [];

  let sql = `
    SELECT p.*, u.fullName as studentName, z.name as zoneName
    FROM Passes p
    JOIN Users u ON p.userId = u.id
    JOIN Zones z ON p.zoneId = z.id
    WHERE 1=1
  `;

  if (filters.reason) {
    sql += ` AND p.reason = ?`;
    params.push(filters.reason);
  }

  sql += ` ORDER BY p.id DESC LIMIT ${maxRows};`;

  return await all<Pass>(sql, params);
}

export async function getById(id: number | string): Promise<Pass | undefined> {
  return await get<Pass>(`SELECT * FROM Passes WHERE id = ?;`, [Number(id)]);
}

export async function add(dto: CreatePassDto): Promise<Pass | undefined> {
  const now = new Date().toISOString();
  const sql = `
    INSERT INTO Passes (userId, zoneId, reason, validUntil, issuerName, comment, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;
  const params = [
    Number(dto.userId),
    Number(dto.zoneId),
    dto.reason,
    dto.validUntil,
    dto.issuerName,
    dto.comment ?? "",
    now,
  ];
  const result = await run(sql, params);
  return await getById(result.lastID);
}

export async function update(
  id: number | string,
  dto: UpdatePassDto,
  ownerUserId?: number
): Promise<Pass | undefined | null> {
  const setClauses: string[] = [];
  const params: unknown[] = [];

  if (dto.userId !== undefined) { setClauses.push(`userId = ?`); params.push(Number(dto.userId)); }
  if (dto.zoneId !== undefined) { setClauses.push(`zoneId = ?`); params.push(Number(dto.zoneId)); }
  if (dto.reason !== undefined) { setClauses.push(`reason = ?`); params.push(dto.reason); }
  if (dto.validUntil !== undefined) { setClauses.push(`validUntil = ?`); params.push(dto.validUntil); }
  if (dto.issuerName !== undefined) { setClauses.push(`issuerName = ?`); params.push(dto.issuerName); }
  if (dto.comment !== undefined) { setClauses.push(`comment = ?`); params.push(dto.comment); }

  if (setClauses.length === 0) return await getById(id);

  params.push(Number(id));

  let sql = `UPDATE Passes SET ${setClauses.join(", ")} WHERE id = ?`;
  if (ownerUserId !== undefined) {
    sql += ` AND userId = ?`;
    params.push(ownerUserId);
  }
  sql += `;`;

  const result = await run(sql, params);
  if (result.changes === 0) return null;
  return await getById(id);
}

export async function remove(id: number | string, ownerUserId?: number): Promise<boolean> {
  let sql = `DELETE FROM Passes WHERE id = ?`;
  const params: unknown[] = [Number(id)];

  if (ownerUserId !== undefined) {
    sql += ` AND userId = ?`;
    params.push(ownerUserId);
  }
  sql += `;`;

  const result = await run(sql, params);
  return result.changes > 0;
}

export interface PassStats {
  totalPasses: number;
  byReason: { reason: string; count: number }[];
  avgPassesPerUser: number;
}

export async function getStats(): Promise<PassStats> {
  const totalRow = await get<{ total: number }>(
    "SELECT COUNT(*) as total FROM Passes;"
  );
  const total = totalRow?.total ?? 0;

  const byReason = await all<{ reason: string; count: number }>(`
    SELECT reason, COUNT(*) as count
    FROM Passes
    GROUP BY reason
    ORDER BY count DESC;
  `);

  const avgRow = await get<{ avg: number | null }>(`
    SELECT AVG(cnt) as avg
    FROM (SELECT COUNT(*) as cnt FROM Passes GROUP BY userId);
  `);
  const avg = avgRow?.avg ?? 0;

  return {
    totalPasses: total,
    byReason,
    avgPassesPerUser: Math.round(avg * 100) / 100,
  };
}

export interface TopStudentByReason {
  reason: string;
  rank: number;
  studentName: string;
  userId: number;
  passCount: number;
}

export async function getTopStudentsByReason(): Promise<TopStudentByReason[]> {
  const sql = `
    WITH counts AS (
      SELECT
        p.reason,
        p.userId,
        u.fullName AS studentName,
        COUNT(*) AS passCount
      FROM Passes p
      JOIN Users u ON p.userId = u.id
      GROUP BY p.reason, p.userId
    ),
    ranked AS (
      SELECT
        reason,
        userId,
        studentName,
        passCount,
        ROW_NUMBER() OVER (PARTITION BY reason ORDER BY passCount DESC) AS rank
      FROM counts
    )
    SELECT reason, rank, userId, studentName, passCount
    FROM ranked
    WHERE rank <= 3
    ORDER BY reason ASC, rank ASC;
  `;
  return await all<TopStudentByReason>(sql);
}

// export async function searchByIssuer(q: string): Promise<Pass[]> {
//   const sql = `
//     SELECT p.*, u.fullName as studentName, z.name as zoneName
//     FROM Passes p
//     JOIN Users u ON p.userId = u.id
//     JOIN Zones z ON p.zoneId = z.id
//     WHERE p.issuerName LIKE '%${q}%'
//     ORDER BY p.id DESC LIMIT 50;
//   `;
//   return await all<Pass>(sql);
// }

export async function searchByIssuer(q: string): Promise<Pass[]> {
  const sql = `
    SELECT p.*, u.fullName as studentName, z.name as zoneName
    FROM Passes p
    JOIN Users u ON p.userId = u.id
    JOIN Zones z ON p.zoneId = z.id
    WHERE p.issuerName LIKE ?
    ORDER BY p.id DESC
    LIMIT 50;
  `;
  return await all<Pass>(sql, [`%${q}%`]);
}
