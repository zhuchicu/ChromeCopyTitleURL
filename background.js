chrome.runtime.onInstalled.addListener(function () {
  // Page actions are disabled by default and enabled on select tabs
  // chrome.action.disable();

  // console.log('注册右键菜单事件监听')
  // 注册右键菜单事件监听
  chrome.contextMenus.create({
    id: 'copyPageURLTitle',
    title: '复制 Markdown 格式的链接引用 (Ctrl+Shift+Y)',
    contexts: ['page']
  });

  // 打开侧栏
  // chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  // 注册右键菜单事件监听
  chrome.contextMenus.create({
    id: 'sendToSidePanel',
    title: '发送 SidePanel',
    contexts: ['selection', 'link', 'image']
  });
});


// 添加右键菜单的事件监听
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'copyPageURLTitle') {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: copyPageInfoToClipboard
    });
  }

  if (info.menuItemId === "sendToSidePanel") {
    (async () => {
      try {
        var text;
        // 选中文本
        if (info.selectionText) {
          text = await sendMsgToContent('formattedText', info.selectionText);
        } else if (info.linkUrl) { // 选中 URL 链接
          text = info.linkUrl;
        } else if (info.srcUrl && (info.mediaType === 'image')) {
          text = info.srcUrl;
        }
        appendTextToSidePanel(text);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    })();
  }

});


// 监听的快捷键命令，定义在 manifest 的 commands 字段中的 Id
chrome.commands.onCommand.addListener((command) => {
  if (command === 'copy-title-url') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: copyPageInfoToClipboard
      });
  });
  }
});


// 接收来自 content 脚本的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(`background 收到消息：${request.action}`)

  if (request.action === 'appendTextToSidePanel') {
    appendTextToSidePanel(text);
    return true;  // 或 sendResponse(true); 都可以
  }

  if (request.action === 'openSidePanel') {
    chrome.windows.getLastFocused({ populate: true }, function(window) {
      chrome.sidePanel.open({ windowId: window.id }, function() {
        if (chrome.runtime.lastError) {
          console.error('Error opening side panel:', chrome.runtime.lastError.message);
        } else {
          console.log('Side panel opened successfully');
        }
      });
    });
  }
});


// TODO 未启用，待进一步重构优化
function sendMsgToSidePanel(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ target: "sidepanel", content: message }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}


// const response = await sendMsgToContent('hhh', 'background sendMsg');
function sendMsgToContent(action, text) {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: action, text: text }, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response.text);
          }
        });
      }
    });
  });
}


function copyPageInfoToClipboard() {
  var url = window.location.href;
  var title = document.title;
  var text = '来源：[' + title + '](' + url + ')';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    console.log('Clipboard API 只能在 HTTPS 或 localhost 环境下使用');
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}


function appendTextToSidePanel(text) {
  chrome.sidePanel.setOptions({
    path: "sidepanel.html"
  }, () => {
    chrome.runtime.sendMessage({ action: 'updateTexts', text: text });
  });
}
