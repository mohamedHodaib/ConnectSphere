import { resetPassword } from "./Api/userApi.js";
import { validatePassword, validateConfirmPassword } from "./validation.js";
import { showBanner } from "./banner.js";

const passwordField = document.querySelector("#password");
const confirmPasswordField = document.querySelector("#confirm-password");
const securityForm = document.querySelector(".security_card_form");
const formError = document.querySelector(".security_card_form_error");
const submitBtn = document.querySelector(".security_card_form_submit");

document.addEventListener("DOMContentLoaded", () => {
    passwordField.focus();
});

passwordField.addEventListener("input", () => validatePassword(passwordField));
confirmPasswordField.addEventListener("input", () => validateConfirmPassword(passwordField,confirmPasswordField));

securityForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isPasswordValid = validatePassword(passwordField);
    const isConfirmPasswordValid = validateConfirmPassword(passwordField, confirmPasswordField);

    if (!isPasswordValid || !isConfirmPasswordValid) {
        passwordField.focus();
        return;
    }

    formError.textContent = "";
    formError.classList.remove("visible");
    submitBtn.disabled = true;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get("email");
        const token = urlParams.get("token");
        
        if (!email || !token) {
            formError.textContent = "Invalid reset link. Please request a new password reset.";
            formError.classList.add("visible");
            securityForm.style.display = "none";
            return;
        }
        await resetPassword(email, token, passwordField.value.trim(), confirmPasswordField.value.trim());
        showBanner("Your password has been reset successfully.", "success");
        securityForm.reset();
    } catch (err) {
        //If the token is invalid, expired, or passwords do not match.
        console.log(err);
        if (err.status === 400) {
            formError.textContent = err.message;
            formError.classList.add("visible");
        } else if (err.message === "Request timeout") {
            formError.textContent = "Server took too long to respond. Please try again.";
            formError.classList.add("visible");
        } else if (err.status >= 500) {
            formError.textContent = "Something went wrong on our end. Please try later.";
            formError.classList.add("visible");
        } else {
            formError.textContent = err.message || "Failed to send reset link. Please try again.";
            formError.classList.add("visible");
        }
    } finally {
        submitBtn.disabled = false;
    }
});
