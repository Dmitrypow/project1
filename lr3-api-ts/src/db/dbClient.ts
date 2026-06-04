import { db } from "./db";

export interface RunResult {
  lastID: number;
  changes: number;
}

export function all<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: Error | null, rows: T[]) =>
      err ? reject(err) : resolve(rows)
    );
  });
}

export function get<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: Error | null, row: T) =>
      err ? reject(err) : resolve(row)
    );
  });
}

export function run(sql: string, params: unknown[] = []): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (this: any, err: Error | null) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function escapeSql(str: unknown): string {
  if (str === null || str === undefined) return "";
  return String(str).replace(/'/g, "''");
}
