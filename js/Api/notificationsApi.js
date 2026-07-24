import { apiClient } from './apiClient.js';

export const GetUnReadNotifications = (page = 1, pageSize = 10) =>
    apiClient(`/Notifications?page=${page}&pageSize=${pageSize}&unreadOnly=true`
        , { auth: true });

export const MarkNotificationAsRead = (notificationId) =>
    apiClient(`/Notifications/${notificationId}/read`, { method: 'POST', auth: true });

export const MarkAllNotificationsAsRead = () =>
    apiClient(`/Notifications/read-all`, { method: 'POST', auth: true });