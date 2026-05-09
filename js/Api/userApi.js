import { apiClient } from "./apiClient.js";

export const login = (email,password) => apiClient('/Auth/login', {
    method: 'POST',
    body: {
        'email': email,
        'password': password
    }
});


export const register = (username,email,password) => apiClient('/Auth/register', {
    method: 'POST',
    body: {
        'userName': username,
        'email': email,
        'password': password,
        'confirmPassword': password
    }
});
