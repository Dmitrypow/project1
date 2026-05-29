import { getPasses, createPass, deletePass, getUsers, getZones, updatePass, searchPasses, getPassStats, getTopStudents, createUser, updateUser, deleteUser } from "./apiClient.js";
import { renderListStatus, renderTable, showNotice, setFormEnabled } from "./ui.js";
import { CreatePassDto, UpdatePassDto, CreateUserDto, UpdateUserDto, ApiError } from "./dtos.js";

async function loadSelectOptions() {
    try {
        const [usersRes, zonesRes] = await Promise.all([getUsers(), getZones()]);
        
        const userSelect = document.getElementById("userIdSelect") as HTMLSelectElement;
        if (userSelect) {
            userSelect.innerHTML = '<option value="">Оберіть студента/викладача</option>' + 
                usersRes.items.map(u => `<option value="${u.id}">${u.fullName} (${u.role})</option>`).join("");
        }

        const zoneSelect = document.getElementById("zoneIdSelect") as HTMLSelectElement;
        if (zoneSelect) {
            zoneSelect.innerHTML = '<option value="">Оберіть зал</option>' + 
                zonesRes.items.map(z => `<option value="${z.id}">${z.name}</option>`).join("");
        }
    } catch (e) {
        console.error(e);
        showNotice("Не вдалося завантажити списки користувачів або залів", true);
    }
}

async function loadPasses() {
    renderListStatus("loading");
    try {
        const response = await getPasses();
        const passes = response.items;
        
        if (!passes || passes.length === 0) {
            renderListStatus("empty");
        } else {
            renderListStatus("success");
            renderTable(passes);
        }
    } catch (e) {
        const err = e as ApiError;
        console.error(err);
        renderListStatus("error", err);
    }
}

document.getElementById("passForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormEnabled(false);

    const dto: CreatePassDto = {
        userId: Number((document.getElementById("userIdSelect") as HTMLSelectElement).value),
        zoneId: Number((document.getElementById("zoneIdSelect") as HTMLSelectElement).value),
        reason: (document.getElementById("reasonSelect") as HTMLSelectElement).value,
        validUntil: (document.getElementById("validDateInput") as HTMLInputElement).value,
        issuerName: (document.getElementById("issuerInput") as HTMLInputElement).value,
        comment: (document.getElementById("commentInput") as HTMLTextAreaElement).value
    };

    try {
        await createPass(dto);
        showNotice("✅ Пропуск успішно створено!");
        (document.getElementById("passForm") as HTMLFormElement).reset();
        await loadPasses(); 
    } catch (e) {
        const err = e as ApiError;
        let errorMsg = `Помилка: ${err.message}`;
        if (err.details) errorMsg += `<br><small>${err.details}</small>`;
        showNotice(errorMsg, true);
    } finally {
        setFormEnabled(true);
    }
});

document.getElementById("passesTableBody")?.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains("delete-btn")) {
        if (!confirm("Ви впевнені, що хочете видалити цей пропуск?")) return;
        
        const id = Number(target.dataset.id);
        try {
            await deletePass(id);
            showNotice("🗑️ Пропуск видалено");
            await loadPasses();
        } catch (e) {
            const err = e as ApiError;
            showNotice(`Помилка видалення: ${err.message}`, true);
        }
    }
    else if (target.classList.contains("edit-btn")) {
        const id = Number(target.dataset.id);
        const reason = prompt("Нова причина (або Cancel щоб скасувати):");
        if (reason === null) return;
        try {
            await updatePass(id, { reason });
            showNotice("✏️ Пропуск оновлено");
            await loadPasses();
        } catch (e) {
            const err = e as ApiError;
            showNotice(`Помилка оновлення: ${err.message}`, true);
        }
    }
});

loadSelectOptions();
loadPasses();

document.getElementById("searchInput")?.addEventListener("input", async (e) => {
    const q = (e.target as HTMLInputElement).value.trim();
    if (q.length === 0) { await loadPasses(); return; }
    if (q.length < 2) return;
    renderListStatus("loading");
    try {
        const response = await searchPasses(q);
        const passes = response.items;
        if (!passes || passes.length === 0) { renderListStatus("empty"); }
        else { renderListStatus("success"); renderTable(passes); }
    } catch (e) {
        renderListStatus("error", e as ApiError);
    }
});

async function loadStats(): Promise<void> {
    try {
        const [statsRes, topRes] = await Promise.all([getPassStats(), getTopStudents()]);
        const statsEl = document.getElementById("statsOutput");
        if (statsEl) statsEl.textContent = JSON.stringify(statsRes.data, null, 2);
        const topEl = document.getElementById("topStudentsOutput");
        if (topEl) topEl.textContent = JSON.stringify(topRes.data, null, 2);
    } catch (e) {
        console.error("Не вдалося завантажити статистику", e);
    }
}
loadStats();