import { register } from "./Api/userApi.js";
import {validateEmail, validateUsername, validatePassword, validateConfirmPassword } from "./validation.js";

const usernameField = document.querySelector("#username");
const emailField = document.querySelector("#email");
const passwordField = document.querySelector("#password");
const confirmPasswordField = document.querySelector("#confirm-password");
const createAccountForm = document.querySelector(".security_card_form");
const formError = document.querySelector(".security_card_form_error");
const submitBtn = document.querySelector(".security_card_form_submit");

document.addEventListener("DOMContentLoaded", () => {
    usernameField.focus();
});

usernameField.addEventListener("input", () => validateUsername(usernameField));
emailField.addEventListener("input", () => validateEmail(emailField));
passwordField.addEventListener("input", () => validatePassword(passwordField));
confirmPasswordField.addEventListener("input", () => validateConfirmPassword(passwordField, confirmPasswordField));

createAccountForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isUsernameValid = validateUsername(usernameField);
    const isEmailValid = validateEmail(emailField);
    const isPasswordValid = validatePassword(passwordField);
    const isConfirmValid = validateConfirmPassword(passwordField, confirmPasswordField);

    if (!isUsernameValid || !isEmailValid || !isPasswordValid || !isConfirmValid) {
        const firstInvalid = [
            [isUsernameValid, usernameField],
            [isEmailValid, emailField],
            [isPasswordValid, passwordField],
            [isConfirmValid, confirmPasswordField],
        ].find(([valid]) => !valid);

        if (firstInvalid) firstInvalid[1].focus();
        return;
    }

    formError.textContent = "";
    formError.classList.remove("visible");
    submitBtn.disabled = true;

    try {
        await register(
            usernameField.value.trim(),
            emailField.value.trim(),
            passwordField.value
        );

        sessionStorage.setItem("registeredEmail", emailField.value.trim());
        window.location.href = "../index.html?registered=true";

    } catch (err) {
        if (err.status === 409) {
            formError.textContent = "This email or username is already taken.";
        } else if (err.message === "Request timeout") {
            formError.textContent = "Server took too long to respond. Please try again.";
        } else if (err.status >= 500) {
            formError.textContent = "Something went wrong on our end. Please try later.";
        } else {
            formError.textContent = err.message || "Registration failed. Please try again.";
        }
        formError.classList.add("visible");
    } finally {
        submitBtn.disabled = false;
    }
});
