const { all, get, run, escapeSql } = require("../db/dbClient");

async function getAll() {
  return await all("SELECT * FROM Users ORDER BY id DESC;");
}

async function getById(id) {
  return await get(`SELECT * FROM Users WHERE id = ${Number(id)};`);
}

async function getByEmail(email) {
  return await get(`SELECT * FROM Users WHERE email = '${escapeSql(email)}';`);
}

async function add(dto) {
  const now = new Date().toISOString();
  const sql = `
    INSERT INTO Users (fullName, email, role, createdAt)
    VALUES ('${escapeSql(dto.fullName)}', '${escapeSql(dto.email)}', '${escapeSql(dto.role)}', '${now}');
  `;
  const result = await run(sql);
  return await getById(result.lastID);
}

async function update(id, dto) {
  const updates = [];
  if (dto.fullName) updates.push(`fullName = '${escapeSql(dto.fullName)}'`);
  if (dto.email) updates.push(`email = '${escapeSql(dto.email)}'`);
  if (dto.role) updates.push(`role = '${escapeSql(dto.role)}'`);
  
  if (updates.length === 0) return await getById(id);

  const result = await run(`UPDATE Users SET ${updates.join(', ')} WHERE id = ${Number(id)};`);
  if (result.changes === 0) return null;
  return await getById(id);
}

async function remove(id) {
  const result = await run(`DELETE FROM Users WHERE id = ${Number(id)};`);
  return result.changes > 0;
}

module.exports = { getAll, getById, getByEmail, add, update, remove };