import { PassResponseDto, ApiError } from "./dtos.js";

export function showNotice(text: string, isError = false) {
    const el = document.getElementById("notice");
    if (!el) return;
    el.innerHTML = text;
    el.style.backgroundColor = isError ? "#f44336" : "#4CAF50";
    el.style.display = "block";
    setTimeout(() => { el.style.display = "none"; }, 5000);
}

export function renderListStatus(status: "loading" | "empty" | "error" | "success", error?: ApiError) {
    const el = document.getElementById("listStatus");
    const tbody = document.getElementById("passesTableBody");
    if (!el || !tbody) return;

    if (status === "loading") {
        el.innerHTML = "⏳ Завантаження даних з сервера...";
        tbody.innerHTML = "";
    } else if (status === "empty") {
        el.innerHTML = "📭 Поки що немає виданих пропусків.";
        tbody.innerHTML = "";
    } else if (status === "error") {
        el.innerHTML = `❌ Помилка: ${error?.message || "невідома помилка"}`;
        tbody.innerHTML = "";
    } else {
        el.innerHTML = "";
    }
}

export function renderTable(passes: PassResponseDto[]) {
    const tbody = document.getElementById("passesTableBody");
    if (!tbody) return;

    tbody.innerHTML = passes.map((item) => `
        <tr>
            <td>${item.id}</td>
            <td>${item.studentName || "Невідомо"}</td>
            <td>${item.zoneName || "Невідомо"}</td>
            <td>${item.reason}</td>
            <td>${item.validUntil}</td>
            <td>${item.issuerName}</td>
            <td>
                <button type="button" class="edit-btn" data-id="${item.id}">Редагувати</button>
                <button type="button" class="delete-btn" data-id="${item.id}">Видалити</button>
            </td>
        </tr>
    `).join("");
}

export function setFormEnabled(isEnabled: boolean) {
    const btn = document.getElementById("submitBtn") as HTMLButtonElement;
    if (btn) {
        btn.disabled = !isEnabled;
        btn.innerText = isEnabled ? "Створити пропуск" : "Відправка...";
    }
}