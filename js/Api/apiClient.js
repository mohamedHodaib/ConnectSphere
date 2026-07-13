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
    auth = false,
    formData = false,
} = {}) {

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const requestHeaders = {
        ...headers
    };

    if (!formData) {
        requestHeaders['Content-Type'] = 'application/json';
    }

    if (auth) {
        const token = localStorage.getItem('token');
        if (token) {
            requestHeaders['Authorization'] = `Bearer ${token}`;
        }
    }

    try {
        //call Api
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers: requestHeaders,
            body: body ? (formData ? body : JSON.stringify(body)) : undefined,
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
            console.log(data);
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