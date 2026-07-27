import { hideBanner, showBanner } from './show.js';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=User';

export function extractTags(content) {
    const tagRegex = /#[\w]+/g;
    const tags = content.match(tagRegex) || [];
    return tags.map((tag) => tag.substring(1));
}

export function CreatePostFeedItem({
    content,
    tags = [],
    postId,
    userProfile,
    imagesUrls = [],
    createdAt
}) {
    const feedPostsList = document.querySelector('.feed-posts-list');
    if (!feedPostsList) return null;

    const emptyState = feedPostsList.querySelector('.feed-empty-state');
    if (emptyState) {
        emptyState.remove();
    }

    const tagsHTML = tags.length > 0
        ? `<div class="feed-item-tags">${tags.map((tag) => `<a href="#${tag}" class="tag">#${tag}</a>`).join(' ')}</div>`
        : '';

    const imageHTML = imagesUrls && imagesUrls.length > 0
        ? `<div class="feed-item-images">${imagesUrls.map((url) => `<img src="${url}" alt="Post image" class="compose-image-preview-item">`).join('')}</div>`
        : '';

    const authorName = userProfile?.displayname || userProfile?.username || userProfile?.userName || 'User';
    const authorHandle = userProfile?.username || userProfile?.userName || 'user';
    const avatarSrc = userProfile?.profilePictureUrl || DEFAULT_AVATAR;

    const postElement = document.createElement('article');
    postElement.className = 'feed-item';
    postElement.dataset.postId = postId;
    postElement.innerHTML = `
        <div class="feed-item-header">
            <img src="${avatarSrc}" alt="${authorName}" class="feed-item-avatar">
            <div class="feed-item-meta">
                <div class="feed-item-user">
                    <span class="feed-item-name">${authorName}</span>
                    <span class="feed-item-handle">@${authorHandle}</span>
                </div>
                <span class="feed-item-time">${createdAt ? new Date(createdAt).toLocaleString() : 'now'}</span>
            </div>
            <button class="feed-item-menu" type="button">
                <span class="material-symbols-outlined">more_vert</span>
            </button>
        </div>
        <div class="feed-item-content">
            <p>${content}</p>
            ${tagsHTML}
            ${imageHTML}
        </div>
        <div class="feed-item-actions">
            <button class="feed-item-action" type="button"><span class="material-symbols-outlined">chat</span></button>
            <button class="feed-item-action" type="button"><span class="material-symbols-outlined">repeat</span></button>
            <button class="feed-item-action" type="button"><span class="material-symbols-outlined">favorite</span></button>
            <button class="feed-item-action" type="button"><span class="material-symbols-outlined">share</span></button>
        </div>
    `;

    feedPostsList.prepend(postElement);
    hideBanner();
    showBanner('Post created successfully!', 'success');
    return postElement;
}
