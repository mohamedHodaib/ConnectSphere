

import { GetBookmarks, DeleteBookmark } from './Api/postApi.js';
import { showEmptyFeedState, hideEmptyFeedState, showBanner, hideBanner } from './util/show.js'
import { createPagination } from './util/pagination.js'

//frequently used elements 
const bookmarksContainer = document.querySelector('.bookmarks-container');

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
    
    try {
        //handle load bookmarks
        await handleLoadingBookmarks();
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
            const bookmarksCenter = document.querySelector('.bookmarks-center');
            bookmarksCenter.innerHTML = `
                <div class="error-message">
                    <span class="material-symbols-outlined">error</span>
                    <p>Something went wrong. Please try again later.</p>
                    <button class="retry-btn" onclick="location.reload()">Retry</button>
                </div>
            `;
        }
    }



});

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


async function handleDeleteBookmark(bookmarkId, bookmarkCard) {
    try {
        await DeleteBookmark(bookmarkId);
        bookmarkCard.remove();

        if (!bookmarksContainer.querySelector('.bookmark-card')) {
            showEmptyFeedState(bookmarksContainer);
        }
    } catch (error) {
        if(error.status === 401) {
            localStorage.removeItem('token');
            window.location.replace('/login.html');
            return;
        }

        showBanner('Unable to remove bookmark. Please try again.', 'error');
        throw error;
    }
}

async function handleLoadingBookmarks() {
    const bookmarkPagination = createPagination({
        pageSize: 20,

        fetchData: GetBookmarks,

        renderItems(bookmarks) {
            bookmarks.forEach(CreateBookmarkCard);
        },

        emptyState: {
            show() {
                showEmptyFeedState(bookmarksContainer);
            },

            hide() {
                hideEmptyFeedState(bookmarksContainer);
            },

            clear() {
                bookmarksContainer.innerHTML = "";
            }
        }
    });

    await bookmarkPagination.load(true);
    bookmarkPagination.attachInfiniteScroll();
}