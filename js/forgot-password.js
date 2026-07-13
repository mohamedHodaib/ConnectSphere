import { forgotPassword } from "./Api/userApi.js";
import { validateEmail } from "./validation.js";
import { showBanner } from "./banner.js";

const emailField = document.querySelector("#email");
const securityForm = document.querySelector(".security_card_form");
const formError = document.querySelector(".security_card_form_error");
const submitBtn = document.querySelector(".security_card_form_submit");

document.addEventListener("DOMContentLoaded", () => {
    emailField.focus();
});

emailField.addEventListener("input", () => validateEmail(emailField));

securityForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isEmailValid = validateEmail(emailField);

    if (!isEmailValid) {
        emailField.focus();
        return;
    }

    formError.textContent = "";
    formError.classList.remove("visible");
    submitBtn.disabled = true;

    try {
        await forgotPassword(emailField.value.trim());
        showBanner("Password reset link has been sent to your email. Please check your inbox.", "success");
        securityForm.reset();
    } catch (err) {
        console.log(err);
        if (err.status === 400) {
            formError.textContent = "email is missing or not a valid email format.";
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
