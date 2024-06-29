// 监听页面加载完成事件
// document.addEventListener('DOMContentLoaded', function () {
//   console.log('content.js 的监听页面加载完成事件');
//   let sidePanelOpen = false;

//   // 检查是否存在 sidepanel 的元素
//   function isSidePanelOpen() {
//     return !document.getElementById('sidepanelContent'); // 假设 sidepanel 的 ID 为 sidepanel
//   }

//   // 监听页面选中文本事件
//   document.addEventListener('selectionchange', function () {
//     const selectedText = window.getSelection().toString().trim();
//     console.log(`选中文本：${selectedText}`)
//     if (selectedText && isSidePanelOpen()) {
//       const text = pangu.spacing(selectedText);
//       const cleanText = text.replace(/(\r\n|\n|\r)/gm, " ")        // 替换换行符为空格
//                             .replace(/^\s*$(?:\r\n|\r|\n)/gm, ""); // 删除空白行
//       createFloatingButton(cleanText);
//     } else {
//       removeFloatingButton();
//     }
//   });

//   // 创建浮动按钮
//   function createFloatingButton(selectedText) {
//     removeFloatingButton(); // 先移除已有的按钮

//     const floatingIcon = document.createElement('img');
//     floatingIcon.src = chrome.runtime.getURL('images/logo.jpg');
//     floatingIcon.id = 'floatingIcon'
//     floatingIcon.class = 'selection-icon'
//     floatingIcon.alt = 'Copy to SidePanel';
    
//     // 获取鼠标最后的位置
//     const mouseX = event.clientX;
//     const mouseY = event.clientY;
  
//     // 设置按钮位置
//     floatingButton.style.left = `${mouseX + 10}px`;
//     floatingButton.style.top = `${mouseY + 10}px`;

//     floatingIcon.style.display = 'block';
//     document.body.appendChild(floatingIcon);
//     setTimeout(function() {
//       removeFloatingButton();
//     }, 4000);
//     floatingIcon.addEventListener('click', function() {
//       // console.log('点击 logoIcon 时将文本发送至 SidePanel')
//       sendToSidePanelPromise('updateTexts', cleanText).then(() => {
//         removeFloatingButton();
//       });
//     });
//   }

//   // 移除浮动按钮
//   function removeFloatingButton() {
//     const existingIcon = document.getElementById('floatingIcon');
//     if (existingIcon) {
//       existingIcon.remove();
//     }
//   }
// });

// // 创建一个浮动按钮
// const icon = document.createElement('img');
// icon.src = chrome.runtime.getURL('images/logo.jpg');
// icon.id = 'selection-icon'
// icon.alt = 'Copy to clipboard';
// icon.style.display = 'none';
// document.body.appendChild(icon);
// // console.log(`icon.src=${icon.src}`);



const icon = document.createElement('img');
icon.src = chrome.runtime.getURL('images/logo.jpg');
icon.id = 'selection-icon'
icon.alt = 'Copy to clipboard';
icon.style.display = 'none';
document.body.appendChild(icon);
// console.log(`icon.src=${icon.src}`);


function isSidePanelOpen() {
  return !!document.getElementById('sidepanelContent'); // 假设 sidepanel 的 ID 为 sidepanel
}

// 创建一个浮动按钮
function createFloatingButton(selectedText) {
  icon.src = chrome.runtime.getURL('images/logo.jpg');
  icon.id = 'selection-icon'
  icon.alt = 'Copy to clipboard';
  icon.style.display = 'none';
  document.body.appendChild(icon);
  // console.log(`icon.src=${icon.src}`);
}

// 监听鼠标释放事件
document.addEventListener('mouseup', function(event) {
  console.log(`监听鼠标释放事件：${isSidePanelOpen()}`)
  const selectedText = window.getSelection().toString().trim();
  if (selectedText.length > 0) {
    const x = event.pageX + 10;
    const y = event.pageY + 10;
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


// 点击 logoIcon 时将文本发送至 SidePanel
icon.addEventListener('click', function() {
  console.log('点击 logoIcon 时将文本发送至 SidePanel')
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    const text = pangu.spacing(selectedText);
    const cleanText = text.replace(/(\r\n|\n|\r)/gm, " ")        // 替换换行符为空格
                          .replace(/^\s*$(?:\r\n|\r|\n)/gm, ""); // 删除空白行
    sendToSidePanelPromise('updateTexts', cleanText).then(() => {
      icon.style.display = 'none';
    });
    copyToClipboard(cleanText)
  }
});

function sendToSidePanelPromise(action, text) {
  return new Promise((resolve, reject) => {
    const message = {
      action: action,
      text: text
    };
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).then(() => {
      // alert('Text copied to clipboard!');
      icon.style.display = 'none';
    });
}