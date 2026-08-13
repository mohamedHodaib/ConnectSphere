import { updateSettings, getSettings } from './Api/userApi.js';
import { showBanner } from './util/show.js';

const saveChangesBtn = document.querySelector('.security_card_form_submit');
const profilePictureInput = document.querySelector('#profile-picture');
const profileAvatar = document.querySelector('.profile-avatar');

const firstNameInput = document.querySelector('#first-name');
const lastNameInput = document.querySelector('#last-name');
const usernameInput = document.querySelector('#username');
const bioInput = document.querySelector('#bio');
const isPrivateInput = document.querySelector('#is-private');
const showOnlineStatusInput = document.querySelector('#show-online-status');
const emailNotificationsInput = document.querySelector('#email-notifications');

if (profilePictureInput) {
    profilePictureInput.addEventListener('change', function () {
        const file = profilePictureInput.files && profilePictureInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (event) {
            if (event.target?.result) {
                profileAvatar.src = event.target.result;
            }
        };
        reader.readAsDataURL(file);
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    // Check if user is logged in
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.replace('/login.html');
        return;
    }
    //handle loading settings info
    try {
        await handleLoadingSettingsInfo();
    } catch (error) {
        if(error.message === 'Request timeout') {
            showBanner('Server took too long to respond. Please try again.', 'error');
        }
        if(error.status === 400) {
            showBanner(error.message, 'warning');
        }
        if (error.status === 401) {
            localStorage.removeItem('token');
            window.location.replace('/login.html');
        }
    
        if (error.status === 404) {
            localStorage.removeItem('token');
            window.location.replace('/login.html');
            sessionStorage.setItem('loginMessage', 'User not found. Please log in again.');
        }
    
        if (error.status === 500) {
            showBanner('Server error. Please try again later.', 'error');
            return;
        }
    }
});


//handle clicking save 
if (saveChangesBtn) {
    saveChangesBtn.addEventListener('click', async function () {
        try {
            const formData = new FormData();

            formData.append('FirstName', firstNameInput.value.trim());
            formData.append('LastName', lastNameInput.value.trim());
            formData.append('Username', usernameInput.value.trim());
            formData.append('Biography', bioInput.value.trim());
            formData.append('IsPrivate', isPrivateInput.checked ? 'true' : 'false');
            formData.append('ShowOnlineStatus', showOnlineStatusInput.checked ? 'true' : 'false');
            formData.append('EmailNotificationsEnabled', emailNotificationsInput.checked ? 'true' : 'false');

            if (profilePictureInput.files && profilePictureInput.files.length > 0) {
                formData.append('ProfilePicture', profilePictureInput.files[0]);
            }

            await updateSettings(formData);
            showBanner('Settings saved successfully.', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            // if (error.message === 'Request timeout') {
            //     showBanner('Server took too long to respond. Please try again.', 'error');
            //     return;
            // }

            // if (error.status === 400) {
            //     showBanner(error.data?.detail || error.message || 'Validation error.', 'warning');
            //     return;
            // }

            // if (error.status === 401) {
            //     localStorage.removeItem('token');
            //     window.location.replace('/login.html');
            //     return;
            // }

            // if (error.status === 404) {
            //     localStorage.removeItem('token');
            //     window.location.replace('/login.html');
            //     sessionStorage.setItem('loginMessage', 'User not found. Please log in again.');
            //     return;
            // }

            // if (error.status === 500) {
            //     showBanner('Server error. Please try again later.', 'error');
            //     return;
            // }

            // showBanner(error.message || 'Unable to save settings. Please try again.', 'error');
        }
    });
}

async function handleLoadingSettingsInfo() {
    console.log('Loading settings info...');
    const settings = await getSettings();
    if (!settings) return;

    console.log('Settings loaded:', settings);

    firstNameInput.value = settings.firstName || '';
    lastNameInput.value = settings.lastName || '';
    usernameInput.value = settings.username || '';
    bioInput.value = settings.biography || '';
    isPrivateInput.checked = settings.isPrivate ?? false;
    showOnlineStatusInput.checked = settings.showOnlineStatus ?? false;
    emailNotificationsInput.checked = settings.emailNotificationsEnabled ?? false;

    if (settings.profilePictureUrl) {
        profileAvatar.src = settings.profilePictureUrl;
    }
}



