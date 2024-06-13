chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: 'copyPageInfo',
    title: 'Copy Title URL (Ctrl+Shift+Y)',
    contexts: ['page', 'selection']
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'copyPageInfo') {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: copyPageInfo
    });
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'copy-title-url') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: copyPageInfo
    });
  });
  }
});

function copyPageInfo() {
  var url = window.location.href;
  var title = document.title;
  navigator.clipboard.writeText('[' + title + '](' + url + ')');
}