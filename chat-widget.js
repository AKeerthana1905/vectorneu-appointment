(function() {
    // Default configuration
    const defaultConfig = {
        webhook: { url: '', route: '' },
        branding: {
            logo: '',           // Company logo URL
            name: 'Vectorneu',  // Company name for fallback initials
            welcomeText: 'Hi 👋, how can we help?',
            responseTimeText: 'We usually respond right away'
        },
        style: {
            primaryColor: '#54dde4',
            secondaryColor: '#172565',
            position: 'right',
            backgroundColor: '#ffffff',
            fontColor: '#333333'
        }
    };

    const config = window.ChatWidgetConfig ? {
        webhook: { ...defaultConfig.webhook, ...window.ChatWidgetConfig.webhook },
        branding: { ...defaultConfig.branding, ...window.ChatWidgetConfig.branding },
        style: { ...defaultConfig.style, ...window.ChatWidgetConfig.style }
    } : defaultConfig;

    if (window.N8NChatWidgetInitialized) return;
    window.N8NChatWidgetInitialized = true;

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        .n8n-chat-widget { position: fixed; bottom: 20px; ${config.style.position}: 20px; width: 360px; height: 500px; border-radius: 12px; overflow: hidden; font-family: Arial, sans-serif; z-index: 999; }
        .chat-container { width: 100%; height: 100%; display: flex; flex-direction: column; border: 1px solid #ccc; background: ${config.style.backgroundColor}; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .chat-container.open { display: flex; }
        .chat-interface { display: flex; flex-direction: column; height: 100%; }
        .brand-header { display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #ddd; }
        .brand-header img { width: 32px; height: 32px; border-radius: 50%; margin-right: 8px; }
        .brand-header span { font-weight: bold; font-size: 16px; color: ${config.style.fontColor}; }
        .close-button { margin-left: auto; background: none; border: none; font-size: 20px; cursor: pointer; color: ${config.style.fontColor}; }
        .chat-messages { flex: 1; padding: 12px; display: flex; flex-direction: column; gap: 10px; overflow-y: auto; }
        .chat-message { display: flex; align-items: flex-end; gap: 8px; }
        .chat-message.user { flex-direction: row-reverse; justify-content: flex-end; }
        .chat-message.bot { flex-direction: row; justify-content: flex-start; }
        .chat-avatar { width: 32px; height: 32px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: #ddd; font-weight: bold; font-size: 14px; color: #555; }
        .chat-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .chat-avatar .avatar-fallback { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
        .chat-bubble { padding: 10px 14px; border-radius: 12px; max-width: 70%; word-wrap: break-word; font-size: 14px; line-height: 1.4; }
        .chat-bubble.user { background: linear-gradient(135deg, ${config.style.primaryColor} 0%, ${config.style.secondaryColor} 100%); color: white; }
        .chat-bubble.bot { background: #fff; border: 1px solid rgba(133, 79, 255, 0.2); color: ${config.style.fontColor}; }
        .chat-input { display: flex; border-top: 1px solid #ddd; padding: 8px; }
        .chat-input textarea { flex: 1; border: 1px solid #ccc; border-radius: 8px; padding: 8px; font-family: inherit; font-size: 14px; resize: none; outline: none; }
        .chat-input button { background: ${config.style.primaryColor}; color: white; border: none; padding: 8px 16px; margin-left: 6px; border-radius: 8px; cursor: pointer; font-weight: bold; }
        .chat-toggle { position: fixed; width: 60px; height: 60px; border-radius: 30px; bottom: 20px; ${config.style.position}: 20px; background: ${config.style.primaryColor}; color: white; border: none; cursor: pointer; z-index: 1000; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    `;
    document.head.appendChild(style);

    // Create widget elements
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';

    const chatContainer = document.createElement('div');
    chatContainer.className = 'chat-container';

    chatContainer.innerHTML = `
        <div class="chat-interface">
            <div class="brand-header">
                <img src="${config.branding.logo}" alt="${config.branding.name}">
                <span>${config.branding.name}</span>
                <button class="close-button">×</button>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input">
                <textarea rows="1" placeholder="Type your message..."></textarea>
                <button type="submit">Send</button>
            </div>
        </div>
    `;

    const toggleButton = document.createElement('button');
    toggleButton.className = 'chat-toggle';
    toggleButton.textContent = '💬';

    widgetContainer.appendChild(chatContainer);
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);

    const messagesContainer = chatContainer.querySelector('.chat-messages');
    const textarea = chatContainer.querySelector('textarea');
    const sendButton = chatContainer.querySelector('button[type="submit"]');

    // Create message element with avatar
    function createMessageElement(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'chat-avatar';

        const img = document.createElement('img');
        if (type === 'user') {
            img.src = 'user-icon.png'; // User avatar
            img.alt = 'User';
        } else {
            img.src = config.branding.logo || '';
            img.alt = 'Agent';
        }
        img.onerror = function() {
            avatarDiv.innerHTML = `<span class="avatar-fallback">${
                type === 'user' ? 'U' : (config.branding.name ? config.branding.name[0].toUpperCase() : 'A')
            }</span>`;
        };
        avatarDiv.appendChild(img);

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = `chat-bubble ${type}`;
        bubbleDiv.textContent = text;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(bubbleDiv);
        return messageDiv;
    }

    function addMessage(type, text) {
        const el = createMessageElement(type, text);
        messagesContainer.appendChild(el);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async function sendMessage(message) {
        addMessage('user', message);

        const messageData = {
            action: 'sendMessage',
            sessionId: crypto.randomUUID(),
            route: config.webhook.route,
            chatInput: message,
            metadata: { userId: '' }
        };

        try {
            const response = await fetch(config.webhook.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData)
            });
            const data = await response.json();
            const botText = Array.isArray(data) ? data[0].output : data.output;
            addMessage('bot', botText);
        } catch (err) {
            console.error('Error sending message:', err);
            addMessage('bot', 'Sorry, something went wrong.');
        }
    }

    sendButton.addEventListener('click', () => {
        const msg = textarea.value.trim();
        if (!msg) return;
        sendMessage(msg);
        textarea.value = '';
    });

    textarea.addEventListener('keypress', e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const msg = textarea.value.trim();
            if (!msg) return;
            sendMessage(msg);
            textarea.value = '';
        }
    });

    toggleButton.addEventListener('click', () => chatContainer.classList.toggle('open'));

    const closeButtons = chatContainer.querySelectorAll('.close-button');
    closeButtons.forEach(btn => btn.addEventListener('click', () => chatContainer.classList.remove('open')));

    // Initial greeting
    addMessage('bot', config.branding.welcomeText);
})();
