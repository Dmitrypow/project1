# lr2-api — Система пропусків (TypeScript + SQLite)

Бекенд REST API для управління пропусками у навчальному закладі.  
Реалізовано на **Node.js + Express + TypeScript + SQLite** (без ORM, без параметризованих запитів — навмисно, згідно з умовами ЛР3).

---

## Запуск

```bash
npm install
npm run dev        # ts-node-dev з hot-reload
# або
npm run build && npm start   # скомпільована версія
```

### Заповнити базу тестовими даними

```bash
npm run seed
```

---

## База даних

SQLite-файл зберігається у `./data/app.db` (директорія створюється автоматично).  
Файл **не комітиться** в репозиторій — додано до `.gitignore`.

### Міграції

При кожному старті застосунок:
1. Читає файли `src/db/migrations/*.sql` (відсортовані за іменем)
2. Порівнює із таблицею `schema_migrations`
3. Виконує лише ті, що ще не були застосовані

---

## Схема БД

### Таблиці та зв'язки

```
Users (1) ──< Passes (N) >── Rooms (1)
```

| Таблиця | Призначення |
|---------|-------------|
| `Users` | Користувачі системи (студенти, викладачі, адміни) |
| `Rooms` | Аудиторії / приміщення |
| `Passes` | Пропуски — зв'язок між User і Room |

### Users

| Поле | Тип | Обмеження |
|------|-----|-----------|
| id | INTEGER | PRIMARY KEY |
| fullName | TEXT | NOT NULL |
| email | TEXT | NOT NULL, UNIQUE |
| role | TEXT | NOT NULL, CHECK IN ('Студент','Викладач','Адмін') |
| createdAt | TEXT | NOT NULL (ISO 8601) |

### Rooms

| Поле | Тип | Обмеження |
|------|-----|-----------|
| id | INTEGER | PRIMARY KEY |
| number | TEXT | NOT NULL, UNIQUE |
| capacity | INTEGER | NOT NULL, CHECK (capacity > 0) |

### Passes

| Поле | Тип | Обмеження |
|------|-----|-----------|
| id | INTEGER | PRIMARY KEY |
| userId | INTEGER | NOT NULL, FK → Users(id) ON DELETE CASCADE |
| roomId | INTEGER | NOT NULL, FK → Rooms(id) ON DELETE CASCADE |
| reason | TEXT | NOT NULL, CHECK IN ('Навчання', 'Лабораторна робота', 'Робота над проектом', 'Технічне обслуговування') |
| validUntil | TEXT | NOT NULL (YYYY-MM-DD) |
| issuerName | TEXT | NOT NULL |
| comment | TEXT | (nullable) |
| createdAt | TEXT | NOT NULL (ISO 8601) |

**Поведінка при видаленні:**
- `ON DELETE CASCADE` для обох FK — видалення User або Room каскадно видаляє пов'язані пропуски.

---

## API Endpoints

### Users — `/api/users`

| Метод | URL | Опис |
|-------|-----|------|
| GET | `/api/users` | Список всіх користувачів |
| GET | `/api/users/:id` | Користувач за id |
| POST | `/api/users` | Створити користувача |
| PUT | `/api/users/:id` | Оновити користувача |
| DELETE | `/api/users/:id` | Видалити користувача |

### Rooms — `/api/rooms`

| Метод | URL | Опис |
|-------|-----|------|
| GET | `/api/rooms` | Список аудиторій |
| GET | `/api/rooms/:id` | Аудиторія за id |
| POST | `/api/rooms` | Створити аудиторію |
| PUT | `/api/rooms/:id` | Оновити аудиторію |
| DELETE | `/api/rooms/:id` | Видалити аудиторію |

### Passes — `/api/passes`

| Метод | URL | Опис |
|-------|-----|------|
| GET | `/api/passes` | Список пропусків (JOIN з Users + Rooms) |
| GET | `/api/passes?reason=Навчання` | Фільтр за причиною |
| GET | `/api/passes?limit=10` | Обмеження кількості |
| GET | `/api/passes/:id` | Пропуск за id |
| POST | `/api/passes` | Створити пропуск |
| PUT | `/api/passes/:id` | Оновити пропуск |
| DELETE | `/api/passes/:id` | Видалити пропуск |
| GET | `/api/passes/stats` | **Агрегація**: кількість за причинами, середнє на користувача |
| GET | `/api/passes/search?q=...` | ⚠️ Пошук (SQLi demo) |

---

## Приклади запитів (curl)

### Отримати всі пропуски

```bash
curl http://localhost:3000/api/passes
```

### Фільтр + обмеження (WHERE + ORDER BY + LIMIT)

```bash
curl "http://localhost:3000/api/passes?reason=Навчання&limit=5"
```

### Створити користувача

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Іванов Іван","email":"ivan@test.com","role":"Студент"}'
```

### Створити пропуск

```bash
curl -X POST http://localhost:3000/api/passes \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"roomId":1,"reason":"Навчання","validUntil":"2026-12-01","issuerName":"Коваленко М.П."}'
```

### Статистика (агрегація)

```bash
curl http://localhost:3000/api/passes/stats
```

Приклад відповіді:
```json
{
  "data": {
    "totalPasses": 7,
    "byReason": [
      { "reason": "Навчання", "count": 2 },
      { "reason": "Лабораторна робота", "count": 2 }
    ],
    "avgPassesPerUser": 1.75
  }
}
```

---

## ⚠️ Демонстрація SQL Injection (ЛР3)

Endpoint `/api/passes/search?q=...` **навмисно вразливий** — значення `q` вставляється прямо в SQL без екранування:

```sql
WHERE p.issuerName LIKE '%<q>%'
```

**Приклад «поганого» вводу**, що ламає логіку вибірки:

```
GET /api/passes/search?q=' OR '1'='1
```

Це перетворить умову на `WHERE p.issuerName LIKE '%' OR '1'='1%'` і поверне **всі** записи, незалежно від фільтру.

**Чому це небезпечно:** зловмисник може отримати дані, до яких не має доступу, змінити або видалити записи (при INSERT/UPDATE/DELETE), або виконати довільний SQL.

> Буде виправлено у **ЛР5** через параметризовані запити (`?` або named params).

---

## HTTP коди відповідей

| Код | Ситуація |
|-----|----------|
| 200 | Успішне читання/оновлення |
| 201 | Успішне створення |
| 204 | Успішне видалення (без тіла) |
| 400 | Некоректне тіло запиту / порушення NOT NULL або CHECK |
| 404 | Ресурс не знайдено |
| 409 | Порушення унікальності (UNIQUE constraint) |
| 500 | Неочікувана помилка сервера |
