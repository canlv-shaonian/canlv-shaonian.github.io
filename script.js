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

    let isAiResponding = false; // 跟踪AI是否正在响应

    sendButton.addEventListener('click', () => {
        if (!isAiResponding) {
            sendMessage();
        }
    });

    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !isAiResponding) {
            sendMessage();
        }
    });

    async function sendMessage() {
        if (isAiResponding) return; // 如果AI正在响应，直接返回

        const message = userInput.value.trim();
        if (message === '') return;

        // 禁用输入框和发送按钮
        userInput.disabled = true;
        sendButton.disabled = true;
        isAiResponding = true;

        // 显示用户消息
        appendMessage('user', message);
        userInput.value = '';

        // 创建AI回复的占位符
        const aiMessageContentElement = appendMessage('ai', '');

        try {
            const apiKey = decrypt(encryptedApiKey); // 解密API密钥
            const apiUrl = 'https://api.deepseek.com/v1/chat/completions';

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { role: "system", content: "You are a helpful assistant. Please answer in JSON format with 'question' and 'answer' fields." },
                        { role: "user", content: message }
                    ],
                    response_format: { type: 'json_object' },
                    stream: true // 启用流式输出
                })
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;
                        
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices[0].delta.content;
                            if (content) {
                                aiResponse += content;
                                aiMessageContentElement.textContent = aiResponse;
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }
                }
            }

            // 解析JSON响应并格式化显示
            try {
                const jsonResponse = JSON.parse(aiResponse);
                let formattedAnswer = jsonResponse.answer;

                // 处理代码块
                formattedAnswer = formattedAnswer.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
                    return `<pre><code class="language-${lang || 'plaintext'}">${escapeHtml(code.trim())}</code></pre>`;
                });

                // 处理行内代码
                formattedAnswer = formattedAnswer.replace(/`([^`]+)`/g, '<code>$1</code>');

                // 渲染LaTeX
                formattedAnswer = formattedAnswer.replace(/\$\$([\s\S]*?)\$\$/g, function(match, formula) {
                    return katex.renderToString(formula, {displayMode: true, throwOnError: false});
                });
                formattedAnswer = formattedAnswer.replace(/\$((?:[^$]|\\\$)+)\$/g, function(match, formula) {
                    return katex.renderToString(formula, {displayMode: false, throwOnError: false});
                });

                aiMessageContentElement.innerHTML = `<strong>问题：</strong>${escapeHtml(jsonResponse.question)}<br><strong>回答：</strong>${formattedAnswer}`;

                // 应用代码高亮
                Prism.highlightAllUnder(aiMessageContentElement);

            } catch (error) {
                console.error('Error parsing AI response as JSON:', error);
                aiMessageContentElement.textContent = aiResponse;
            }

        } catch (error) {
            console.error('Error:', error);
            aiMessageContentElement.textContent = '抱歉，发生了错误。请稍后再试。';
        } finally {
            // 重新启用输入框和发送按钮
            userInput.disabled = false;
            sendButton.disabled = false;
            isAiResponding = false;
            userInput.focus(); // 将焦点重新放在输入框上
        }
    }

    function appendMessage(sender, message) {
        const chatHistory = document.getElementById('chatHistory');
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        
        if (sender === 'user') {
            messageElement.classList.add('user-message');
            messageElement.innerHTML = `<div class="message-content">${message}</div>`;
        } else {
            messageElement.classList.add('ai-message');
            messageElement.innerHTML = `<div class="message-content">${message}</div>`;
        }
        
        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return messageElement.querySelector('.message-content');
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

    function renderLatex(element) {
        renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ],
            throwOnError : false
        });
    }

    // 辅助函数：转义HTML特殊字符
    function escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
});