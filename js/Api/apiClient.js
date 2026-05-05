const API_BASE = 'https://localhost:7068/api';

class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

export async function apiClient(endpoint, {
    method = 'GET',
    body,
    headers = {},
    timeout = 8000,
} = {}) {

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        //call Api
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal
        });

        clearTimeout(id);

        //convert response to js object
        let data;
        try {
            data = await response.json();
        } catch {
            data = null;
        }

        if (!response.ok) {
            throw new ApiError(
                data?.detail || "Request failed",
                response.status,
                data
            )
        }

        return data;

    } catch(error) {
        if (error.name == 'AbortError') {
            throw new Error("Request timeout");
        }

        throw error;
    }
}