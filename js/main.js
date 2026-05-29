import { getPasses, createPass, deletePass, getUsers, getZones } from "./apiClient.js";
import { renderListStatus, renderTable, showNotice, setFormEnabled } from "./ui.js";
async function loadSelectOptions() {
    try {
        const [usersRes, zonesRes] = await Promise.all([getUsers(), getZones()]);
        const userSelect = document.getElementById("userIdSelect");
        if (userSelect) {
            userSelect.innerHTML = '<option value="">Оберіть студента/викладача</option>' +
                usersRes.items.map(u => `<option value="${u.id}">${u.fullName} (${u.role})</option>`).join("");
        }
        const zoneSelect = document.getElementById("zoneIdSelect");
        if (zoneSelect) {
            zoneSelect.innerHTML = '<option value="">Оберіть зал</option>' +
                zonesRes.items.map(z => `<option value="${z.id}">${z.name}</option>`).join("");
        }
    }
    catch (e) {
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
        }
        else {
            renderListStatus("success");
            renderTable(passes);
        }
    }
    catch (e) {
        const err = e;
        console.error(err);
        renderListStatus("error", err);
    }
}
document.getElementById("passForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormEnabled(false);
    const dto = {
        userId: Number(document.getElementById("userIdSelect").value),
        zoneId: Number(document.getElementById("zoneIdSelect").value),
        reason: document.getElementById("reasonSelect").value,
        validUntil: document.getElementById("validDateInput").value,
        issuerName: document.getElementById("issuerInput").value,
        comment: document.getElementById("commentInput").value
    };
    try {
        await createPass(dto);
        showNotice("✅ Пропуск успішно створено!");
        document.getElementById("passForm").reset();
        await loadPasses();
    }
    catch (e) {
        const err = e;
        let errorMsg = `Помилка: ${err.message}`;
        if (err.details)
            errorMsg += `<br><small>${err.details}</small>`;
        showNotice(errorMsg, true);
    }
    finally {
        setFormEnabled(true);
    }
});
document.getElementById("passesTableBody")?.addEventListener("click", async (event) => {
    const target = event.target;
    if (target.classList.contains("delete-btn")) {
        if (!confirm("Ви впевнені, що хочете видалити цей пропуск?"))
            return;
        const id = Number(target.dataset.id);
        try {
            await deletePass(id);
            showNotice("🗑️ Пропуск видалено");
            await loadPasses();
        }
        catch (e) {
            const err = e;
            showNotice(`Помилка видалення: ${err.message}`, true);
        }
    }
});

loadSelectOptions();
loadPasses();
