import { all } from "../db/dbClient";
import { Zone } from "../dtos/zones.dto";

export async function getAll(): Promise<Zone[]> {
  return await all<Zone>("SELECT * FROM Zones ORDER BY name ASC;");
}