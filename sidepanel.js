document.addEventListener('DOMContentLoaded', function() {
  console.log('sidepanel.js 的监听页面加载完成事件');
  const content = document.getElementById('sidepanelContent');

  // 接收来自背景脚本的消息
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('sidepanel.js 收到消息')

    if (request.action === 'updateTexts') {

      // 动态创建并插入自定义文本段
      appendCustomText(content, request.text);
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


function appendCustomText(ctx, text) {
  const div = document.createElement('div');
  div.className = 'text-block';

  const p = document.createElement('p');
  p.textContent = text;
  div.appendChild(p);

  const copyBtn = document.createElement('button');
  // copyBtn.textContent = 'Copy';
  copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
  copyBtn.className = 'copy-button';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(text);
    copyBtn.classList.add('active');
    setTimeout(() => {
      copyBtn.classList.remove('active');
    }, 200); // 200ms 按下效果持续时间
  });
  div.appendChild(copyBtn);

  // 创建删除按钮 (使用 Font Awesome 图标)
  const delBtn = document.createElement('button');
  // delBtn.textContent = 'Delete';
  delBtn.className = 'delete-button';
  delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
  delBtn.addEventListener('click', () => {
    div.remove();
  });
  div.appendChild(delBtn);

  ctx.appendChild(div);
}

