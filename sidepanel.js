document.addEventListener('DOMContentLoaded', function() {
  const container = document.getElementById('custom-text-container');

  // 接收来自背景脚本的消息
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateTexts') {

      // 动态创建并插入自定义文本段
      appendCustomText(container, request.text);
      sendResponse({ status: 'success' }); // 返回响应
      return true; // 以确保异步 sendResponse 可以工作
    }

    if (request.action === 'updateTitle') {
      console.log('收到浏览器地址栏右侧 icon 点击事件')
      document.title = request.text;
      sendResponse({ status: 'Title updated' });
      return true;
    }
  });
});

function appendCustomText(container, text) {
  const textElement = document.createElement('p');
  textElement.className = 'custom-text';
  textElement.textContent = text;
  container.appendChild(textElement);
}
