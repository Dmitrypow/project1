import { all, get, run } from "../db/dbClient";
import { User, CreateUserDto, UpdateUserDto } from "../dtos/users.dto";

export async function getAll(): Promise<User[]> {
  return await all<User>("SELECT * FROM Users ORDER BY id DESC;");
}

export async function getById(id: number | string): Promise<User | undefined> {
  return await get<User>(`SELECT * FROM Users WHERE id = ?;`, [Number(id)]);
}

export async function getByEmail(email: string): Promise<User | undefined> {
  return await get<User>(`SELECT * FROM Users WHERE email = ?;`, [email]);
}

export async function add(dto: CreateUserDto): Promise<User | undefined> {
  const now = new Date().toISOString();
  const sql = `
    INSERT INTO Users (fullName, email, role, createdAt)
    VALUES (?, ?, ?, ?);
  `;
  const result = await run(sql, [dto.fullName, dto.email, dto.role, now]);
  return await getById(result.lastID);
}

export async function update(id: number | string, dto: UpdateUserDto): Promise<User | undefined | null> {
  const setClauses: string[] = [];
  const params: unknown[] = [];

  if (dto.fullName) { setClauses.push(`fullName = ?`); params.push(dto.fullName); }
  if (dto.email)    { setClauses.push(`email = ?`);    params.push(dto.email); }
  if (dto.role)     { setClauses.push(`role = ?`);     params.push(dto.role); }

  if (setClauses.length === 0) return await getById(id);

  params.push(Number(id));
  const result = await run(
    `UPDATE Users SET ${setClauses.join(", ")} WHERE id = ?;`,
    params
  );
  if (result.changes === 0) return null;
  return await getById(id);
}

export async function remove(id: number | string): Promise<boolean> {
  const result = await run(`DELETE FROM Users WHERE id = ?;`, [Number(id)]);
  return result.changes > 0;
}
