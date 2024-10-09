document.addEventListener('DOMContentLoaded', function() {
    const chatHistory2 = document.getElementById('chatHistory2');
    const userInput2 = document.getElementById('userInput2');
    const sendButton2 = document.getElementById('sendButton2');

    // 添加支持的语言信息
    const supportedLanguages = document.createElement('div');
    supportedLanguages.classList.add('supported-languages');
    supportedLanguages.innerHTML = '为获得更好的效果，建议使用英语进行图像生成。';
    chatHistory2.parentNode.insertBefore(supportedLanguages, chatHistory2);

    let isGenerating = false;

    // 使用您的实际API密钥

    sendButton2.addEventListener('click', () => {
        if (!isGenerating) {
            generateImage();
        }
    });

    userInput2.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !isGenerating) {
            generateImage();
        }
    });

    async function generateImage() {
        const prompt = userInput2.value.trim();
        if (prompt === '') return;

        userInput2.disabled = true;
        sendButton2.disabled = true;
        isGenerating = true;

        appendMessage2('user', prompt);
        userInput2.value = '';

        const aiMessageContentElement = appendMessage2('ai', '正在生成图像...');

        try {
            const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${HF}`, // 使用环境变量
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            
            aiMessageContentElement.innerHTML = `
                <p>根据以下提示生成的图像："${prompt}"</p>
                <img src="${imageUrl}" alt="生成的图像" style="max-width: 100%;">
            `;
        } catch (error) {
            console.error('Error:', error);
            aiMessageContentElement.innerHTML = `抱歉，生成图像时发生错误。请稍后再试。<br>错误详情：${error.message}`;
        } finally {
            userInput2.disabled = false;
            sendButton2.disabled = false;
            isGenerating = false;
            userInput2.focus();
        }
    }

    function appendMessage2(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender);
        
        if (sender === 'user') {
            messageElement.classList.add('user-message');
            messageElement.innerHTML = `<div class="message-content">${message}</div>`;
        } else {
            messageElement.classList.add('ai-message');
            messageElement.innerHTML = `<div class="message-content">${message}</div>`;
        }
        
        chatHistory2.appendChild(messageElement);
        chatHistory2.scrollTop = chatHistory2.scrollHeight;
        return messageElement.querySelector('.message-content');
    }
});
