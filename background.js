chrome.runtime.onInstalled.addListener(function () {
  // console.log('注册右键菜单事件监听')
  // 注册右键菜单事件监听
  chrome.contextMenus.create({
    id: 'copyPageURLTitle',
    title: '复制 Markdown 格式的链接引用 (Ctrl+Shift+Y)',
    contexts: ['page']
  });

  // 打开侧栏
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

  // 注册右键菜单事件监听
  chrome.contextMenus.create({
    id: 'sendToSidePanel',
    title: '发送 SidePanel',
    contexts: ['selection']
  });
});


// function getMarkdownTitle(tab) {
//   const title = tab.title;
//   const url = tab.url;
//   const markdownTitle = `[${title}](${url})`;
//   return markdownTitle;
// }


// function sendTitleToSidePanel(tab, title) {
//   console.log('点击浏览器地址栏右侧 icon');
//   console.log(`markdownTitle: ${title}`);
//   console.log(`Current Window ID: ${tab.windowId}`);
// }


// 添加右键菜单的事件监听
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'copyPageURLTitle') {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: copyPageInfoToClipboard
    });
  }

  if (info.menuItemId === "sendToSidePanel" && info.selectionText) {
    chrome.sidePanel.setOptions({
      path: "sidepanel.html"
    }, () => {
      chrome.runtime.sendMessage({ text: info.selectionText });
    });
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
