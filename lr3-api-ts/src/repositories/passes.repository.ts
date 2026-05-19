import { all, get, run, escapeSql } from "../db/dbClient";
import { Pass, CreatePassDto, UpdatePassDto } from "../dtos/passes.dto";

export interface PassFilters {
  reason?: string;
  limit?: string | number;
}

export async function getAll(filters: PassFilters = {}): Promise<Pass[]> {
  const maxRows = Number(filters.limit) || 50;
  let sql = `
    SELECT p.*, u.fullName as studentName, r.number as roomNumber
    FROM Passes p
    JOIN Users u ON p.userId = u.id
    JOIN Rooms r ON p.roomId = r.id
    WHERE 1=1
  `;
  if (filters.reason) {
    sql += ` AND p.reason = '${escapeSql(filters.reason)}'`;
  }
  sql += ` ORDER BY p.id DESC LIMIT ${maxRows};`;
  return await all<Pass>(sql);
}

export async function getById(id: number | string): Promise<Pass | undefined> {
  return await get<Pass>(`SELECT * FROM Passes WHERE id = ${Number(id)};`);
}

export async function add(dto: CreatePassDto): Promise<Pass | undefined> {
  const now = new Date().toISOString();
  const sql = `
    INSERT INTO Passes (userId, roomId, reason, validUntil, issuerName, comment, createdAt)
    VALUES (${Number(dto.userId)}, ${Number(dto.roomId)}, '${escapeSql(dto.reason)}', '${escapeSql(dto.validUntil)}', '${escapeSql(dto.issuerName)}', '${escapeSql(dto.comment ?? "")}', '${now}');
  `;
  const result = await run(sql);
  return await getById(result.lastID);
}

export async function update(id: number | string, dto: UpdatePassDto): Promise<Pass | undefined | null> {
  const updates: string[] = [];
  if (dto.userId !== undefined) updates.push(`userId = ${Number(dto.userId)}`);
  if (dto.roomId !== undefined) updates.push(`roomId = ${Number(dto.roomId)}`);
  if (dto.reason !== undefined) updates.push(`reason = '${escapeSql(dto.reason)}'`);
  if (dto.validUntil !== undefined) updates.push(`validUntil = '${escapeSql(dto.validUntil)}'`);
  if (dto.issuerName !== undefined) updates.push(`issuerName = '${escapeSql(dto.issuerName)}'`);
  if (dto.comment !== undefined) updates.push(`comment = '${escapeSql(dto.comment)}'`);

  if (updates.length === 0) return await getById(id);

  const result = await run(
    `UPDATE Passes SET ${updates.join(", ")} WHERE id = ${Number(id)};`
  );
  if (result.changes === 0) return null;
  return await getById(id);
}

export async function remove(id: number | string): Promise<boolean> {
  const result = await run(`DELETE FROM Passes WHERE id = ${Number(id)};`);
  return result.changes > 0;
}

// ─── Агрегація: статистика по пропусках ──────────────────────────────────────
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

// ─── Пошук (НАВМИСНО вразливий до SQLi — демо для ЛР) ──────────────────────
// УВАГА: цей endpoint використовує рядкову конкатенацію.
// Це НЕБЕЗПЕЧНО і зроблено навмисно для демонстрації SQL injection.
// Буде виправлено у ЛР5 через параметризовані запити.
export async function searchByIssuer(q: string): Promise<Pass[]> {
  // ⚠️ НЕБЕЗПЕЧНО: q вставляється в SQL без екранування
  const sql = `
    SELECT p.*, u.fullName as studentName, r.number as roomNumber
    FROM Passes p
    JOIN Users u ON p.userId = u.id
    JOIN Rooms r ON p.roomId = r.id
    WHERE p.issuerName LIKE '%${q}%'
    ORDER BY p.id DESC
    LIMIT 50;
  `;
  return await all<Pass>(sql);
}
