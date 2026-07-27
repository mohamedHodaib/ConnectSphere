

export function showEmptyFeedState(contentList) {
    if (!contentList) return;
    hideEmptyFeedState(contentList);

    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
        <span class="material-symbols-outlined">dynamic_feed</span>
        <h3>No content yet</h3>
    `;

    contentList.appendChild(emptyState);
}

export function hideEmptyFeedState(contentList) {
    if (!contentList) return;

    const emptyState = contentList.querySelector('.empty-state');
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