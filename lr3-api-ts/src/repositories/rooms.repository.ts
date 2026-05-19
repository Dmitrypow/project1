import { all, get, run, escapeSql } from "../db/dbClient";
import { Room, CreateRoomDto, UpdateRoomDto } from "../dtos/rooms.dto";

export async function getAll(): Promise<Room[]> {
  return await all<Room>("SELECT * FROM Rooms ORDER BY number ASC;");
}

export async function getById(id: number | string): Promise<Room | undefined> {
  return await get<Room>(`SELECT * FROM Rooms WHERE id = ${Number(id)};`);
}

export async function getByNumber(number: string): Promise<Room | undefined> {
  return await get<Room>(`SELECT * FROM Rooms WHERE number = '${escapeSql(number)}';`);
}

export async function add(dto: CreateRoomDto): Promise<Room | undefined> {
  const result = await run(`
    INSERT INTO Rooms (number, capacity)
    VALUES ('${escapeSql(dto.number)}', ${Number(dto.capacity)});
  `);
  return await getById(result.lastID);
}

export async function update(id: number | string, dto: UpdateRoomDto): Promise<Room | undefined | null> {
  const updates: string[] = [];
  if (dto.number !== undefined) updates.push(`number = '${escapeSql(dto.number)}'`);
  if (dto.capacity !== undefined) updates.push(`capacity = ${Number(dto.capacity)}`);

  if (updates.length === 0) return await getById(id);

  const result = await run(
    `UPDATE Rooms SET ${updates.join(", ")} WHERE id = ${Number(id)};`
  );
  if (result.changes === 0) return null;
  return await getById(id);
}

export async function remove(id: number | string): Promise<boolean> {
  const result = await run(`DELETE FROM Rooms WHERE id = ${Number(id)};`);
  return result.changes > 0;
}
