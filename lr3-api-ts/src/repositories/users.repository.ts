import { all, get, run, escapeSql } from "../db/dbClient";
import { User, CreateUserDto, UpdateUserDto } from "../dtos/users.dto";

export async function getAll(): Promise<User[]> {
  return await all<User>("SELECT * FROM Users ORDER BY id DESC;");
}

export async function getById(id: number | string): Promise<User | undefined> {
  return await get<User>(`SELECT * FROM Users WHERE id = ${Number(id)};`);
}

export async function getByEmail(email: string): Promise<User | undefined> {
  return await get<User>(`SELECT * FROM Users WHERE email = '${escapeSql(email)}';`);
}

export async function add(dto: CreateUserDto): Promise<User | undefined> {
  const now = new Date().toISOString();
  const sql = `
    INSERT INTO Users (fullName, email, role, createdAt)
    VALUES ('${escapeSql(dto.fullName)}', '${escapeSql(dto.email)}', '${escapeSql(dto.role)}', '${now}');
  `;
  const result = await run(sql);
  return await getById(result.lastID);
}

export async function update(id: number | string, dto: UpdateUserDto): Promise<User | undefined | null> {
  const updates: string[] = [];
  if (dto.fullName) updates.push(`fullName = '${escapeSql(dto.fullName)}'`);
  if (dto.email) updates.push(`email = '${escapeSql(dto.email)}'`);
  if (dto.role) updates.push(`role = '${escapeSql(dto.role)}'`);

  if (updates.length === 0) return await getById(id);

  const result = await run(
    `UPDATE Users SET ${updates.join(", ")} WHERE id = ${Number(id)};`
  );
  if (result.changes === 0) return null;
  return await getById(id);
}

export async function remove(id: number | string): Promise<boolean> {
  const result = await run(`DELETE FROM Users WHERE id = ${Number(id)};`);
  return result.changes > 0;
}
