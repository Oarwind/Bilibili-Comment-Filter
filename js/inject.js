document.addEventListener('DOMContentLoaded', function () {
  //创建settings-panel
  let settings_panel = document.createElement('div');
  let settings_panel_URL=chrome.runtime.getURL("settings-panel.html");
  fetch(settings_panel_URL)
    .then(response => response.text())
    .then(html => {
      settings_panel.innerHTML = html;
      settings_panel.classList.add('diy-centered');
      settings_panel.id="popup";
      //settings_panel.draggable = true;
      document.body.appendChild(settings_panel);
      insert();
    })
    .catch(error => {
      console.error("Error fetching HTML content:", error);
    });
})


/*link文件*/
function insert(){
  let jsArray = ['js/elselist.js','js/wordlist.js','js/filter.js','js/emojilist.js'];
  for (jsPath of jsArray){
    injectJS(jsPath);
  }
  let cssArray = ['css/some.css','css/wordpanel.css','css/emojipanel.css'];
  for (cssPath of cssArray){
    injectCSS(cssPath);
  }

  //插入设置按钮
  let observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // 检查每个添加的节点
      Array.from(mutation.addedNodes).forEach(function(node) {
        // 如果添加的节点包含类名为'time-sort'
        if (node.classList && node.classList.contains('time-sort')) {
          // 创建新的按钮元素
          let setting_button = document.createElement('input');
          node.insertAdjacentElement('afterend', setting_button);
          setting_button.outerHTML ='<button type="button" id="setting-button" onclick="openPanel()">设置</button>'
          let ToolTipEnabled =  localStorage.getItem('ToolTipEnabled') === 'true';
          if (ToolTipEnabled == true)  addToolTip();
          // 将新按钮插入到'time-sort'节点后面
          observer.disconnect;
        }
      });
    });
  });
  // 开始观察document.documentElement的子节点变化
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

// 监听鼠标悬停事件
function addToolTip(){
  let tooltipElement = document.createElement('div');
  tooltipElement.classList.add('tooltip');
  document.body.appendChild(tooltipElement);
  let reply_list = document.querySelector('.reply-list');
  reply_list.addEventListener('mouseover', function (event) {
      if (!(event.target.classList.contains('emoji-small')) && !(event.target.classList.contains('emoji-large'))) {
          return;
      }
      let altText = event.target.alt;
      tooltipElement.textContent = altText;
      tooltipElement.style.left = event.pageX + 'px';
      tooltipElement.style.top = event.pageY - 30 + 'px';
      tooltipElement.style.display = 'block';
    });
    // 监听鼠标离开事件
  reply_list.addEventListener('mouseout', function () {
      // 隐藏提示框
      tooltipElement.style.display = 'none';
  });
}

function injectJS(jsPath){
	let js = document.createElement('script');
	js.src = chrome.runtime.getURL(jsPath);
	document.head.appendChild(js);
}

function injectCSS(cssPath){
  let css = document.createElement('link');
  css.rel="stylesheet";
  css.type= "text/css";
  css.href= chrome.runtime.getURL(cssPath);
	document.head.appendChild(css);
}