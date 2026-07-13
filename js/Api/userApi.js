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

export const confirmEmail = (token, userId) => apiClient(
    `/Auth/confirm-email?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`
);

export const forgotPassword = (email) => apiClient('/Auth/forgot-password', {
    method: 'POST',
    body: { email }
});


export const resetPassword = (email, token, password, confirmPassword) => apiClient('/Auth/reset-password', {
    method: 'POST',
    body: {
        "email": email,
        "token": token,
        "newPassword": password,
        "confirmPassword": confirmPassword
    }
});


export const getUserProfile = () => apiClient('/profile/me',{auth: true});


export const getFollowSuggestions = (page = 1, pageSize = 5) => apiClient(`/Recommendations?page=${page}&pageSize=${pageSize}`, { auth: true });

export const followUser = (userId) => apiClient(`/users/${userId}/follow`, { method: 'POST', auth: true });