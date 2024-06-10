chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: 'copyPageInfo',
    title: 'Copy Page URL and Title',
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

function copyPageInfo() {
  var url = window.location.href;
  var title = document.title;
  navigator.clipboard.writeText('[' + title + '](' + url + ')');
}