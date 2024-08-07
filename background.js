let sidePanelPort;

chrome.runtime.onInstalled.addListener(function () {
  // console.log('注册右键菜单事件监听')
  // 注册右键菜单事件监听
  chrome.contextMenus.create({
    id: 'copyPageURLTitle',
    title: '复制 Markdown 格式的链接引用 (Ctrl+Shift+Y)',
    contexts: ['page']
  });

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
    const send = () => {
      // 选中文本
      if (info.selectionText) {
        getSelectionText();
      } else {
        let fragments = [];
        if (info.linkUrl) { // 选中 URL 链接
          const t = `<${info.linkUrl}>`;
          fragments.push(t);
        } else if (info.srcUrl && (info.mediaType === 'image')) {
          const t = `![](${info.srcUrl})`;
          fragments.push(t);
        }
        sendMsgToSidePanel({action: 'paragraphs', fragments: fragments});
      }

    };
    if (sidePanelPort) {
      send();
    } else {
      openSidePanel(send);
    }
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
  // console.log(`background 收到消息：${request.action}`)

  if (request.action === 'appendTextToSidePanel') {
    sendMsgToSidePanel({action: 'updateTexts', text: text});
  }

  if (request.action === 'openSidePanel') {
    openSidePanel();
  }
});


function openSidePanel(callback=null) {
  chrome.windows.getLastFocused({ populate: true }, function(window) {
    chrome.sidePanel.open({ windowId: window.id }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error opening side panel:', chrome.runtime.lastError.message);
      } else {
        // console.log('Side panel opened successfully');
        connSidePanel(callback);
      }
    });
  });
}


function connSidePanel(callback=null) {
  chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === "sidepanel-connection") {
      // console.log("Side panel connected");
      sidePanelPort = port;
      if (callback) {
        callback();
      }

      sidePanelPort.onMessage.addListener(function(msg) {
        console.log("Received message from side panel:", msg);
        // 处理来自侧边栏的消息
        // if (msg.action === "getData") {
        //   sidePanelPort.postMessage({data: "Here's some data from background"});
        // }
      });

      sidePanelPort.onDisconnect.addListener(function() {
        // console.log("Side panel disconnected");
        sidePanelPort = null;
      });
    }
  });
}

// 向侧边栏发送消息的函数
function sendMsgToSidePanel(msg) {
  if (sidePanelPort) {
    sidePanelPort.postMessage(msg);
  } else {
    console.error("Side panel is not connected");
  }
}


// function sendMsgToContent(action, text) {
//   return new Promise((resolve, reject) => {
//     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//       if (tabs[0]) {
//         chrome.tabs.sendMessage(tabs[0].id, { action: action, text: text }, (response) => {
//           if (chrome.runtime.lastError) {
//             reject(chrome.runtime.lastError);
//           } else {
//             resolve(response.text);
//           }
//         });
//       }
//     });
//   });
// }

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

function getSelectionText() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let tabId = tabs[0].id;
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: splitSelectionByParagraphs
    }).then(response => {
      let fragments = response[0].result.fragments;
      sendMsgToSidePanel({action: 'paragraphs', fragments: fragments});
    });
  });
}

function splitSelectionByParagraphs() {
  let selection = window.getSelection();
  if (selection.rangeCount === 0) {
    return { fragments: [] };
  }

  let range = selection.getRangeAt(0);
  let fragments = [];
  let fragmentParent = range.cloneContents();
  fragmentParent.childNodes.forEach(function(item) {
    let text = item.textContent;
    fragments.push(text);
  });

  return { fragments: fragments };
}