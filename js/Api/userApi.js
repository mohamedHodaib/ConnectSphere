import { apiClient } from "./apiClient.js";

export const login = (email,password) => apiClient('/Auth/login', {
    method: 'POST',
    body: {
        'email': email,
        'password': password
    }
});