import { register }  from "./Api/userApi.js";

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

function getErrorSpan(input) {
    return input.closest(".security_card_form_group").querySelector(".security_card_form_group_error");
}

function validateUsername(input) {
    const container = input.closest(".security_card_form_group_input_container");
    const errorSpan = getErrorSpan(input);
    const value = input.value.trim();

    if (value === "") {
        container.classList.add("error");
        errorSpan.textContent = "This field is required";
        return false;
    } else if (value.length < 3) {
        container.classList.add("error");
        errorSpan.textContent = "Username must be at least 3 characters";
        return false;
    } else {
        container.classList.remove("error");
        return true;
    }
}

function validateEmail(input) {
    const container = input.closest(".security_card_form_group_input_container");
    const errorSpan = getErrorSpan(input);
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (value === "") {
        container.classList.add("error");
        errorSpan.textContent = "This field is required";
        return false;
    } else if (!emailRegex.test(value)) {
        container.classList.add("error");
        errorSpan.textContent = "Please enter a valid email address";
        return false;
    } else {
        container.classList.remove("error");
        return true;
    }
}

function validatePassword(input) { 
    const container = input.closest(".security_card_form_group_input_container"); 
    const errorSpan = getErrorSpan(input); 
    const value = input.value.trim(); 

    if (value === "") { 
        container.classList.add("error"); 
        errorSpan.textContent = "This field is required"; 
        return false; 
    } 

    if (value.length < 8) { 
        container.classList.add("error"); 
        errorSpan.textContent = "Password must be at least 8 characters"; 
        return false; 
    }

    if (!/[A-Z]/.test(value)) {
        container.classList.add("error");
        errorSpan.textContent = "Must contain at least one uppercase letter";
        return false;
    }

    if (!/[a-z]/.test(value)) {
        container.classList.add("error");
        errorSpan.textContent = "Must contain at least one lowercase letter";
        return false;
    }

    if (!/[0-9]/.test(value)) {
        container.classList.add("error");
        errorSpan.textContent = "Must contain at least one number";
        return false;
    }

    //  valid
    container.classList.remove("error"); 
    errorSpan.textContent = "";
    return true; 
}

function validateConfirmPassword(input) {
    const container = input.closest(".security_card_form_group_input_container");
    const errorSpan = getErrorSpan(input);
    const value = input.value;

    if (value === "") {
        container.classList.add("error");
        errorSpan.textContent = "This field is required";
        return false;
    } else if (value !== passwordField.value) {
        container.classList.add("error");
        errorSpan.textContent = "Passwords do not match";
        return false;
    } else {
        container.classList.remove("error");
        return true;
    }
}

usernameField.addEventListener("input", () => validateUsername(usernameField));
emailField.addEventListener("input", () => validateEmail(emailField));
passwordField.addEventListener("input", () => validatePassword(passwordField));
confirmPasswordField.addEventListener("input", () => validateConfirmPassword(confirmPasswordField));

createAccountForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isUsernameValid = validateUsername(usernameField);
    const isEmailValid = validateEmail(emailField);
    const isPasswordValid = validatePassword(passwordField);
    const isConfirmValid = validateConfirmPassword(confirmPasswordField);

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
        window.location.href = "../index.html";

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
