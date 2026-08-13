import { getUserProfile, getPublicUserProfile, getFollowSuggestions, followUser, unfollowUser } from './Api/userApi.js';
import { GetPosts } from './Api/postApi.js';
import { showEmptyFeedState, hideEmptyFeedState, showBanner } from './util/show.js';
import { createPagination } from './util/pagination.js';
import { GetBookmarks, GetUserReactedPosts } from './Api/postApi.js';

const currentPage = window.location.pathname + window.location.search;
sessionStorage.setItem('redirectTo', currentPage);

const profilePostsList = document.querySelector('.profile-posts-list');
const suggestionsContainer = document.querySelector('.who-to-follow-card');

const routeUserName = new URLSearchParams(window.location.search).get('user')?.trim();
let currentUser = null;
let viewedProfile = null;
let isCurrentUserProfile = true;
let loadedPosts = [];
let postsPagination = null;

function formatJoinDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function isMatchingAuthor(post, userName) {
    if (!post || !userName) return false;
    const normalized = String(userName).toLowerCase();
    return [
        post.authorUsername,
        post.authorHandle,
        post.username,
        post.userName,
        post.author,
        post.creatorUserName,
        post.creatorUsername
    ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase() === normalized);
}

function updateProfileCard(user, isMine) {
    if (!user) return null;

    const existingCard = document.querySelector('.profile-card');
    if (existingCard) {
        existingCard.remove();
    }

    const profileCard = document.createElement('section');
    profileCard.className = 'profile-card';
    profileCard.innerHTML = `
        <div class="profile-card-hero">
            <div class="profile-avatar-wrap">
                <img src="${user.profilePictureUrl || 'image/avatar.jpg'}" alt="${user.displayName || user.userName}" class="profile-avatar">
            </div>
            <div class="profile-card-content">
                <div class="profile-card-top">
                    <div>
                        <p class="profile-role">${user.displayName || user.userName || 'Your name'}</p>
                        <p class="profile-handle">@${user.userName || user.username || 'username'}</p>
                    </div>
                    <button class="profile-action-btn" type="button">Follow</button>
                </div>
                <p class="profile-bio">${user.biography || 'Tell the community a little about yourself.'}</p>
                <div class="profile-details-row">
                    <div class="profile-detail-item">
                        <span class="material-symbols-outlined">calendar_month</span>
                        <span>Joined ${formatJoinDate(user.createdAt || user.registeredAt || user.jointDate)}</span>
                    </div>
                </div>
                <div class="profile-stats-row">
                    <div class="profile-stat">
                        <span>${user.postsCount}</span>
                        <small>Posts</small>
                    </div>
                    <div class="profile-stat">
                        <span>${user.followersCount}</span>
                        <small>Followers</small>
                    </div>
                    <div class="profile-stat">
                        <span>${user.followingCount}</span>
                        <small>Following</small>
                    </div>
                </div>
            </div>
        </div>`;

    const profileActionBtn = profileCard.querySelector('.profile-action-btn');
    if (!profileActionBtn) return profileCard;

    profileActionBtn.dataset.targetUserId = user.id || '';

    if (isMine) {
        profileActionBtn.textContent = 'Edit Profile';
        profileActionBtn.dataset.following = 'false';
        profileActionBtn.onclick = () => {
            window.location.href = 'settings.html';
        };
    } else {
        const isFollowing = user.isFollowed ?? user.isFollowing ?? false;
        profileActionBtn.textContent = isFollowing ? 'Following' : 'Follow';
        profileActionBtn.dataset.following = isFollowing ? 'true' : 'false';
        profileActionBtn.onclick = async () => {
            await handleFollowToggle(user.id, profileActionBtn);
        };
    }

    const feedCenter = document.querySelector('.feed-center');
    const postsList = document.querySelector('.profile-posts-list');

    if (feedCenter && postsList) {
        feedCenter.insertBefore(profileCard, postsList);
    } else if (postsList) {
        postsList.before(profileCard);
    } else {
        document.body.appendChild(profileCard);
    }

    return profileCard;
}

function createPostCard(post) {
    const postAuthor = post.authorName || currentUser?.displayName || currentUser?.userName || 'You';
    const postHandle = post.authorUsername || post.authorHandle || currentUser?.userName || currentUser?.username || 'you';
    const createdAt = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now';
    const content = post.content || post.description || '';

    const tags = Array.isArray(post.tags) ? post.tags : [];
    const tagsHtml = tags.length
        ? `<div class="post-tags">${tags.map((tag) => `<a href="#${tag}" class="tag">#${tag}</a>`).join(' ')}</div>`
        : '';

    const images = Array.isArray(post.imagesUrls) ? post.imagesUrls : Array.isArray(post.images) ? post.images : [];
    const imagesHtml = images.length
        ? `<div class="post-images">${images.map((src) => `<img src="${src}" alt="Post image" class="post-image">`).join('')}</div>`
        : '';

    const article = document.createElement('article');
    article.className = 'post-card';
    article.innerHTML = `
        <div class="post-hero">
            <img src="${currentUser?.profilePictureUrl || 'image/avatar.jpg'}" alt="${postAuthor}" class="post-avatar">
            <div class="post-hero-info">
                <div class="post-author-row">
                    <h3 class="post-author-name">${postAuthor}</h3>
                    <span class="post-author-handle">@${postHandle}</span>
                    <span class="post-timestamp">${createdAt}</span>
                </div>
                <p class="post-description">${content}</p>
            </div>
        </div>
        ${imagesHtml}
        ${tagsHtml}
        <div class="post-actions-row">
            <button class="post-action-btn" type="button">
                <span class="material-symbols-outlined">chat_bubble_outline</span>
                <span>${post.commentCount || 0}</span>
            </button>
            <button class="post-action-btn" type="button">
                <span class="material-symbols-outlined">repeat</span>
                <span>${post.repostCount || 0}</span>
            </button>
            <button class="post-action-btn" type="button">
                <span class="material-symbols-outlined">favorite_border</span>
                <span>${post.likeCount || 0}</span>
            </button>
            <button class="post-action-btn" type="button">
                <span class="material-symbols-outlined">share</span>
            </button>
        </div>
    `;
    return article;
}

// Display each bookmark
async function CreateBookmarkCard(bookmark) {
    const bookmarkCard = document.createElement('section');
    bookmarkCard.classList.add('bookmark-card', 'bookmark-card-accent');
    bookmarkCard.dataset.postId = bookmark.id;

    const avatar = bookmark.authorProfilePictureUrl || bookmark.authorAvatar || 'assets/default-avatar.png';
    const authorName = bookmark.authorName || bookmark.author || 'Anonymous';
    const handle = bookmark.username || bookmark.authorHandle ? ` • @${bookmark.username || bookmark.authorHandle}` : '';
    const createdAt = bookmark.createdAt ? new Date(bookmark.createdAt).toLocaleString() : 'Just now';
    const title = bookmark.title || (bookmark.content ? bookmark.content.split('\n')[0] : 'Untitled');
    const description = bookmark.description || bookmark.content || '';
    const tagsHtml = Array.isArray(bookmark.tags) && bookmark.tags.length
        ? bookmark.tags.map(t => `<span>${t}</span>`).join('')
        : '';
    const viewUrl = bookmark.originalUrl || bookmark.sourceUrl || `/post.html?id=${bookmark.id}`;

    bookmarkCard.innerHTML = `
        <div class="bookmark-card-top">
            <img src="${avatar}" alt="${authorName}" class="bookmark-avatar">
            <div class="bookmark-card-details">
                <div class="bookmark-card-title-row">
                    <h3 class="bookmark-card-title">${escapeHtml(title)}</h3>
                    <small>${escapeHtml(createdAt)}</small>
                </div>
                <p class="bookmark-card-meta">${escapeHtml(authorName)}${escapeHtml(handle)}</p>
            </div>
            <button class="bookmark-delete-btn" type="button" aria-label="Delete bookmark">Remove</button>
        </div>
        <p class="bookmark-card-description">${escapeHtml(description)}</p>
        <div class="bookmark-card-tags">${tagsHtml}</div>
        <div class="bookmark-card-footer">
            <span class="bookmark-card-source">Saved from ConnectSphere</span>
            <a href="${viewUrl}" class="text-link" target="_blank" rel="noopener noreferrer">View original</a>
        </div>
    `;

    const deleteBtn = bookmarkCard.querySelector('.bookmark-delete-btn');
    deleteBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        await handleDeleteBookmark(bookmark.id, bookmarkCard);
    });

    bookmarksContainer.appendChild(bookmarkCard);
}

// small helper to avoid injecting raw HTML from API fields
function escapeHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function handleLoadingBookmarks() {
    const bookmarkPagination = createPagination({
        pageSize: 20,

        fetchData: GetBookmarks,

        renderItems(bookmarks) {
            bookmarks.forEach(createBookmarkCard);
        },

        emptyState: {
            show() {
                showEmptyFeedState(profilePostsList);
            },

            hide() {
                hideEmptyFeedState(profilePostsList);
            },

            clear() {
                profilePostsList.innerHTML = "";
            }
        }
    });

    await bookmarkPagination.load(true);
    bookmarkPagination.attachInfiniteScroll();
}

//handle loading liked posts
async function handleLoadingLikedPosts() {
    const likedPostsPagination = createPagination({
        pageSize: 20,
        fetchData: GetUserReactedPosts,
        renderItems(posts) {
            posts.forEach((post) => {
                loadedPosts.push(post);
                profilePostsList.appendChild(createPostCard(post));
            });
        },
        emptyState: {
            show() {
                showEmptyFeedState(profilePostsList);
            },

            hide() {
                hideEmptyFeedState(profilePostsList);
            },

            clear() {
                profilePostsList.innerHTML = "";
            }
        }
    });

    await likedPostsPagination.load(true);
    likedPostsPagination.attachInfiniteScroll();
}

async function  showTabContent(tabName) {
    if (!profilePostsList) return;

    if (tabName === 'posts') {
        profilePostsList.innerHTML = '';
        if (loadedPosts.length === 0) {
            showEmptyFeedState(profilePostsList);
            return;
        }

        hideEmptyFeedState(profilePostsList);
        loadedPosts.forEach((post) => profilePostsList.appendChild(createPostCard(post)));
        return;
    } else if (tabName === 'saved') {
        profilePostsList.innerHTML = '';
        await handleLoadingBookmarks();
        return;
    } else if (tabName === 'likes') {
        profilePostsList.innerHTML = '';
        handleLoadingLikedPosts();
        return;
    }
}

function initializeTabs() {

    const profileTabButtons = document.createElement('section');
    profileTabButtons.className = 'profile-tabs-wrap';
    profileTabButtons.innerHTML = `
        <nav class="profile-tabs">
            <button class="profile-tab active">Posts</button>
            <button class="profile-tab">Saved</button>
            <button class="profile-tab">Likes</button>
        </nav>
    `;

    profileTabButtons.querySelectorAll('.profile-tab').forEach((button) => {
        button.addEventListener('click', () => {
            profileTabButtons.querySelectorAll('.profile-tab')
                .forEach((tab) => tab.classList.remove('active'));
            button.classList.add('active');
            showTabContent(button.textContent.trim().toLowerCase());
        });
    });

    // Insert the tab buttons before the posts list
    if (profilePostsList && profilePostsList.parentNode) {
        profilePostsList.parentNode.insertBefore(profileTabButtons, profilePostsList);
    }
}

function resetFollowSuggestions() {
    if (!suggestionsContainer) return;
    suggestionsContainer.innerHTML = `
        <h3 class="who-to-follow-title">Who to follow</h3>
        <a href="#" class="show-more-link">Show more</a>
        <div class="who-to-follow-list"></div>
    `;
}

function createFollowSuggestionItem(user) {
    const userElement = document.createElement('div');
    userElement.className = 'follow-user';
    userElement.dataset.profileUrl = `profile.html?user=${encodeURIComponent(user.userName)}`;
    userElement.innerHTML = `
        <img src="${user.profilePictureUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}" alt="${user.displayName || user.userName}" class="follow-user-avatar">
        <div class="follow-user-info">
            <span class="follow-user-name">${user.displayName || user.userName}</span>
            <span class="follow-user-handle">@${user.userName}</span>
        </div>
        <button class="follow-user-btn" data-user-id="${user.id}" type="button">Follow</button>
    `;

    userElement.addEventListener('click', (event) => {
        if (event.target.closest('.follow-user-btn')) return;
        const profileUrl = event.currentTarget.dataset.profileUrl;
        if (profileUrl) {
            window.location.href = profileUrl;
        }
    });

    const button = userElement.querySelector('.follow-user-btn');
    if (button) {
        button.addEventListener('click', async (event) => {
            event.stopPropagation();
            await handleFollowToggle(user.id, button);
        });
    }

    return userElement;
}

async function renderFollowSuggestions() {
    if (!suggestionsContainer) return;

    try {
        const suggestions = await getFollowSuggestions(1, 5);
        resetFollowSuggestions();

        const listContainer = suggestionsContainer.querySelector('.who-to-follow-list');
        if (!listContainer) return;

        if (!Array.isArray(suggestions) || suggestions.length === 0) {
            listContainer.innerHTML = '<p>No follow suggestions available at the moment.</p>';
            return;
        }

        suggestions.forEach((user) => {
            listContainer.appendChild(createFollowSuggestionItem(user));
        });
    } catch (error) {
        showBanner('Unable to load suggestions. Please try again later.', 'error');
    }
}

async function handleFollowToggle(userId, button) {
    const isFollowing = button.dataset.following === 'true';
    try {
        if (isFollowing) {
            await unfollowUser(userId);
            button.textContent = 'Follow';
            button.dataset.following = 'false';
        } else {
            await followUser(userId);
            button.textContent = 'Following';
            button.dataset.following = 'true';
        }
    } catch (error) {
        if (error.status === 409) {
            showBanner('You are already following this user.', 'warning');
        } else if (error.status === 404) {
            showBanner('User not found. Please refresh the page.', 'warning');
        } else {
            showBanner('Unable to update follow status. Try again later.', 'error');
        }
    }
}

async function loadProfilePosts() {
    if (!profilePostsList) return;

    profilePostsList.innerHTML = '';
    loadedPosts = [];

    const emptyState = {
        show() {
            showEmptyFeedState(profilePostsList);
        },
        hide() {
            hideEmptyFeedState(profilePostsList);
        },
        clear() {
            profilePostsList.innerHTML = '';
        }
    };

    if (!routeUserName || isCurrentUserProfile) {
        postsPagination = createPagination({
            pageSize: 10,
            fetchData: GetPosts,
            renderItems(posts) {
                posts.forEach((post) => {
                    loadedPosts.push(post);
                    profilePostsList.appendChild(createPostCard(post));
                });
            },
            emptyState
        });

        await postsPagination.load(true);
        postsPagination.attachInfiniteScroll();
        return;
    }

    try {
        const feedData = await GetPosts(1, 50);
        const items = Array.isArray(feedData) ? feedData : feedData.items || [];
        const filteredPosts = items.filter((post) => isMatchingAuthor(post, routeUserName));

        if (filteredPosts.length === 0) {
            showEmptyFeedState(profilePostsList);
            return;
        }

        hideEmptyFeedState(profilePostsList);
        filteredPosts.forEach((post) => {
            loadedPosts.push(post);
            profilePostsList.appendChild(createPostCard(post));
        });
    } catch (error) {
        showBanner('Unable to load posts for this profile. Please try again later.', 'error');
    }
}


function redirectToLogin() {
    window.location.replace('/login.html');
}

async function loadProfilePage() {
    const token = localStorage.getItem('token');
    if (!token) {
        redirectToLogin();
        return;
    }

    try {
        currentUser = await getUserProfile();

        if (routeUserName && routeUserName.toLowerCase() !== currentUser.username?.toLowerCase()) {
            viewedProfile = await getPublicUserProfile(routeUserName);
            isCurrentUserProfile = false;
        } else {
            viewedProfile = await getPublicUserProfile(currentUser.username);
            isCurrentUserProfile = true;
        }

        updateProfileCard(viewedProfile, isCurrentUserProfile);

        if (isCurrentUserProfile) {
            initializeTabs();
        }

        await loadProfilePosts();
        await renderFollowSuggestions();
        showTabContent('posts');
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
            const feedCenter = document.querySelector('.feed-center');
            if (feedCenter) {
                feedCenter.innerHTML = `
                    <div class="error-message">
                        <span class="material-symbols-outlined">error</span>
                        <p>Something went wrong. Please try again later.</p>
                        <button class="retry-btn" onclick="location.reload()">Retry</button>
                    </div>
                `;
            }
        } else {
            showBanner('Unable to load profile. Please refresh.', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', loadProfilePage);
