import { API_BASE_URL } from "./config.js";
import { ApiError, PassResponseDto, CreatePassDto, UserDto, ZoneDto } from "./dtos.js";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); 
    options.signal = controller.signal;

    let response: Response;
    try {
        response = await fetch(url, options);
    } catch (e: any) {
        clearTimeout(timeoutId);
        const err: ApiError = {
            status: 0,
            message: e.name === "AbortError" ? "Перевищено час очікування (сервер завис)" : "Помилка мережі або CORS",
            details: e?.message ?? String(e),
        };
        throw err;
    }

    clearTimeout(timeoutId);

    if (response.status === 204) {
        return null as unknown as T;
    }

    const rawText = await response.text();
    
    if (response.ok) {
        if (!rawText) return null as unknown as T;
        try { return JSON.parse(rawText) as T; } catch { return rawText as unknown as T; }
    }

    let payload: any = null;
    try { payload = rawText ? JSON.parse(rawText) : null; } catch {}

    const err: ApiError = {
        status: response.status,
        message: payload?.error?.message ?? "HTTP помилка",
        details: payload?.error?.details ?? rawText ?? `HTTP ${response.status}`,
    };
    throw err;
}

export async function getPasses(): Promise<{ items: PassResponseDto[] }> {
    return await request<{ items: PassResponseDto[] }>("/passes");
}

export async function createPass(dto: CreatePassDto): Promise<PassResponseDto> {
    return await request<PassResponseDto>("/passes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

export async function deletePass(id: number): Promise<void> {
    return await request<void>(`/passes/${id}`, { method: "DELETE" });
}

export async function getUsers(): Promise<{ items: UserDto[] }> {
    return await request<{ items: UserDto[] }>("/users");
}

export async function getZones(): Promise<{ items: ZoneDto[] }> {
    return await request<{ items: ZoneDto[] }>("/zones");
}