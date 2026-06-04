# REPORT — Лабораторна робота №5. Уразливості і захист

**Проект:** Система пропусків (Express + SQLite + TypeScript)  
**Рівень виконання:** «Добре» — сценарії A, В, Г  
**Середовище:** localhost, тестова БД `lab5.db`

---

## Таблиця ризиків

| Сценарій | Уразливість | Наслідок | Виправлення |
|---|---|---|---|
| A | SQL Injection у пошуку і фільтрі | Читання / маніпуляція даними БД | Параметризовані запити |
| В | IDOR при видаленні/редагуванні пропуску | Видалення чужих записів | Перевірка власника на бекенді |
| Г | Відсутність безпечних HTTP-заголовків | Clickjacking, MIME-sniffing | Security headers middleware |

---

## Сценарій А — SQL Injection

### Було (уразливо)

**Файл:** `src/repositories/passes.repository.ts`, функція `searchByIssuer`  
**Проблема:** рядок `q` з query-параметра вставляється напряму в SQL через шаблонний рядок.

```ts
// ВРАЗЛИВИЙ КОД
export async function searchByIssuer(q: string): Promise<Pass[]> {
  const sql = `
    SELECT p.*, u.fullName as studentName, z.name as zoneName
    FROM Passes p JOIN Users u ON p.userId = u.id JOIN Zones z ON p.zoneId = z.id
    WHERE p.issuerName LIKE '%${q}%'   // ← пряма підстановка рядка
    ORDER BY p.id DESC LIMIT 50;
  `;
  return await all<Pass>(sql);   // ← all() не приймала параметри взагалі
}
```

Також у `getAll()` фільтр по `reason` будувався через `escapeSql()` — це лише екранує одинарні лапки, але не є справжнім захистом.

```ts
// ВРАЗЛИВИЙ КОД — getAll()
if (filters.reason) {
  sql += ` AND p.reason = '${escapeSql(filters.reason)}'`;  // ← конкатенація
}
```

**Додатково:** функції `all()`, `get()`, `run()` у `dbClient.ts` приймали лише рядок SQL без параметрів — параметризація була архітектурно неможлива.

### Відтворення (до виправлення)

```
GET /api/v1/passes/search?q=%25' OR '1'='1
```

**Результат до виправлення:** повертає всі пропуски з БД незалежно від реального значення `issuerName`, оскільки умова `'1'='1'` завжди істинна. SQL, який виконується:

```sql
WHERE p.issuerName LIKE '%' OR '1'='1%'
```

### Виправлення

**1. `src/db/dbClient.ts`** — додано параметр `params: unknown[] = []` до всіх трьох функцій:

```ts
export function all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
  });
}
// аналогічно get() і run()
```

**2. `src/repositories/passes.repository.ts`** — `searchByIssuer` переписана на параметр:

```ts
// ВИПРАВЛЕНИЙ КОД
export async function searchByIssuer(q: string): Promise<Pass[]> {
  const sql = `
    WHERE p.issuerName LIKE ?   // ← плейсхолдер
    ORDER BY p.id DESC LIMIT 50;
  `;
  return await all<Pass>(sql, [`%${q}%`]);  // ← значення передається як дані
}
```

**3. `getAll()`** — фільтр `reason` також параметризовано:

```ts
if (filters.reason) {
  sql += ` AND p.reason = ?`;
  params.push(filters.reason);
}
return await all<Pass>(sql, params);
```

**Логіка виправлення:** драйвер SQLite передає параметри окремо від SQL-коду. Значення не може змінити структуру запиту — воно завжди трактується як дані, а не як SQL-оператори.

### Перевірка (після виправлення)

```
GET /api/v1/passes/search?q=%25' OR '1'='1
```

**Результат після виправлення:** `{ "items": [] }` — порожній масив, оскільки жоден `issuerName` буквально не містить рядок `' OR '1'='1`. Ін'єкція не спрацьовує.

```
GET /api/v1/passes/search?q=Коваленко
```

**Результат після виправлення:** коректно повертає пропуски з `issuerName LIKE '%Коваленко%'` — легітимний функціонал не зламано.

---

## Сценарій В — Broken Access Control / IDOR

### Було (уразливо)

**Файл:** `src/routes/passes.routes.ts`  
**Проблема:** маршрути `PUT /:id` і `DELETE /:id` не мали жодної перевірки особи користувача. Будь-хто міг видалити або змінити будь-який пропуск, знаючи його `id`.

```ts
// ВРАЗЛИВИЙ КОД
router.put("/:id", controller.update);    // ← без будь-якої автентифікації
router.delete("/:id", controller.remove); // ← без будь-якої автентифікації
```

У `passes.service.ts` функція `remove()` просто видаляла запис за `id` без перевірки, кому він належить:

```ts
export async function remove(id: string): Promise<void> {
  const deleted = await passesRepo.remove(id);
  if (!deleted) throw new ApiError(404, ...);
}
```

### Відтворення (до виправлення)

У БД є пропуск `id=1`, який належить користувачу `userId=1`.

```http
DELETE /api/v1/passes/1 HTTP/1.1
Host: localhost:3000
```

**Результат до виправлення:** `204 No Content` — пропуск видалено без будь-якого заголовка ідентифікації.

Аналогічно для `PUT`:
```http
PUT /api/v1/passes/1 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{ "issuerName": "Зловмисник" }
```

**Результат до виправлення:** `200 OK` — дані змінено.

### Виправлення

**1. Новий файл `src/middleware/demo-auth.middleware.ts`:**

```ts
export async function demoAuth(req, res, next): Promise<void> {
  const headerValue = req.header("X-Demo-UserId");

  if (!headerValue) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing X-Demo-UserId header" } });
    return;
  }

  const userId = Number(headerValue);
  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid X-Demo-UserId value" } });
    return;
  }

  const user = await usersRepo.getById(userId);
  if (!user) {
    res.status(401).json({ error: { code: "UNAUTHORIZED", message: "User not found" } });
    return;
  }

  req.currentUser = { id: userId };
  next();
}
```

**2. `src/routes/passes.routes.ts`** — middleware додано до захищених маршрутів:

```ts
router.put("/:id", demoAuth, controller.update);
router.delete("/:id", demoAuth, controller.remove);
```

**3. `src/services/passes.service.ts`** — перевірка власника перед операцією:

```ts
export async function remove(id: string, ownerUserId?: number): Promise<void> {
  const existing = await passesRepo.getById(id);
  if (!existing) throw new ApiError(404, "NOT_FOUND", ...);

  // Перевірка власника — якщо userId пропуску не збігається з currentUser → 404
  if (ownerUserId !== undefined && existing.userId !== ownerUserId) {
    throw new ApiError(404, "NOT_FOUND", `Pass with id "${id}" not found`);
  }

  await passesRepo.remove(id, ownerUserId);
}
```

**Обрана політика відповіді:** `404 Not Found` замість `403` — щоб не підтверджувати існування чужого запису.

**Логіка виправлення:** власник ресурсу визначається сервером (через заголовок, перевірений middleware), а не клієнтом. Фронтенд не може «сховати» проблему — перевірка завжди відбувається на бекенді.

### Перевірка (після виправлення)

**1) Без заголовка → 401:**
```http
DELETE /api/v1/passes/1 HTTP/1.1

→ 401 { "error": { "code": "UNAUTHORIZED", "message": "Missing X-Demo-UserId header" } }
```

**2) З чужим userId (userId=2 намагається видалити пропуск userId=1) → 404:**
```http
DELETE /api/v1/passes/1 HTTP/1.1
X-Demo-UserId: 2

→ 404 { "error": { "code": "NOT_FOUND", "message": "Pass with id \"1\" not found" } }
```

**3) Власник видаляє свій пропуск (userId=1 видаляє пропуск id=1) → 204:**
```http
DELETE /api/v1/passes/1 HTTP/1.1
X-Demo-UserId: 1

→ 204 No Content
```

Легітимний сценарій працює. IDOR усунено.

---

## Сценарій Г — Security Misconfiguration

### Було (до виправлення)

**Файл:** `src/index.ts`  
**Проблема:** у відповідях сервера були відсутні базові захисні HTTP-заголовки.

Перевірка до виправлення:
```
curl -I http://localhost:3000/health
```

Відповідь не містила:
- `X-Content-Type-Options` — браузер міг «вгадувати» MIME-тип відповіді
- `X-Frame-Options` — сторінка могла бути вбудована в `<iframe>` (clickjacking)
- `Referrer-Policy` — браузер міг надсилати повний URL у заголовку `Referer`

**Що вже було налаштовано правильно:**
- CORS обмежений конкретними origin (`localhost:5500`, `127.0.0.1:5500`) — не `*`
- `errorHandler` не повертає stack trace клієнту (`console.error` лише в логах)
- Усі помилки повертаються в єдиному форматі `{ error: { code, message } }`

### Виправлення

**`src/index.ts`** — додано middleware з безпечними заголовками (до роутів):

```ts
// Безпечні HTTP-заголовки
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});
```

Також до `allowedHeaders` у CORS додано `X-Demo-UserId`:
```ts
allowedHeaders: ["Content-Type", "Authorization", "X-Demo-UserId"],
```

**Пояснення заголовків:**
- `X-Content-Type-Options: nosniff` — браузер не буде «вгадувати» тип контенту, навіть якщо відповідь виглядає як скрипт
- `X-Frame-Options: DENY` — забороняє вбудовування сторінки в `<iframe>`, захист від clickjacking
- `Referrer-Policy: no-referrer` — браузер не надсилає `Referer` заголовок при переходах

### Перевірка (після виправлення)

```
curl -I http://localhost:3000/health
```

```
HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: no-referrer
Access-Control-Allow-Origin: ...
Content-Type: application/json
```

Усі три заголовки присутні у кожній відповіді сервера.

**Перевірка помилки без dev-деталей:**
```
DELETE /api/v1/passes/999 HTTP/1.1
X-Demo-UserId: 1

→ 404 { "error": { "code": "NOT_FOUND", "message": "Pass with id \"999\" not found" } }
```

Відповідь містить лише код і повідомлення — без stack trace, назв файлів, внутрішньої структури.

---

## Змінені файли

| Файл | Що змінено |
|---|---|
| `src/db/dbClient.ts` | Додано параметр `params[]` до `all()`, `get()`, `run()` |
| `src/repositories/passes.repository.ts` | Всі запити переписані на параметризовані; `searchByIssuer` — `LIKE ?` |
| `src/repositories/users.repository.ts` | Всі запити переписані на параметризовані |
| `src/middleware/demo-auth.middleware.ts` | Новий файл — middleware ідентифікації через `X-Demo-UserId` |
| `src/services/passes.service.ts` | `remove()` і `update()` приймають `ownerUserId`, перевіряють власника |
| `src/controllers/passes.controller.ts` | Передає `req.currentUser.id` у сервіс |
| `src/routes/passes.routes.ts` | `demoAuth` додано до `PUT /:id` і `DELETE /:id` |
| `src/index.ts` | Додано middleware безпечних заголовків; `X-Demo-UserId` у CORS |
