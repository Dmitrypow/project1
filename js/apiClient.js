import { API_BASE_URL } from "./config.js";
async function request(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    options.signal = controller.signal;
    let response;
    try {
        response = await fetch(url, options);
    }
    catch (e) {
        clearTimeout(timeoutId);
        const err = {
            status: 0,
            message: e.name === "AbortError" ? "Перевищено час очікування (сервер завис)" : "Помилка мережі або CORS",
            details: e?.message ?? String(e),
        };
        throw err;
    }
    clearTimeout(timeoutId);
    if (response.status === 204) {
        return null;
    }
    const rawText = await response.text();
    if (response.ok) {
        if (!rawText)
            return null;
        try {
            return JSON.parse(rawText);
        }
        catch {
            return rawText;
        }
    }
    let payload = null;
    try {
        payload = rawText ? JSON.parse(rawText) : null;
    }
    catch { }
    const err = {
        status: response.status,
        message: payload?.error?.message ?? "HTTP помилка",
        details: payload?.error?.details ?? rawText ?? `HTTP ${response.status}`,
    };
    throw err;
}
export async function getPasses() {
    return await request("/passes");
}
export async function createPass(dto) {
    return await request("/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}
export async function deletePass(id) {
    return await request(`/passes/${id}`, { method: "DELETE" });
}
export async function getUsers() {
    return await request("/users");
}
export async function getZones() {
    return await request("/zones");
}
