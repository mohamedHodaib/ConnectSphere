//Import users api file to call api
import { login } from "./Api/userApi.js";

//select elements
const emailField = document.querySelector("#email");
const passwordField = document.querySelector("#password");
const securityForm = document.querySelector(".security_card_form");
const formError = document.querySelector(".security_card_form_error");
const submitBtn = document.querySelector(".security_card_form_submit");
const rememberMe = document.querySelector("#remember-me");
const banner = document.getElementById("banner");
const bannerIcon = document.getElementById("banner-icon");
const bannerText = document.getElementById("banner-text");

function showBanner(message, type) {
    bannerText.textContent = message;
    banner.className = "security_card_banner visible banner-" + type;
    bannerIcon.className = type === "info"
        ? "fa-solid fa-envelope"
        : "fa-solid fa-triangle-exclamation";
}

document.addEventListener("DOMContentLoaded", () => {
    //handle user not found when redirect from home page
    const loginMessage = sessionStorage.getItem("loginMessage");
    if (loginMessage) {
        showBanner(loginMessage, "warning");
        sessionStorage.removeItem("loginMessage");
    }

    
    const savedEmail = localStorage.getItem("rememberedEmail") || sessionStorage.getItem("rememberedEmail");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (savedEmail) {
        emailField.value = savedEmail;
        sessionStorage.removeItem("rememberedEmail");
        rememberMe.checked = true;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
        showBanner("Registration successful! Please check your email to confirm your account.", "info");

        const registeredEmail = sessionStorage.getItem("registeredEmail");
        if (registeredEmail) {
            emailField.value = registeredEmail;
            sessionStorage.removeItem("registeredEmail");
        }
    }

    emailField.focus();
});

function validateField(input) {
    const container = input.closest(".security_card_form_group_input_container");
    if (input.value.trim() === "") {
        container.classList.add("error");
        return false;
    } else {
        container.classList.remove("error");
        return true;
    }
}

function redirectToLatestPage() {
    const redirectTo = sessionStorage.getItem("redirectTo");
    if (redirectTo) {
        window.location.replace(redirectTo);
        sessionStorage.removeItem("redirectTo");
    } else {
        window.location.replace("/index.html");
    }
}

emailField.addEventListener("input", () => validateField(emailField));
passwordField.addEventListener("input", () => validateField(passwordField));

securityForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    //Validate form buttons
    const isEmailValid = validateField(emailField);
    const isPasswordValid = validateField(passwordField);

    if (!isEmailValid || !isPasswordValid) {
        const firstInvalid = !isEmailValid ? emailField : passwordField;
        firstInvalid.focus();
    } else {
        formError.textContent = "";
        formError.classList.remove("visible");
        submitBtn.disabled = true;

        try {
            const res = await login(
                emailField.value,
                passwordField.value
            );

            //Get token
            const token = res.accessToken;
            const refreshToken = res.refreshToken;

            if (rememberMe.checked) {
                // Persistent login
                localStorage.setItem("token", token);
                localStorage.setItem("refreshToken", refreshToken);
                localStorage.setItem("rememberedEmail", emailField.value);
            } else {
                // Temporary login (cleared when browser closes)
                sessionStorage.setItem("token", token);
                sessionStorage.setItem("refreshToken", refreshToken);
                localStorage.removeItem("rememberedEmail");

                // remove any old persistent tokens
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");

            }
            
            //how to redirect user to the page they were trying to access before login
            redirectToLatestPage();
        } catch (err) {
            if (err.status === 401) {
                const detail = (err.data?.detail || err.message || "").toLowerCase();
                if (detail.includes("confirm") || detail.includes("verified") || detail.includes("activate")) {
                    showBanner("Please confirm your email before logging in. Check your inbox for the confirmation link.", "warning");
                } else {
                    formError.textContent = "Invalid email or password.";
                    formError.classList.add("visible");
                }
            } else if (err.message === "Request timeout") {
                formError.textContent = "Server took too long to respond. Please try again.";
                formError.classList.add("visible");
            } else if (err.status >= 500) {
                formError.textContent = "Something went wrong on our end. Please try later.";
                formError.classList.add("visible");
            } else {
                formError.textContent = err.message || "Login failed. Please try again.";
                formError.classList.add("visible");
            }
        } finally {
            submitBtn.disabled = false;
        }
    }
});
