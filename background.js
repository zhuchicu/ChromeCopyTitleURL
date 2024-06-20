chrome.runtime.onInstalled.addListener(function () {
  console.log('注册右键菜单事件监听')
  // 注册右键菜单事件监听
  chrome.contextMenus.create({
    id: 'copyPageURLTitle',
    title: 'Copy Title URL (Ctrl+Shift+Y)',
    contexts: ['page', 'selection']
  });

  // 打开侧栏
  // chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  chrome.contextMenus.create({
    id: 'mysidePanel',
    title: 'Define mysidePanel',
    contexts: ['page', 'selection']
  });
});

function getMarkdownTitle(tab) {
  const title = tab.title;
  const url = tab.url;
  const markdownTitle = `[${title}](${url})`;
  return markdownTitle;
}

function sendTitleToSidePanel(tab, title) {
  console.log('点击浏览器地址栏右侧 icon');
  console.log(`markdownTitle: ${title}`);
  console.log(`Current Window ID: ${tab.windowId}`);
  
  chrome.sidePanel.open({ tabId: tab.id });
  // chrome.sidePanel.open({tabId: tab.id}, () => {
  //   chrome.runtime.sendMessage({ action: "updateTitle", title: title });
  // });
}

// 注册浏览器地址栏右侧 icon 的点击事件
chrome.action.onClicked.addListener((tab) => {
  const markdownTitle = getMarkdownTitle(tab);

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: sendTitleToSidePanel,
    args: [tab, markdownTitle]
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

  if (info.menuItemId === 'mysidePanel') {
    // chrome.sidePanel.open({ tabId: tab.id });
    chrome.sidePanel.open({ windowId: tab.windowId });
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
  navigator.clipboard.writeText('[' + title + '](' + url + ')');
}




