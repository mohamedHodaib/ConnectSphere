import { GetUnReadNotifications, MarkNotificationAsRead, MarkAllNotificationsAsRead }
    from './Api/notificationsApi.js';
import { followUser, unfollowUser } from './Api/userApi.js';
import { showEmptyFeedState, hideEmptyFeedState, showBanner, hideBanner } from './util/show.js'
import { createPagination } from './util/pagination.js'

//frequently used elements 
const notificationsContainer = document.querySelector('.notifications-container');

// Store the page that the user was trying to access before login
const currentPage = window.location.pathname + window.location.search;
sessionStorage.setItem("redirectTo", currentPage);

document.addEventListener('DOMContentLoaded', async function () {
    // Check if user is logged in
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.replace('/login.html');
        return;
    }
    //handle load notifications
    try {
        await handleLoadingNotifications();
        
    } catch (error) {
        if(error.message === 'Request timeout') {
            showBanner('Server took too long to respond. Please try again.', 'error');
        }
        if(error.status === 400) {
            showBanner(error.message, 'warning');
        }
        if (error.status === 401) {
            localStorage.removeItem('token');
            window.location.replace('/login.html');
        }
    
        if (error.status === 404) {
            localStorage.removeItem('token');
            window.location.replace('/login.html');
            sessionStorage.setItem('loginMessage', 'User not found. Please log in again.');
        }
    
        if (error.status === 500) {
            const feedCenter = document.querySelector('.feed-center');
            feedCenter.innerHTML = `
                <div class="error-message">
                    <span class="material-symbols-outlined">error</span>
                    <p>Something went wrong. Please try again later.</p>
                    <button class="retry-btn" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }

    // mark all notifications as read
    document.querySelector('.text-link').addEventListener('click', async () => handleMarkAllAsReadClick)
    

});

//Handle loading notifications

// Display each notification
async function CreateNotificationCard(notification) {
    const notificationCard = document.createElement('section');
    notificationCard.classList.add('notification-card', 'notification-card-accent');
    notificationCard.innerHTML = `
        <div class="notification-card-top">
            <div class="notification-avatar-wrap">
                <img src=${notification.actorProfilePictureUrl || 'default-avatar.png'}
                    alt=${notification.actorName || 'User'} class="notification-avatar">
                <div>
                    <div class="notification-title-row">
                        <span class="notification-title">${notification.title || 'New Notification'}</span>
                        <small>${notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'Just now'}</small>
                    </div>
                    <div class="notification-snippet">${notification.message || 'You have a new notification.'}</div>
                </div>
            </div>
            ${notification.type === 'follow'
                ? `<button class="notification-btn follow-btn">Follow Back</button>`
                : ''
            }
        </div>
    `;
    // handle click event of notification card
    handleNotificationClick(notificationCard,notification.id);
    // handle follow click
    if (notification.type === 'follow') {
        const followBtn = document.querySelector(".follow-btn");
        followBtn.dataset.following = "false";
        handleFollowClick(followBtn, notification.actorId, notification.id);
    }
    notificationsContainer.appendChild(notificationCard);
}

async function handleLoadingNotifications() {
        const notificationPagination = createPagination({

        pageSize: 20,

        fetchData: GetUnReadNotifications,

        renderItems(notifications) {

            notifications.forEach(CreateNotificationCard);

        },

        emptyState: {

            show() {
                showEmptyFeedState(notificationsContainer);
            },

            hide() {
                hideEmptyFeedState(notificationsContainer);
            },

            clear() {
                notificationsContainer.innerHTML = "";
            }

        }

    });

    await notificationPagination.load(true);

    notificationPagination.attachInfiniteScroll();
}


// handle mark all as read click 
async function handleMarkAllAsReadClick() {
    try {
        await MarkAllNotificationsAsRead();

        // make the notifications count badge disappear
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            notificationBadge.remove();
        }

        showEmptyFeedState();
    } catch (error) {
        throw error;
    }
}

//Handle Notification Button Clicks
function handleNotificationClick(notificationCard,id) {
    notificationCard.addEventListener('click', async function () {
        await handleMarkNotificationAsRead(id);
        this.remove();
        handleShowEmptyState();
    });
}

// mark notification as read 
async function handleMarkNotificationAsRead(id) {
    try {
        // Mark notification as read
        const response = await MarkNotificationAsRead(id);

        // make the notifications count decrease by 1
        const notificationBadge = document.querySelector('.notification-badge');
        if (notificationBadge) {
            const currentCount = parseInt(notificationBadge.textContent, 10);
            const newCount = currentCount - 1;
            if (newCount > 0) {
                notificationBadge.textContent = newCount;
            } else {
                notificationBadge.remove();
            }
        }
    } catch (error) {
        if (error.status === 404) {
            showBanner('Notification not found. It may have already been marked as read.', 'warning');
        } else {
            throw error; // Re-throw the error to be caught by the outer try-catch
        }
    }
}

// handle show empty state
async function handleShowEmptyState(id) {
    if (notificationsContainer.innerHTML == '') {
        showEmptyFeedState(notificationsContainer);
    }
}

//handle follow button click
function handleFollowClick(followBtn, userId, notificationId) {
    followBtn.addEventListener('click', async function () {
        //mark notification as read when click follow button
        await handleMarkNotificationAsRead(notificationId);

        const isFollowing = this.dataset.following === "true";
        try {
            if (isFollowing) {
                await unfollowUser(userId);
                this.textContent = "Follow";
                this.dataset.following = "false";
            } else {
                await followUser(userId);
                this.textContent = "Following";
                this.dataset.following = "true";
            }
        } catch (error) {
            if (error.status === 409) {
                showBanner('You are already following this user.', 'warning');
            }
            else if (error.status === 404) {
                showBanner('User not found. Please refresh the notifications.', 'warning');
            }
            else {
                throw error;
            }
        }
    })
}