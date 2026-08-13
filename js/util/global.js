import { GetUnReadNotificationsCount } from "../Api/notificationsApi.js";
import { getUserProfileImage, getPublicUserProfile } from "../Api/userApi.js";
import { showBanner } from "../util/show.js";


document.addEventListener('DOMContentLoaded', async function () {
    //handle notification
    await handleNotificationsOnNavBar();

    //handle nav bar profile button
    await handleNavBarProfileButton();
});


//helper 
async function handleNotificationsOnNavBar() {
    // get notification Count 
    const notificationsCount = await GetUnReadNotificationsCount();

    if (notificationsCount > 0) {
        //create notification badge
        const notificationBadge = document.querySelector('.notification-badge');
        notificationBadge.textContent = notificationsCount;
        
        //insert notification badge into the notification button
        const notificationButton = document.querySelector('.notification-btn');
        notificationButton.appendChild(notificationBadge);
    }

    // handle click event on notification button
    const notificationButton = document.querySelector('.notification-btn');
    notificationButton.addEventListener('click', function () {
        // redirect to notifications page
        window.location.href = 'notifications.html';
    });
}

async function handleNavBarProfileButton() {
    try {
        const accountBtn = document.querySelector('.account-btn');
        if (!accountBtn) return;

        //get profile image path
        const response = await getUserProfileImage();

        // Set the profile image source
        accountBtn.querySelector('img').src = response.profilePictureUrl
            || './image/default-image-profile.png';

        accountBtn.addEventListener('click', function () {
            // redirect to profile page
            window.location.href = 'profile.html';
        });
    } catch (error) {
        if (error.message === 'Request timeout') {
            showBanner('Server took too long to respond. Please try again.', 'error');
        } else if (error.status === 400) {
            showBanner(error.message, 'warning');
        } else if (error.status === 401) {
            localStorage.removeItem('token');
            redirectToLogin();
        } else if (error.status === 404) {
            localStorage.removeItem('token');
            sessionStorage.setItem('loginMessage', 'User not found. Please log in again.');
            redirectToLogin();
        } else if (error.status === 500) {
            showBanner('Server error. Please try again later.', 'error');
        } else {
            showBanner('Unable to load profile. Please refresh.', 'error');
        }
    }
}

function redirectToLogin() {
    window.location.replace('login.html');
}