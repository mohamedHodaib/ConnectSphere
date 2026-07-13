
function getErrorSpan(input) {
    return input.closest(".security_card_form_group").querySelector(".security_card_form_group_error");
}


export function validateEmail(input) {
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

export function validateUsername(input) {
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


export function validatePassword(input) { 
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

export function validateConfirmPassword(passwordField, input) {
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