import { GetPost } from './Api/postApi.js';
import { showBanner } from './util/show.js';

const postAvatar = document.querySelector('.post-avatar');
const authorNameEl = document.querySelector('.post-author-name');
const authorHandleEl = document.querySelector('.post-author-handle');
const postTimeEl = document.querySelector('.post-time');
const postContentEl = document.querySelector('.feed-item-content');

function getPostIdFromQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function buildTagElements(tags) {
    if (!Array.isArray(tags) || tags.length === 0) return '';
    return `<div class="feed-item-tags">${tags.map(tag => `<a href="#${tag}" class="tag">#${tag}</a>`).join(' ')}</div>`;
}

function buildImageElements(images) {
    if (!Array.isArray(images) || images.length === 0) return '';
    return `<div class="feed-item-images">${images.map(src => `<img src="${src}" alt="Post image" class="compose-image-preview-item">`).join('')}</div>`;
}

function checkLogin() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.replace('/login.html');
        return false;
    }
    return true;
}

async function renderPost() {
    const postId = getPostIdFromQuery();
    if (!postId) {
        showBanner('Post ID missing from URL.', 'error');
        return;
    }

    try {
        const post = await GetPost(postId);

        const authorName = post.authorName || 'Anonymous';
        const authorHandle = post.authorUsername || post.authorHandle || post.author || 'unknown';
        const createdAt = post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Unknown date';
        const avatarUrl = post.authorProfilePictureUrl || 'assets/default-avatar.png';
        const description = post.description || post.content || '';
        const tagsHtml = buildTagElements(post.tags || []);
        const imagesHtml = buildImageElements(post.imagesURls || post.imagesUrls || post.images || []);

        if (postAvatar) postAvatar.src = avatarUrl;
        if (postAvatar) postAvatar.alt = authorName;
        if (authorNameEl) authorNameEl.textContent = authorName;
        if (authorHandleEl) authorHandleEl.textContent = `@${authorHandle}`;
        if (postTimeEl) postTimeEl.textContent = `• ${createdAt}`;
        if (postContentEl) postContentEl.innerHTML = `<p>${description}</p>${tagsHtml}${imagesHtml}`;
    } catch (error) {
        if (error.message === 'Request timeout') {
            showBanner('Server took too long to respond. Please try again.', 'error');
            return;
        }

        if (error.status === 401) {
            localStorage.removeItem('token');
            window.location.replace('/login.html');
            return;
        }

        if (error.status === 404) {
            showBanner('Post not found.', 'warning');
            return;
        }

        showBanner('Unable to load post. Please refresh.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkLogin()) return;
    await renderPost();
});
