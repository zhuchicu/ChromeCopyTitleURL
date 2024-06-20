// 创建一个浮动按钮
const icon = document.createElement('img');
icon.src = chrome.runtime.getURL('images/logo.jpg');
icon.id = 'selection-icon'
icon.alt = 'Copy to clipboard';
icon.style.display = 'none';
document.body.appendChild(icon);



// 监听鼠标释放事件
document.addEventListener('mouseup', function(event) {
  console.log('监听鼠标释放事件')
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    const x = event.pageX;
    const y = event.pageY;
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

// 点击按钮时复制文本
icon.addEventListener('click', function() {
  console.log('点击按钮时复制文本')
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    const text = pangu.spacing(selectedText)
    navigator.clipboard.writeText(text).then(() => {
      // alert('Text copied to clipboard!');
      icon.style.display = 'none';
    });
  }
});