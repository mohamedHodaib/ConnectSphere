

export function showEmptyFeedState(feedList) {
    if (!feedList) return;
    hideEmptyFeedState(feedList);

    const emptyState = document.createElement('div');
    emptyState.className = 'feed-empty-state';
    emptyState.innerHTML = `
        <span class="material-symbols-outlined">dynamic_feed</span>
        <h3>No posts yet</h3>
        <p>Your feed is empty right now. Start the conversation by creating the first post.</p>
    `;

    feedList.appendChild(emptyState);
}

export function hideEmptyFeedState(feedList) {
    if (!feedList) return;

    const emptyState = feedList.querySelector('.feed-empty-state');
    if (emptyState) {
        emptyState.remove();
    }
}

//select elements 
const banner = document.getElementById("banner");
const bannerIcon = document.getElementById("banner-icon");
const bannerText = document.getElementById("banner-text");


export function showBanner(message, type) {
    bannerText.textContent = message;
    banner.className = "security_card_banner visible banner-" + type;
    
    if(type === "success") {
        bannerIcon.className = "fa-solid fa-circle-check";
    } else if(type === "info") {
        bannerIcon.className = "fa-solid fa-envelope";
    } else {
        bannerIcon.className = "fa-solid fa-triangle-exclamation";
    }
}

export function hideBanner() {
    banner.className = "security_card_banner";
}