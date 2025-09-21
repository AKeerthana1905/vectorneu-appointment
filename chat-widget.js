(function() {
    const config = {
        webhook: { url: '', route: '' },
        branding: { 
            logo: 'vectorneu.png',  // <-- put your company logo path here
            name: 'Vectorneu', 
            welcomeText: 'Hi 👋, how can we help?' 
        },
        style: { primaryColor:'#54dde4', secondaryColor:'#172565', position:'right' }
    };

    // Create container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'n8n-chat-widget';
    widgetContainer.style.position = 'fixed';
    widgetContainer.style.bottom = '20px';
    widgetContainer.style[config.style.position] = '20px';
    widgetContainer.style.width = '360px';
    widgetContainer.style.height = '500px';
    widgetContainer.style.border = '1px solid #ccc';
    widgetContainer.style.borderRadius = '12px';
    widgetContainer.style.background = '#fff';
    widgetContainer.style.display = 'flex';
    widgetContainer.style.flexDirection = 'column';
    widgetContainer.style.overflow = 'hidden';
    widgetContainer.style.fontFamily = 'Arial,sans-serif';
    widgetContainer.style.zIndex = 999;

    // Chat messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'chat-messages';
    messagesContainer.style.flex = '1';
    messagesContainer.style.overflowY = 'auto';
    messagesContainer.style.padding = '12px';
    messagesContainer.style.display = 'flex';
    messagesContainer.style.flexDirection = 'column';
    messagesContainer.style.gap = '10px';

    // Input area
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.borderTop = '1px solid #ddd';
    inputContainer.style.padding = '8px';

    const textarea = document.createElement('textarea');
    textarea.rows = 1;
    textarea.placeholder = 'Type your message...';
    textarea.style.flex = '1';
    textarea.style.padding = '8px';
    textarea.style.fontFamily = 'inherit';
    textarea.style.fontSize = '14px';
    textarea.style.border = '1px solid #ccc';
    textarea.style.borderRadius = '8px';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';

    const sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send';
    sendBtn.style.marginLeft = '6px';
    sendBtn.style.padding = '8px 16px';
    sendBtn.style.background = config.style.primaryColor;
    sendBtn.style.color = 'white';
    sendBtn.style.border = 'none';
    sendBtn.style.borderRadius = '8px';
    sendBtn.style.cursor = 'pointer';
    sendBtn.style.fontWeight = 'bold';

    inputContainer.appendChild(textarea);
    inputContainer.appendChild(sendBtn);

    widgetContainer.appendChild(messagesContainer);
    widgetContainer.appendChild(inputContainer);
    document.body.appendChild(widgetContainer);

    // Create message with avatar
    function createMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.style.display = 'flex';
        messageDiv.style.alignItems = 'flex-end';
        messageDiv.style.gap = '8px';
        if(type==='user') { messageDiv.style.flexDirection='row-reverse'; }

        // Avatar
        const avatarDiv = document.createElement('div');
        avatarDiv.style.width = '32px';
        avatarDiv.style.height = '32px';
        avatarDiv.style.borderRadius = '50%';
        avatarDiv.style.flexShrink = '0';
        avatarDiv.style.display = 'flex';
        avatarDiv.style.alignItems = 'center';
        avatarDiv.style.justifyContent = 'center';
        avatarDiv.style.background = '#ddd';
        avatarDiv.style.fontWeight = 'bold';
        avatarDiv.style.fontSize = '14px';
        avatarDiv.style.color = '#555';

        const img = document.createElement('img');
        img.style.width='100%';
        img.style.height='100%';
        img.style.objectFit='cover';

        if(type==='user') { img.src='user-icon.png'; img.alt='User'; }
        else { img.src=config.branding.logo || ''; img.alt='Agent'; }

        img.onload = () => avatarDiv.appendChild(img);
        img.onerror = () => {
            avatarDiv.innerHTML = `<span>${type==='user'?'U':config.branding.name[0].toUpperCase()}</span>`;
        };

        // Bubble
        const bubble = document.createElement('div');
        bubble.textContent = text;
        bubble.style.padding='10px 14px';
        bubble.style.borderRadius='12px';
        bubble.style.maxWidth='70%';
        bubble.style.wordWrap='break-word';
        bubble.style.fontSize='14px';
        bubble.style.lineHeight='1.4';
        if(type==='user'){
            bubble.style.background=`linear-gradient(135deg, ${config.style.primaryColor} 0%, ${config.style.secondaryColor} 100%)`;
            bubble.style.color='white';
        } else {
            bubble.style.background='#fff';
            bubble.style.border='1px solid rgba(133,79,255,0.2)';
            bubble.style.color='#333';
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(bubble);
        return messageDiv;
    }

    function addMessage(type, text){
        const msg = createMessage(type,text);
        messagesContainer.appendChild(msg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function sendMessage(message){
        addMessage('user', message);
        // Simulate bot reply (replace with fetch to webhook)
        setTimeout(()=>addMessage('bot', `You said: "${message}"`), 600);
    }

    sendBtn.addEventListener('click', ()=>{
        const msg = textarea.value.trim();
        if(!msg) return;
        sendMessage(msg);
        textarea.value='';
    });

    textarea.addEventListener('keypress', e=>{
        if(e.key==='Enter' && !e.shiftKey){
            e.preventDefault();
            const msg = textarea.value.trim();
            if(!msg) return;
            sendMessage(msg);
            textarea.value='';
        }
    });

    // Initial greeting
    addMessage('bot', config.branding.welcomeText);
})();
