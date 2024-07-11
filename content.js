const icon = document.createElement('img');
icon.src = chrome.runtime.getURL('images/logo.jpg');
icon.id = 'selection-icon'
icon.alt = 'Copy to clipboard';
icon.style.display = 'none';
document.body.appendChild(icon);
// console.log(`icon.src=${icon.src}`);


// 创建一个浮动按钮
function createFloatingButton(selectedText) {
  icon.src = chrome.runtime.getURL('images/logo.jpg');
  icon.id = 'selection-icon'
  icon.alt = 'Copy to clipboard';
  icon.style.display = 'none';
  document.body.appendChild(icon);
  // console.log(`icon.src=${icon.src}`);
}

// 监听鼠标释放事件
document.addEventListener('mouseup', function(event) {
  console.log(`监听鼠标释放事件`)
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    const x = event.pageX + 10;
    const y = event.pageY + 10;
    icon.style.left = `${x}px`;
    icon.style.top = `${y}px`;
    icon.style.display = 'block';
    setTimeout(function() {
      icon.style.display = 'none';
    }, 4000);
  } else {
    icon.style.display = 'none';
  }
});


// 点击 logoIcon 时将文本发送至 SidePanel
icon.addEventListener('click', function() {
  // console.log('点击 logoIcon 时将文本发送至 SidePanel')
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    const text = formattedText(selectedText);
    // 更新 sidepanel 的段落文本内容
    sendMsgPromise('updateTexts', text).then(() => {
      icon.style.display = 'none';
    });
    copyToClipboard(text);
  }
});


// 设置消息监听器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`content 收到消息：${request.action}`)
  // 格式化文本内容
  if (request.action === 'formattedText') {
    const responseText = formattedText(request.text);
    sendResponse({ text: responseText });
  }
});


function formattedText(selectedText) {
  const text = pangu.spacing(selectedText);
  const newText = text.replace(/(\r\n|\n|\r)/gm, " ")        // 替换换行符为空格
                      .replace(/^\s*$(?:\r\n|\r|\n)/gm, ""); // 删除空白行
  return newText
}

function sendMsgPromise(action, text) {
  return new Promise((resolve, reject) => {
    const message = {
      action: action,
      text: text
    };
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(() => {
      // alert('Text copied to clipboard!');
      icon.style.display = 'none';
    });
}