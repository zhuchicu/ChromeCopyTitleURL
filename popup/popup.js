// 这个脚本是插入到 popup.html 中，与页面中的自定义 Button 绑定的

// 获得 popup.html 中的元素 Id=sidepanelBtn
document.addEventListener('DOMContentLoaded', function () {
  // console.log('popup DOMContentLoaded');

  var sidepanelBtn = document.getElementById('openSidePanel');
  sidepanelBtn.addEventListener('click', function () {
    chrome.runtime.sendMessage({ action: 'openSidePanel' });
  });

  var optionBtn = document.getElementById('openOptions');
  optionBtn.addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
  });

  // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  //   var tab = tabs[0];
  //   chrome.scripting.executeScript({
  //     target: { tabId: tab.id },
  //     function: function () {
  //       document.addEventListener('contextmenu', function (event) {
  //         chrome.runtime.sendMessage({ type: 'showContextMenu' });
  //       });
  //     }
  //   });
  // });
});

function copyPageInfo(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs[0];
    var url = tab.url;
    var title = tab.title;
    var content = '[' + title + '](' + url + ')'
    callback(content);
  });
}

function copyToClipboard(text) {
  var input = document.createElement('textarea');
  input.value = text;
  document.body.appendChild(input);
  input.select();
  document.execCommand('copy');
  document.body.removeChild(input);
}
