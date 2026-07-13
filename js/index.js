import { getUserProfile } from './Api/userApi.js';
import { CreatePost, GetPosts } from './Api/postApi.js';
import { showBanner, hideBanner } from './banner.js';
import { getFollowSuggestions } from './Api/userApi.js';
import { followUser } from './Api/userApi.js';

let selectedImages = [];
let feedPage = 1;
const FEED_PAGE_SIZE = 10;
let feedLoading = false;
let feedHasMore = true;
let feedPostsList = null;
let loadFeed = async () => {};

document.addEventListener('DOMContentLoaded', async function () {
    // Check if user is logged in
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.replace('/login.html');
        return;
    }

    feedPostsList = document.querySelector('.feed-posts-list');

    // Select element to create post
        const postContent = document.querySelector('.compose-textarea');
        const postSubmitBtn = document.querySelector('.compose-post-btn');
        const toolbarBtns = document.querySelectorAll('.compose-icon-btn');
        const imageInput = document.getElementById('imageUpload');
        const imagePreview = document.querySelector('.compose-image-preview');

    try {
        // Set user info in the page
        const userProfile = await getUserProfile();

        // Update compose avatar
        const composeAvatar = document.querySelector('.compose-avatar');

        if (userProfile.profilePictureUrl) {
            composeAvatar.src = userProfile.profilePictureUrl;
        }

        composeAvatar.alt = userProfile.userName;

        // Handle feed loading
        handleFeedLoading();

        // Handle image selection
        handleImageSelection();
        
        // Handle image removal from preview
        handleImageRemoval();

        // Handle post submission
        handlePostSubmission();


        //Handle follow suggestions
        handleFollowSuggestions();


        //handle follow button click
        handleFollowButtonClick();

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
});

window.addEventListener('scroll', () => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300) {
        loadFeed();
    }
});

function showEmptyFeedState() {
    if (!feedPostsList) return;
    hideEmptyFeedState();

    const emptyState = document.createElement('div');
    emptyState.className = 'feed-empty-state';
    emptyState.innerHTML = `
        <span class="material-symbols-outlined">dynamic_feed</span>
        <h3>No posts yet</h3>
        <p>Your feed is empty right now. Start the conversation by creating the first post.</p>
    `;

    feedPostsList.appendChild(emptyState);
}

function hideEmptyFeedState() {
    if (!feedPostsList) return;

    const emptyState = feedPostsList.querySelector('.feed-empty-state');
    if (emptyState) {
        emptyState.remove();
    }
}

// Extract tags from post content
function extractTags(content) {
    const tagRegex = /#[\w]+/g;
    const tags = content.match(tagRegex) || [];
    return tags.map((tag) => tag.substring(1));
}

// Create Post feed item
function CreatePostFeedItem(content, tags, postId, userProfile, imagesUrls, createdAt) {
    if (!feedPostsList) {
        feedPostsList = document.querySelector('.feed-posts-list');
    }

    if (feedPostsList) {
        const emptyState = feedPostsList.querySelector('.feed-empty-state');
        if (emptyState) {
            emptyState.remove();
        }
    }

    const tagsHTML = tags.length > 0
        ? `<div class="feed-item-tags">${tags.map((tag) => `<a href="#${tag}" class="tag">#${tag}</a>`).join(' ')}</div>`
        : '';

    const imagesContainer = document.createElement('div');
    imagesContainer.className = 'feed-item-images';

    const imageHTML = imagesUrls && imagesUrls.length > 0
        ? imagesUrls.map((url) => `<img src="${url}" alt="Post image" class="compose-image-preview-item">`).join('')
        : '';

    imagesContainer.innerHTML = imageHTML;

    const postElement = document.createElement('article');
    postElement.className = 'feed-item';
    postElement.innerHTML = `
        <div class="feed-item-header">
            <img src="${userProfile.profilePictureUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}"
                alt="${userProfile.userName}" class="feed-item-avatar">
            <div class="feed-item-meta">
                <div class="feed-item-user">
                    <span class="feed-item-name">${userProfile.displayname || userProfile.username || userProfile.userName || 'User'}</span>
                    <span class="feed-item-handle">@${userProfile.username || userProfile.userName || ''}</span>
                </div>
                <span class="feed-item-time">${createdAt ? new Date(createdAt).toLocaleString() : 'now'}</span>
            </div>
            <button class="feed-item-menu">
                <span class="material-symbols-outlined">more_vert</span>
            </button>
        </div>
        <div class="feed-item-content">
            <p>${content}</p>
            ${tagsHTML}
            ${imagesContainer.outerHTML}
        </div>
        <div class="feed-item-actions">
            <button class="feed-item-action"><span class="material-symbols-outlined">chat</span></button>
            <button class="feed-item-action"><span class="material-symbols-outlined">repeat</span></button>
            <button class="feed-item-action"><span class="material-symbols-outlined">favorite</span></button>
            <button class="feed-item-action"><span class="material-symbols-outlined">share</span></button>
        </div>
    `;

    if (feedPostsList) {
        feedPostsList.prepend(postElement);
    }

    hideBanner();
    showBanner('Post created successfully!', 'success');
}

function handleEmojiPicker() {
    // Show the emoji picker overlay
    const picker = document.querySelector('.emoji-picker-overlay');
    picker.classList.remove('hidden');

    // Populate emoji grid (basic implementation)
    const emojiGrid = document.querySelector('.emoji-grid');
    const reactions = [
        { type: 'Like', emoji: '👍' },
        { type: 'Love', emoji: '❤️' },
        { type: 'Haha', emoji: '😂' },
        { type: 'Wow', emoji: '😮' },
        { type: 'Sad', emoji: '😢' },
        { type: 'Angry', emoji: '😡' },
        { type: 'Care', emoji: '🤗' },
    ];

    emojiGrid.innerHTML = '';
    reactions.forEach((reaction) => {
        const div = document.createElement('div');
        div.className = 'emoji-item';

        div.dataset.type = reaction.type;
        div.dataset.emoji = reaction.emoji;

        div.textContent = reaction.emoji;
        div.addEventListener('click', () => {
            const textarea = document.querySelector('.compose-textarea');
            textarea.value += reaction.emoji;
            picker.classList.add('hidden');
        });
        emojiGrid.appendChild(div);
    });

    // Close button functionality
    document.querySelector('.emoji-picker-close').addEventListener('click', () => {
        picker.classList.add('hidden');
    });
}


function CreateFollowSuggestionsUsers(users) {
    const suggestionsContainer = document.querySelector('.who-to-follow-card');
    if (!suggestionsContainer) return;

    suggestionsContainer.innerHTML = '';

    if (!users || users.length === 0) {
        suggestionsContainer.innerHTML = `
            <p>No follow suggestions available at the moment.</p>
        `;
        return;
    }

    // Create user suggestion elements
    users.forEach((user) => {
        const userElement = document.createElement('div');
        userElement.className = 'follow-user';

        userElement.innerHTML = `
            <img src="${user.profilePicture ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown'}" alt="${user.displayName}" class="follow-user-avatar">
            <div class="follow-user-info">
                <span class="follow-user-name">${user.displayName}</span>
                <span class="follow-user-handle">@${user.userName}</span>
            </div>
            <button class="follow-user-btn" data-user-id="${user.id}">Follow</button>
        `;

            suggestionsContainer.appendChild(userElement);
        });
}

//Handle Image selection and removal from preview
const renderImagePreview = () => {
    imagePreview.innerHTML = '';
    selectedImages.forEach((image, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML += `
                <div class="compose-image-preview-item" data-index="${index}">
                    <img src="${e.target.result}" alt="Selected image">
                    <button class="compose-image-preview-remove" title="Remove image">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            `;
        };
        reader.readAsDataURL(image);
    });
};

//Handle image selection
function handleImageSelection() {
    imageInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (!files.length) return;

        if (!files[0].type.startsWith('image/')) {
            showBanner('Please select a valid image file.', 'warning');
            imageInput.value = '';
            return;
        }

        selectedImages = Array.from(files);
        renderImagePreview();
    });
}

//handle image removal from preview
function handleImageRemoval() {
    imagePreview.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.compose-image-preview-remove');
        if (!removeButton) return;
    
        const previewItem = removeButton.closest('.compose-image-preview-item');
        if (!previewItem) return;
    
        const removeIndex = Number(previewItem.dataset.index);
        if (Number.isNaN(removeIndex)) return;
    
        selectedImages.splice(removeIndex, 1);
        if (!selectedImages.length) {
            imageInput.value = '';
        }
        renderImagePreview();
    });
}

    
// *********************************************************************

//calling Api

//Handle Feed loading
loadFeed = async function (reset = false) {
        if (feedLoading || (!feedHasMore && !reset)) return;
        feedLoading = true;

        if (reset) {
            feedPage = 1;
            feedHasMore = true;
            if (feedPostsList) {
                feedPostsList.innerHTML = '';
            }
        }

        try {
            const data = await GetPosts(feedPage, FEED_PAGE_SIZE);
            const posts = Array.isArray(data) ? data : data.items || [];

            if (!posts.length) {
                showEmptyFeedState();
            } else {
                hideEmptyFeedState();
                posts.forEach((post) => {
                    CreatePostFeedItem(
                        post.content || '',
                        post.tags || [],
                        post.id,
                        userProfile,
                        post.imagesURLs || post.images || [],
                        post.createdAt || null
                    );
                });
            }

            if (posts.length < FEED_PAGE_SIZE) {
                feedHasMore = false;
            } else {
                feedPage += 1;
            }
        } catch (err) {
            throw err; // will be caught by the global error handler in the DOMContentLoaded event listener
        } finally {
            feedLoading = false;
        }
};

async function handleFeedLoading() {
    await loadFeed(true);
}

// Handle post submission

function handlePostSubmission() {
    // Handle toolbar buttons
    toolbarBtns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (index === 0) imageInput.click();
            if (index === 1) handleEmojiPicker();
        });
    });
    
    postSubmitBtn.addEventListener('click', async function () {
        this.disabled = true;

        const content = postContent.value.trim();
        if (content || selectedImages.length) {
            hideBanner();
            try {
                const tags = extractTags(content);
                const response = await CreatePost(content, tags, selectedImages);

                const contentText = content.replace(/#[\w]+/g, '');
                const imagesURLs = response.imagesURls || response.imagesUrls || [];

                hideEmptyFeedState();
                CreatePostFeedItem(contentText, tags, response.postId || response.id, userProfile, imagesURLs, response.createdAt || null);

                postContent.value = '';
                selectedImages = [];
                imageInput.value = '';
                imagePreview.innerHTML = '';
            } catch (error) {
                //will be caught by the global error handler in the DOMContentLoaded event listener
                throw error;
            }
        } else {
            showBanner('Post content cannot be empty.', 'warning');
        }

        this.disabled = false;
    });
}

//Handle follow button click
function handleFollowButtonClick() {
    const followButtons = document.querySelectorAll('.follow-user-btn');
    followButtons.forEach((button) => {
        button.addEventListener('click', async function () {
            const userId = this.getAttribute('data-user-id');
            try {
                await followUser(userId);
                this.textContent = 'Following';
                this.disabled = true;
            } catch (error) {
                if (error.status === 409) {
                    showBanner('You are already following this user.', 'warning');
                }
                else if (error.status === 404) {
                    showBanner('User not found. Please refresh the suggestions.', 'warning');
                }
                else {
                    throw error;
                }
            }
        });
    });
}

//Handle get follow suggestions
async function handleFollowSuggestions() {
    try {
        const followSuggestionsUsers = await getFollowSuggestions();

        CreateFollowSuggestionsUsers(followSuggestionsUsers);
    } catch (error) {
        throw error; // will be caught by the global error handler in the DOMContentLoaded event listener
    }
}