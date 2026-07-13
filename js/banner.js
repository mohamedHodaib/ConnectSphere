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