import { confirmEmail } from "./Api/userApi.js";

const loadingEl = document.getElementById("loading");
const successEl = document.getElementById("success");
const errorEl = document.getElementById("error");
const errorMessage = document.getElementById("error-message");

function showState(state, message) {
    loadingEl.style.display = "none";
    successEl.style.display = "none";
    errorEl.style.display = "none";

    if (state === "success") {
        successEl.style.display = "flex";
    } else {
        if (message) errorMessage.textContent = message;
        errorEl.style.display = "flex";
    }
}

async function verify() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (!token || !userId) {
        showState("error", "Invalid confirmation link. Missing required parameters.");
        return;
    }

    try {
        await confirmEmail(token, userId);
        showState("success");
    } catch (err) {
        console.log(err);
        if (err.message === "Request timeout") {
            showState("error", "Server took too long to respond. Please try again later.");
        } else if (err.status >= 500) {
            showState("error", "Something went wrong on our end. Please try again later.");
        } else {
            showState("error", err.message || "The confirmation link is invalid or has expired.");
        }
    }
}

verify();
