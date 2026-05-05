//Import users api file to call api
import { login } from "./Api/userApi.js";

//select elements
const emailField = document.querySelector("#email");
const passwordField = document.querySelector("#password");
const loginForm = document.querySelector(".login_card_form");
const formError = document.querySelector(".login_card_form_error");
const submitBtn = document.querySelector(".login_card_form_submit");
const rememberMe = document.querySelector("#remember-me");

document.addEventListener("DOMContentLoaded", () => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (savedEmail) {
        emailField.value = savedEmail;
        rememberMe.checked = true;
    }

    if (token) {
        // redirect user to home page
        window.location.href = "../home.html";
        return;
    }

    emailField.focus();
});

function validateField(input) {
    const container = input.closest(".login_card_form_group_input_container");
    if (input.value.trim() === "") {
        container.classList.add("error");
        return false;
    } else {
        container.classList.remove("error");
        return true;
    }
}

emailField.addEventListener("input", () => validateField(emailField));
passwordField.addEventListener("input", () => validateField(passwordField));

loginForm.addEventListener("submit", async (e) => {

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
            const token = res.token;
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
        } catch (err) {
            if (err.status === 401) {
                formError.textContent = "Invalid email or password.";
            } else if (err.message === "Request timeout") {
                formError.textContent = "Server took too long to respond. Please try again.";
            } else if (err.status >= 500) {
                formError.textContent = "Something went wrong on our end. Please try later.";
            } else {
                formError.textContent = err.data?.detail || "Login failed. Please try again.";
            }
            formError.classList.add("visible");
        } finally {
            submitBtn.disabled = false;
        }
    }
});
