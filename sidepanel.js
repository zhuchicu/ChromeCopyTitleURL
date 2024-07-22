let backgroundPort;
function connectToBackground() {
  backgroundPort = chrome.runtime.connect({name: "sidepanel-connection"});

  backgroundPort.onMessage.addListener(function(msg) {
    // console.log("Received message from background:", msg, msg.action);
    
    // 处理来自背景脚本的消息
    if (msg.action === 'updateTexts') {
      appendCustomText(formattedText(msg.text));
    }

    if (msg.action === 'paragraphs') {
      // console.log(`paragraphs.length: ${msg.fragments.length}`);
      msg.fragments.forEach(function(item) {
        const t = formattedText(item);
        appendCustomText(t);
      });
    }

    if (msg.action === 'updateTitle') {
      document.title = msg.text;
    }

  });

  backgroundPort.onDisconnect.addListener(function() {
    console.log("Disconnected from background. Attempting to reconnect...");
    setTimeout(connectToBackground, 1000);  // 1秒后尝试重新连接
  });
}

document.addEventListener('DOMContentLoaded', function() {
  connectToBackground();

  const sidepanelContent = document.getElementById('sidepanelContent');

  // ==============================================================================================
  // region: 只会在 sidepanel 有段落文本时才会显示，否则将隐藏起来
  const buttonContainer = document.getElementById('button-container');
  const separator = document.getElementById('separator');
  const readmeContent = document.getElementById('readmeContent');

  function updateButtonVisibility() {
    if (sidepanelContent.children.length > 1) {
      buttonContainer.classList.remove('hidden');
      separator.classList.remove('hidden');
    } else {
      buttonContainer.classList.add('hidden');
      separator.classList.add('hidden');
    }

    if (sidepanelContent.children.length === 0) {
      readmeContent.classList.remove('hidden');
    } else {
      readmeContent.classList.add('hidden');
    }
  }

  // 初始检查按钮可见性
  // updateButtonVisibility();

  // 监听文本容器的变化
  const observer = new MutationObserver(updateButtonVisibility);
  observer.observe(sidepanelContent, { childList: true, subtree: true });


  // ==============================================================================================
  // region: SidePanel 提供整体合并和清空功能
  const copyAllBtn = document.getElementById('copy-all');
  const clearAllBtn = document.getElementById('clear-all');
  const notification = document.getElementById('notification');

  function showNotification(message, type) {
    notification.textContent = message;
    notification.className = type;
    setTimeout(() => {
      notification.className = 'hidden';
    }, 3000);
  }

  copyAllBtn.addEventListener('click', function() {
    const text = Array.from(sidepanelContent.children)
                      .map(child => child.textContent)
                      .join('\n');
    navigator.clipboard.writeText(text).then(function() {
      // alert('所有文本已复制到剪贴板');  // 不适用默认的弹窗
      showNotification('所有文本已复制到剪贴板', 'success');
    }, function(err) {
      console.error('无法复制文本: ', err);
      showNotification('复制文本失败', 'warning');
    });
  });

  clearAllBtn.addEventListener('click', function() {
    // if (confirm('确定要清空所有文本吗？')) {
    //   sidepanelContent.innerHTML = '';
    // }
    notification.innerHTML = `
      确定要清空所有文本吗？
      <button id="confirm-clear">确定</button>
      <button id="cancel-clear">取消</button>
    `;
    notification.className = 'warning';

    document.getElementById('confirm-clear').addEventListener('click', function() {
      sidepanelContent.innerHTML = '';
      showNotification('所有文本已清空', 'success');
      updateButtonVisibility();
    });

    document.getElementById('cancel-clear').addEventListener('click', function() {
      notification.className = 'hidden';
    });
  });


  // ==============================================================================================
  // region: SidePanel 点击两个相邻段落文本之间实现合并
  sidepanelContent.addEventListener('click', function(event) {
    // console.log(`sidepanelContent click event.target: ${event.target.getAttribute('class')}`)
    if (event.target.classList.contains('merge-area') || event.target.classList.contains('merge-icon')) {
      const mergeArea = event.target.classList.contains('merge-area') ? event.target : event.target.parentElement;
      const prevTextBlock = mergeArea.previousElementSibling;
      const nextTextBlock = mergeArea.nextElementSibling;

      if (prevTextBlock && nextTextBlock) { // 合并段落
        // const prevBlockText = prevTextBlock.firstElementChild.textContent
        // const split = endsWithPunctuation(prevBlockText) ? '' : '。'
        prevTextBlock.firstElementChild.textContent += nextTextBlock.firstElementChild.textContent;
        // 移除被合并的段落和点击的合并区域
        sidepanelContent.removeChild(nextTextBlock);
        sidepanelContent.removeChild(mergeArea);
      }
    }
  });



  const contextMenu = document.getElementById('contextMenu');
  const customOption = document.getElementById('customOption');

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    const isParagraph = (event.target === focusParagraph) || (event.target.parentNode === focusParagraph)
    if (focusParagraph && isParagraph) {
      contextMenu.style.display = 'block';
      contextMenu.style.left = `${event.pageX}px`;
      contextMenu.style.top = `${event.pageY}px`;
    }
  });

  document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
  });

  customOption.addEventListener('click', () => {
    // alert('自定义选项被点击');
    insertCustomText(focusParagraph, "");
  });
});

function insertCustomText(sibling, text) {
  const mergeArea = createMergeArea();
  const content = document.getElementById('sidepanelContent');
  content.insertBefore(mergeArea, sibling.nextSibling);

  const div = createTextBlock();
  const p = createParagraphText(text);
  div.appendChild(p);

  const copyBtn = createCopyBtn();
  div.appendChild(copyBtn);

  const delBtn = createDelBtn(div);
  div.appendChild(delBtn);

  content.insertBefore(div, mergeArea.nextSibling);
}

// 动态创建并插入自定义文本段
function appendCustomText(text) {
  if (!Boolean(text)) {
    return;
  }
  const content = document.getElementById('sidepanelContent');

  // 在新段落之前添加一个合并区域
  if (content.children.length > 0) {
    const mergeArea = createMergeArea();
    content.appendChild(mergeArea);
  }

  const div = createTextBlock();
  const p = createParagraphText(text);
  div.appendChild(p);

  const copyBtn = createCopyBtn();
  div.appendChild(copyBtn);

  const delBtn = createDelBtn(div);
  div.appendChild(delBtn);

  // 将元素加入到 sidePanel 中
  content.appendChild(div);
}

// function endsWithPunctuation(text) {
//   // 定义一个正则表达式，用于匹配尾部的标点符号
//   const punctuationRegex = /[.,;:!?。，！？、；：]/; // 包含半角和全角标点符号
//   // 获取字符串的最后一个字符
//   const lastChar = text.slice(-1);
//   // 判断最后一个字符是否匹配正则表达式
//   return punctuationRegex.test(lastChar);
// }


function generateUniqueId() {
  // 全局计数器、时间戳，或第三方库或者自定义函数生成 UUID
    return new Date().getTime();
}

// dragstart 事件处理函数
function dragStart(event) {
  // 在这里可以定义拖拽开始时的逻辑
  event.dataTransfer.setData("text/plain", event.target.id);
}

// drop 函数实现
function drop(event) {
    event.preventDefault(); // 阻止默认行为

    // 在这里可以处理拖放完成后的逻辑，比如获取拖放的数据、调整元素位置等
    var data = event.dataTransfer.getData("text/plain");
    var draggedElement = document.getElementById(data);
    // 处理拖放逻辑
    var targetElement = event.target.closest('.text-block');
    if (targetElement) {
      var draggedElemPrevMergeArea = draggedElement.previousSibling;
      if (draggedElemPrevMergeArea) {
        draggedElemPrevMergeArea.remove();
      } else {
        if (draggedElement.nextSibling) {
          draggedElement.nextSibling.remove();
        }
      }

      const mergeArea = createMergeArea();
      // 拖拽对象在目标对象的上方
      if (event.target.offsetTop > draggedElement.offsetTop) {
        targetElement.parentNode.insertBefore(draggedElement, targetElement.nextSibling);
        targetElement.parentNode.insertBefore(mergeArea, draggedElement);
      } else {
        targetElement.parentNode.insertBefore(draggedElement, targetElement);
        targetElement.parentNode.insertBefore(mergeArea, targetElement);
      }
    }
}

function createTextBlock() {
  const div = document.createElement('div');
  div.id = "text-block-" + generateUniqueId();
  div.className = 'text-block';
  div.setAttribute("draggable", "true");
  div.addEventListener("dragstart", dragStart);
  div.addEventListener("dragover", function(event) {
    event.preventDefault(); // 阻止默认行为，允许放置拖动的内容
  });
  div.addEventListener("drop", drop);
  div.addEventListener("click", clickTextBlock);
  return div;
}

let focusParagraph = null;
function clickTextBlock(event) {
  let node = event.target;
  while (node && node.nodeName === "P") {
    node = node.parentNode;
  }

  if (focusParagraph) {
    focusParagraph.style.border = "1px solid #ccc";
  }

  if (focusParagraph === node) {
    focusParagraph = null;
  } else {
    focusParagraph = node;
    focusParagraph.style.border = "1px solid red"; 
  }
}

function createParagraphText(text) {
  const p = document.createElement('p');
  p.classList.add('paragraph');
  p.textContent = text;
  p.addEventListener('dblclick', function() {
    // this.parentNode.setAttribute("draggable", "false");
    const textarea = createTextArea(this.textContent, p);
    // 用输入框替换段落
    this.replaceWith(textarea);
    textarea.focus();
  });
  return p;
}

function createTextArea(text, inheritStyleElem) {
  // 创建一个输入框并设置其初始值为当前段落的文本
  const textarea = document.createElement('textarea');
  textarea.type = 'text';
  textarea.value = text;
  textarea.className = 'editable-textarea';

  // 获取 p 元素的样式并应用到 textarea 元素上
  const computedStyle = window.getComputedStyle(inheritStyleElem);
  textarea.style.width = computedStyle.width;
  textarea.style.height = computedStyle.height;
  textarea.style.font = computedStyle.font;
  textarea.style.fontSize = computedStyle.fontSize;
  textarea.style.fontWeight = computedStyle.fontWeight;
  textarea.style.lineHeight = computedStyle.lineHeight;

  function finishEditing() {
    const newParagraphText = createParagraphText(textarea.value);
    // 使用 setTimeout 延迟替换操作
    setTimeout(() => {
      textarea.replaceWith(newParagraphText);
      // 确保新的段落获取焦点，以移除光标的显示
      newParagraphText.focus();
      if (newParagraphText && !Boolean(newParagraphText.textContent)) {
        delTextBlock(newParagraphText.parentNode);
      }
    });
  }

  // 监听输入框的失去焦点事件
  textarea.addEventListener('blur', finishEditing);

  // 监听输入框的回车键事件
  textarea.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // 防止在 textarea 中输入回车
      finishEditing();
    }
  });
  return textarea;
}

function createMergeArea() {
  const mergeArea = document.createElement('div');
  mergeArea.classList.add('merge-area');
  const mergeChain = document.createElement('i');
  mergeChain.classList.add('fas', 'fa-link', 'merge-icon');
  mergeArea.appendChild(mergeChain);
  return mergeArea;
}

function createCopyBtn() {
  const copyBtn = document.createElement('button');
  // copyBtn.textContent = 'Copy';  // 不用文字，使用 icon
  copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
  copyBtn.className = 'copy-button';
  copyBtn.addEventListener('click', () => {
    const t = copyBtn.previousElementSibling.textContent;
    navigator.clipboard.writeText(t);
    copyBtn.classList.add('active');
    setTimeout(() => {
      copyBtn.classList.remove('active');
    }, 200); // 200ms 按下效果持续时间
  });

  return copyBtn;
}

function createDelBtn(parent) {
  // 创建删除按钮 (使用 Font Awesome 图标)
  const delBtn = document.createElement('button');
  // delBtn.textContent = 'Delete';  // 不用文字，使用 icon
  delBtn.className = 'delete-button';
  delBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
  delBtn.addEventListener('click', () => delTextBlock(parent));
  return delBtn;
}

function delTextBlock(block) {
  if (block) {
    const next = block.nextElementSibling;
    const prev = block.previousElementSibling;
    if (next) {
      next.remove();
    } else {
      if (prev) {
        prev.remove();
      }
    }
    block.remove();
  }
}

function formattedText(text) {
  const t = pangu.spacing(text);
  const newText = t.replace(/(\r\n|\n|\r)/gm, " ")        // 替换换行符为空格
                      .replace(/^\s*$(?:\r\n|\r|\n)/gm, ""); // 删除空白行
  return newText
}