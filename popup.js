document.addEventListener('DOMContentLoaded', function () {
  var copyButton = document.getElementById('copyButton');
  copyButton.addEventListener('click', function () {
    copyPageInfo();
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs[0];
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: function () {
        document.addEventListener('contextmenu', function (event) {
          chrome.runtime.sendMessage({ type: 'showContextMenu' });
        });
      }
    });
  });
});

function copyPageInfo() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var tab = tabs[0];
    var url = tab.url;
    var title = tab.title;
    var content = '[' + title + '](' + url + ')'
    copyToClipboard(content);
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
