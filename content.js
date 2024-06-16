// 创建一个浮动按钮
const button = document.createElement('button');
button.innerText = 'Copy';
button.style.position = 'absolute';
button.style.display = 'none';
button.style.zIndex = 1000;
button.style.padding = '5px 10px';
button.style.border = '1px solid #ccc';
button.style.backgroundColor = '#fff';
button.style.cursor = 'pointer';
document.body.appendChild(button);

// 监听鼠标释放事件
document.addEventListener('mouseup', function(event) {
  console.log('监听鼠标释放事件')
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
    button.style.top = `${rect.top + window.scrollY + rect.height}px`;
    button.style.left = `${rect.left + window.scrollX}px`;
    button.style.display = 'block';
  } else {
    button.style.display = 'none';
  }
});

// 点击按钮时复制文本
button.addEventListener('click', function() {
  console.log('点击按钮时复制文本')
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    navigator.clipboard.writeText(selectedText).then(() => {
      // alert('Text copied to clipboard!');
      button.style.display = 'none';
    });
  }
});
