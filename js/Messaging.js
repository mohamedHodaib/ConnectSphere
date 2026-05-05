document.addEventListener('DOMContentLoaded', () => {
    
    let currentUser = 'Alex Rivera'; 
    const blockedUsers = new Set();  
    const mutedUsers = new Set();    

    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');

    const chatDetailsButtons = document.querySelectorAll('.chat-details li');
    const muteBtn = chatDetailsButtons[0];
    const searchBtn = chatDetailsButtons[1];
    const blockBtn = chatDetailsButtons[2];
    const listSearchInput = document.querySelector('.list-search input'); 

    function updateChatUI() {
      
        if (blockedUsers.has(currentUser)) {
            blockBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Unblock User';
            blockBtn.style.color = '#888';
            blockBtn.classList.remove('danger');
            
            messageInput.disabled = true;
            messageInput.placeholder = `You blocked ${currentUser}. You can't send messages.`;
            messageInput.style.backgroundColor = "#e0e0e0";
            
            sendBtn.disabled = true;
            sendBtn.style.opacity = "0.5";
            sendBtn.style.cursor = "not-allowed";
        } else {
            blockBtn.innerHTML = '<i class="fa-solid fa-ban"></i> Block User';
            blockBtn.style.color = '';
            blockBtn.classList.add('danger');
            
            messageInput.disabled = false;
            messageInput.placeholder = "Type a message...";
            messageInput.style.backgroundColor = "";
            
            sendBtn.disabled = false;
            sendBtn.style.opacity = "1";
            sendBtn.style.cursor = "pointer";
        }

     
        if (mutedUsers.has(currentUser)) {
            muteBtn.innerHTML = '<i class="fa-solid fa-bell"></i> Unmute Notifications';
            muteBtn.style.color = '#888';
        } else {
            muteBtn.innerHTML = '<i class="fa-solid fa-bell-slash"></i> Mute Notifications';
            muteBtn.style.color = ''; 
        }
    }


    function sendMessage() {
        if (messageInput.disabled) return;

        const text = messageInput.value.trim();
        if (text !== '') {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message sent';
            
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            messageDiv.innerHTML = `
                <div class="bubble">${text}</div>
                <span class="msg-time">${timeString} <i class="fa-solid fa-check"></i></span>
            `;

            chatMessages.appendChild(messageDiv);
            messageInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    const chatItems = document.querySelectorAll('.chat-item');
    const chatHeaderName = document.querySelector('.chat-header .user-info strong');
    const chatHeaderImg = document.querySelector('.chat-header .user-info img');
    
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
         
            chatItems.forEach(chat => chat.classList.remove('active'));
            this.classList.add('active');

         
            currentUser = this.querySelector('.name-time strong').innerText;
            chatHeaderName.innerText = currentUser;

           
            const img = this.querySelector('img');
            if (img) {
                chatHeaderImg.src = img.src;
                chatHeaderImg.style.display = 'block';
            } else {
                chatHeaderImg.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser) + '&background=d66426&color=fff';
            }

           
            updateChatUI();
        });
    });

    
    blockBtn.addEventListener('click', function() {
        if (blockedUsers.has(currentUser)) {
            blockedUsers.delete(currentUser); 
        } else {
            blockedUsers.add(currentUser); 
        }
        updateChatUI(); 
    });

  
    muteBtn.addEventListener('click', function() {
        if (mutedUsers.has(currentUser)) {
            mutedUsers.delete(currentUser); 
        } else {
            mutedUsers.add(currentUser); 
        }
        updateChatUI();
    });

   
    searchBtn.addEventListener('click', function() {
        listSearchInput.focus(); 
        listSearchInput.placeholder = `Search in ${currentUser}'s chat...`; 
        
        
        this.style.color = '#5b4bf6';
        setTimeout(() => {
            this.style.color = '';
        }, 500);
    });


    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

   
    updateChatUI();
});