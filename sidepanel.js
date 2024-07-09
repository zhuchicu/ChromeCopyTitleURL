// TODO
document.addEventListener('DOMContentLoaded', function() {
  const sidepanelContent = document.getElementById('sidepanelContent');
  if (sidepanelContent) {
    console.log('Side panel is open');
  } else {
    console.log('Side panel is closed');
  }

  // ==============================================================================================
  // region: 只会在 sidepanel 有段落文本时才会显示，否则将隐藏起来
  const buttonContainer = document.getElementById('button-container');
  const separator = document.getElementById('separator');

  function updateButtonVisibility() {
    if (sidepanelContent.children.length > 1) {
      buttonContainer.classList.remove('hidden');
      separator.classList.remove('hidden');
    } else {
      buttonContainer.classList.add('hidden');
      separator.classList.add('hidden');
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
        prevTextBlock.firstElementChild.textContent += '。' + nextTextBlock.firstElementChild.textContent;
        // 移除被合并的段落和点击的合并区域
        sidepanelContent.removeChild(nextTextBlock);
        sidepanelContent.removeChild(mergeArea);
      }
    }
  });


});

// 接收来自背景脚本的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(`sidePanel 收到消息：${request.action}`)

  if (request.action === 'updateTexts') {
    const text = request.text;
    appendCustomText(text);
    sendResponse({ status: 'success' }); // 返回响应
    return true; // 以确保异步 sendResponse 可以工作
  }

  if (request.action === 'updateTitle') {
    document.title = request.text;
    sendResponse({ status: 'Title updated' });
    return true;
  }
});


// 动态创建并插入自定义文本段
function appendCustomText(text) {
  const content = document.getElementById('sidepanelContent');

  // 在新段落之前添加一个合并区域
  if (content.children.length > 0) {
    const mergeArea = createMegrArea();
    content.appendChild(mergeArea);
  }

  const div = document.createElement('div');
  div.id = "text-block-" + generateUniqueId();
  div.className = 'text-block';
  div.setAttribute("draggable", "true");
  div.addEventListener("dragstart", dragStart);
  div.addEventListener("dragover", function(event) {
    event.preventDefault(); // 阻止默认行为，允许放置拖动的内容
  });
  div.addEventListener("drop", drop);


  const p = document.createElement('p');
  p.classList.add('paragraph');
  p.textContent = text;
  div.appendChild(p);

  const copyBtn = createCopyBtn();
  div.appendChild(copyBtn);

  const delBtn = createDelBtn(div);
  div.appendChild(delBtn);

  // 将元素加入到 sidePanel 中
  content.appendChild(div);
}


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
    var targetElement = event.target.closest('.paragraph');
    console.log(`处理拖放逻辑 data:${data}`)
    console.log(`处理拖放逻辑 draggedElement:${draggedElement}`)
    console.log(`处理拖放逻辑 targetElement:${targetElement}`)
    if (targetElement) {
      console.log(`处理拖放逻辑.parentNode:${targetElement.parentNode}`)
        if (event.target.offsetTop < draggedElement.offsetTop) {
            targetElement.parentNode.insertBefore(draggedElement, targetElement.nextSibling);
        } else {
            targetElement.parentNode.insertBefore(draggedElement, targetElement);
        }
    }
}

function createMegrArea() {
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
  delBtn.addEventListener('click', () => {
    parent.remove();
  });
  return delBtn;
}