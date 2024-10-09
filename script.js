// 导入 InferenceClient
// import { InferenceClient } from 'https://cdn.jsdelivr.net/npm/@huggingface/inference@2.6.1/+esm';

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

    // 添加支持的语言信息
    const supportedLanguages = document.createElement('div');
    supportedLanguages.classList.add('supported-languages');
    supportedLanguages.innerHTML = '支持的语言：英语、德语、法语、意大利语、葡萄牙语、印地语、西班牙语和泰语';
    chatHistory.parentNode.insertBefore(supportedLanguages, chatHistory);

    let isAiResponding = false;
    let conversationHistory = [
        { role: "system", content: "You are a helpful assistant. Please provide your answers in a clear and concise manner. If asked about truth tables or code, include them in your response. Do not use separate 'question' and 'answer' fields in your response. You can communicate in English, German, French, Italian, Portuguese, Hindi, Spanish, and Thai." }
    ];

    // 使用您的实际API密钥
    const API_KEY = 'API'; // 请替换为您的实际API密钥

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !isAiResponding) {
            sendMessage();
        }
    });

    async function sendMessage() {
        if (isAiResponding) return;

        const message = userInput.value.trim();
        if (message === '') return;

        userInput.disabled = true;
        sendButton.disabled = true;
        isAiResponding = true;

        appendMessage('user', message);
        userInput.value = '';

        const aiMessageContentElement = appendMessage('ai', '正在思考...');

        try {
            conversationHistory.push({ role: "user", content: message });
            
            const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-1B-Instruct/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "meta-llama/Llama-3.2-1B-Instruct",
                    messages: conversationHistory,
                    max_tokens: 500,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;
            
            aiMessageContentElement.innerHTML = formatResponse(aiResponse);
            conversationHistory.push({ role: "assistant", content: aiResponse });
        } catch (error) {
            console.error('Error:', error);
            aiMessageContentElement.innerHTML = `抱歉，发生了错误。请稍后再试。<br>错误详情：${error.message}`;
        } finally {
            userInput.disabled = false;
            sendButton.disabled = false;
            isAiResponding = false;
            userInput.focus();
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

    // 修改格式化真值表函数
    function formatTruthTable(tableString) {
        if (typeof tableString !== 'string' || !tableString.trim()) {
            console.error('Invalid tableString:', tableString);
            return '无法格式化真值表';
        }

        // 移除所有 "真值表格式不正确" 的文本
        tableString = tableString.replace(/真值表格式不正确/g, '');

        const lines = tableString.trim().split('\n');
        if (lines.length < 3) {
            console.error('Not enough lines in tableString:', tableString);
            return '真值表格式不正确';
        }

        let tableHtml = '<table class="truth-table"><thead><tr>';
        
        // 添加表头
        const headers = lines[0].split(/\s+/).filter(h => h.trim());
        headers.forEach(header => {
            tableHtml += `<th>${escapeHtml(header)}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';

        // 添加表格内容
        for (let i = 2; i < lines.length; i++) {
            const cells = lines[i].split(/\s+/).filter(c => c.trim());
            if (cells.length > 0) {
                tableHtml += '<tr>';
                cells.forEach(cell => {
                    tableHtml += `<td>${cell}</td>`;
                });
                tableHtml += '</tr>';
            }
        }

        tableHtml += '</tbody></table>';
        return tableHtml;
    }

    function formatResponse(response) {
        if (response == null) {
            console.error('Response is null or undefined');
            return '抱歉，收到了空的响应。请稍后再试。';
        }

        console.log('Formatting response:', response);

        let formattedResponse = String(response); // 确保 response 是字符串

        // 处理真值表
        formattedResponse = formattedResponse.replace(/真值表[\s\S]*?(?=\n\n|\Z)/g, function(match) {
            return formatTruthTable(match);
        });

        // 处理代码块
        formattedResponse = formattedResponse.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
            return `<pre><code class="language-${lang || 'plaintext'}">${escapeHtml(code.trim())}</code></pre>`;
        });

        // 处理行内代码
        formattedResponse = formattedResponse.replace(/`([^`]+)`/g, '<code>$1</code>');

        // 渲染LaTeX
        formattedResponse = formattedResponse.replace(/\$\$([\s\S]*?)\$\$/g, function(match, formula) {
            return katex.renderToString(formula, {displayMode: true, throwOnError: false});
        });
        formattedResponse = formattedResponse.replace(/\$((?:[^$]|\\\$)+)\$/g, function(match, formula) {
            return katex.renderToString(formula, {displayMode: false, throwOnError: false});
        });

        // 处理数学公式
        formattedResponse = formattedResponse.replace(/\\\[([\s\S]*?)\\\]/g, function(match, formula) {
            return `<div class="math-block">${katex.renderToString(formula, {displayMode: true, throwOnError: false})}</div>`;
        });

        // 处理行内数学公式
        formattedResponse = formattedResponse.replace(/\\\(([\s\S]*?)\\\)/g, function(match, formula) {
            return katex.renderToString(formula, {displayMode: false, throwOnError: false});
        });

        // 处理标题
        formattedResponse = formattedResponse.replace(/###\s+(.*)/g, '<h3>$1</h3>');

        // 处理列表
        formattedResponse = formattedResponse.replace(/^\d+\.\s+(.*)/gm, '<li>$1</li>');
        formattedResponse = formattedResponse.replace(/^-\s+(.*)/gm, '<li>$1</li>');
        formattedResponse = formattedResponse.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // 处理粗体
        formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        // 处理斜体
        formattedResponse = formattedResponse.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // 处理可能的多行回答
        formattedResponse = formattedResponse.split('\n').join('<br>');

        return formattedResponse;
    }
});