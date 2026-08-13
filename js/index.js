import { getUserProfile } from './Api/userApi.js';
import { CreatePost, GetPosts } from './Api/postApi.js';
import { getFollowSuggestions } from './Api/userApi.js';
import { followUser, unfollowUser } from './Api/userApi.js';
import { showEmptyFeedState, hideEmptyFeedState, showBanner, hideBanner } from './util/show.js'
import { createPagination } from './util/pagination.js'
import { extractTags, CreatePostFeedItem } from './util/post.js';

let selectedImages = [];
let feedPostsList = null;

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
        await handleFeedLoading();

        // Handle image selection
        handleImageSelection();
        
        // Handle image removal from preview
        handleImageRemoval();

        // Handle post submission
        handlePostSubmission();


        //Handle follow suggestions
        await handleFollowSuggestions();


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
        userElement.dataset.profileUrl = `profile.html?user=${encodeURIComponent(user.userName)}`;

        userElement.innerHTML = `
            <img src="${user.profilePicture ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Unknown'}" alt="${user.displayName}" class="follow-user-avatar">
            <div class="follow-user-info">
                <span class="follow-user-name">${user.displayName}</span>
                <span class="follow-user-handle">@${user.userName}</span>
            </div>
            <button class="follow-user-btn" data-user-id="${user.id}" type="button">Follow</button>
        `;

        userElement.addEventListener('click', (event) => {
            if (event.target.closest('.follow-user-btn')) {
                return;
            }

            const profileUrl = event.currentTarget.dataset.profileUrl;
            if (profileUrl) {
                window.location.href = profileUrl;
            }
        });

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
async function handleFeedLoading() {
        const feedPagination = createPagination({

        pageSize: 10,

        fetchData: GetPosts,

        renderItems(posts) {
            posts.forEach((post) => {
                CreatePostFeedItem({
                    content: post.content || '',
                    tags: post.tags || [],
                    postId: post.id,
                    userProfile,
                    imagesUrls: post.imagesURls || post.imagesURLs || post.images || [],
                    createdAt: post.createdAt || null
                });
            });
        },

        emptyState: {
            show() {
                showEmptyFeedState(feedPostsList);
            },

            hide() {
                hideEmptyFeedState(feedPostsList);
            },

            clear() {
                feedPostsList.innerHTML = "";
            }
        }

    });

    await feedPagination.load(true);

    feedPagination.attachInfiniteScroll();
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

                hideEmptyFeedState(feedPostsList);
                CreatePostFeedItem({
                    content: contentText,
                    tags,
                    postId: response.postId || response.id,
                    userProfile,
                    imagesUrls: imagesURLs,
                    createdAt: response.createdAt || null
                });

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
async function handleFollowClick(button) {
    const userId = button.dataset.userId;
    const isFollowing = button.dataset.following === "true";

    try {
        if (isFollowing) {
            await unfollowUser(userId);
            button.textContent = "Follow";
            button.dataset.following = "false";
        } else {
            await followUser(userId);
            button.textContent = "Following";
            button.dataset.following = "true";
        }
    } catch (error) {
        // Handle errors
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
}

function handleFollowButtonClick() {
    document.querySelectorAll(".follow-user-btn").forEach(button => {
        button.addEventListener("click", () => handleFollowClick(button));
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