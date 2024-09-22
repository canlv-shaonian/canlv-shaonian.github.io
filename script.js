document.addEventListener('DOMContentLoaded', function() {
    const carouselContainer = document.querySelector('.carousel-container');
    const images = carouselContainer.querySelectorAll('img');
    let currentIndex = 0;

    function showNextImage() {
        currentIndex = (currentIndex + 1) % images.length;
        carouselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    setInterval(showNextImage, 5000); // 将 2000 改为 5000，即 5 秒

    // AI聊天功能
    const chatHistory = document.getElementById('chatHistory');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessageToChat('user', message);
            callDeepSeekAPI(message);
            userInput.value = '';
        }
    }

    function addMessageToChat(role, content) {
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${role}`;
        messageElement.textContent = content;
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // 简单的加密函数
    function encrypt(text) {
        return btoa(text.split('').reverse().join(''));
    }

    // 简单的解密函数
    function decrypt(encodedText) {
        return atob(encodedText).split('').reverse().join('');
    }

    // 加密的API密钥
    const encryptedApiKey = encrypt('sk-773d4c712ad54ee2b576a5540be5dbf1');

    async function callDeepSeekAPI(message) {
        const apiKey = decrypt(encryptedApiKey); // 解密API密钥
        const apiUrl = 'https://api.deepseek.com/v1/chat/completions';

        try {
            const response = await axios.post(apiUrl, {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: message }
                ]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            const aiResponse = response.data.choices[0].message.content;
            addMessageToChat('assistant', aiResponse);
        } catch (error) {
            console.error('Error calling DeepSeek API:', error);
            addMessageToChat('assistant', '抱歉，我遇到了一个错误。请稍后再试。');
        }
    }

    // 添加花瓣效果
    const petalsContainer = document.getElementById('petals-container');
    const petalCount = 50; // 花瓣数量

    function createPetal() {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        petal.style.left = Math.random() * 100 + 'vw';
        petal.style.animationDuration = '3s'; // 固定为3秒
        petal.style.width = petal.style.height = Math.random() * 10 + 5 + 'px'; // 5-15px
        petalsContainer.appendChild(petal);

        // 动画结束后移除花瓣
        petal.addEventListener('animationend', () => {
            petal.remove();
        });
    }

    // 初始创建花瓣
    for (let i = 0; i < petalCount; i++) {
        setTimeout(createPetal, Math.random() * 3000); // 在前3秒内随机创建
    }

    // 3秒后清除所有花瓣
    setTimeout(() => {
        petalsContainer.innerHTML = '';
    }, 6000); // 6秒后清除（3秒创建 + 3秒动画）

    // 添加糖果特效
    const candyContainer = document.getElementById('candy-container');
    const candyColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

    document.addEventListener('click', function(event) {
        createCandyEffect(event.clientX, event.clientY);
    });

    function createCandyEffect(x, y) {
        for (let i = 0; i < 20; i++) {
            const candy = document.createElement('div');
            candy.className = 'candy';
            candy.style.left = x + 'px';
            candy.style.top = y + 'px';
            candy.style.backgroundColor = candyColors[Math.floor(Math.random() * candyColors.length)];
            
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 100 + 50;
            candy.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            candy.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            
            candyContainer.appendChild(candy);

            setTimeout(() => {
                candy.remove();
            }, 1000);
        }
    }
});