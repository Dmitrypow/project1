const { all, get, run, escapeSql } = require("../db/dbClient");

async function getAll({ reason, limit } = {}) {
  const maxRows = Number(limit) || 50;
  let sql = `
    SELECT p.*, u.fullName as studentName, r.number as roomNumber 
    FROM Passes p
    JOIN Users u ON p.userId = u.id
    JOIN Rooms r ON p.roomId = r.id
    WHERE 1=1
  `;
  if (reason) {
    sql += ` AND p.reason = '${escapeSql(reason)}'`;
  }
  sql += ` ORDER BY p.id DESC LIMIT ${maxRows};`;
  return await all(sql);
}

async function getById(id) {
  return await get(`SELECT * FROM Passes WHERE id = ${Number(id)};`);
}

async function add(dto) {
  const now = new Date().toISOString();
  const sql = `
    INSERT INTO Passes (userId, roomId, reason, validUntil, issuerName, comment, createdAt)
    VALUES (${Number(dto.userId)}, ${Number(dto.roomId)}, '${escapeSql(dto.reason)}', '${escapeSql(dto.validUntil)}', '${escapeSql(dto.issuerName)}', '${escapeSql(dto.comment || "")}', '${now}');
  `;
  const result = await run(sql);
  return await getById(result.lastID);
}

async function update(id, dto) {
  const updates = [];
  if (dto.userId) updates.push(`userId = ${Number(dto.userId)}`);
  if (dto.roomId) updates.push(`roomId = ${Number(dto.roomId)}`);
  if (dto.reason) updates.push(`reason = '${escapeSql(dto.reason)}'`);
  if (dto.validUntil) updates.push(`validUntil = '${escapeSql(dto.validUntil)}'`);
  if (dto.issuerName) updates.push(`issuerName = '${escapeSql(dto.issuerName)}'`);
  if (dto.comment !== undefined) updates.push(`comment = '${escapeSql(dto.comment)}'`);

  if (updates.length === 0) return await getById(id);

  const result = await run(`UPDATE Passes SET ${updates.join(', ')} WHERE id = ${Number(id)};`);
  if (result.changes === 0) return null;
  return await getById(id);
}

async function remove(id) {
  const result = await run(`DELETE FROM Passes WHERE id = ${Number(id)};`);
  return result.changes > 0;
}

module.exports = { getAll, getById, add, update, remove };