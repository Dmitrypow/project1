import { getPasses, createPass, deletePass, getUsers, getZones } from "./apiClient.js";
import { renderListStatus, renderTable, showNotice, setFormEnabled } from "./ui.js";
import { CreatePassDto, ApiError } from "./dtos.js";

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
});

// Ініціалізуємо додаток
loadSelectOptions();
loadPasses();