/*初始化*/


const banByFancheckbox = document.getElementById('banByFanCheckbox');
const banAtcheckbox = document.getElementById("banAtSomeoneCheckbox");
const banByFanDiv = document.getElementById("banByFanDiv");
const ToolTipcheckbox = document.getElementById("ToolTipEnabled");


//面板拖拽
const settings_panel = document.querySelector('#popup');
let isDragging = false;
let offset = { x: 0, y: 0 };

settings_panel.addEventListener("mousedown", (event) => {
  isDragging = true;
  offset.x = event.clientX - settings_panel.offsetLeft;
  offset.y = event.clientY - settings_panel.offsetTop;
});

document.addEventListener("mousemove", (event) => {
  if (isDragging) {
    const x = event.clientX - offset.x;
    const y = event.clientY - offset.y;

    settings_panel.style.left = x + "px";
    settings_panel.style.top = y + "px";
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});


//把切换面板事件托管给header
let header = document.getElementById('header');
header.addEventListener('click', showPanel);

//插入refreshReminder的显示事件
const localStorageKeys = ['filterwords', 'filteremojis', 'banAtSomeone','banByFan','ToolTipEnabled'];
function showRefreshReminder(event) {
  if (localStorageKeys.includes(event.key) && event.oldValue !== event.newValue) {
    let refreshReminder = document.getElementById("refreshReminder");
    refreshReminder.style.display = "block";
    window.removeEventListener('storage', showRefreshReminder);
  }
}
window.addEventListener('storage', showRefreshReminder);
setElsePanel();
/*函数定义*/
function openPanel(){
    settings_panel.style.display='block';
}
function closePanel(){
    settings_panel.style.display='none';
}

function setLocalStorage(key, value) {
    // 创建并分派storage事件
    const storageEvent = new StorageEvent('storage', {
      key: key,
      oldValue: localStorage.getItem(key),
      newValue: value,
      storageArea: localStorage
    });
    //最后再改啦！！！
    localStorage.setItem(key, value);
    window.dispatchEvent(storageEvent);
}

//切换面板
function showPanel(event) {
    if (!event.target.classList.contains('panel_btn')) return;
    let panelId = event.target.id.replace("_btn", "");
	
	//移除所有panel的active状态
    let panels = document.querySelectorAll('.panel');
	for (let i = 0; i < panels.length; i++) {
	  panels[i].classList.remove('active');
	}
	document.getElementById(panelId).classList.add('active');

	//移除button的active状态
    let buttons = document.querySelectorAll('.panel_btn')
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].classList.remove('active');
	}
	event.target.classList.add('active');
}

//显示错误消息
function showErrorMessage(messageId){
    let errorMessage = document.getElementById(messageId);
    errorMessage.classList.add('show');
    setTimeout(function() {
        errorMessage.classList.remove('show')
    }, 1000);
}
//选择文件
function selectfile(InputId){
    const fileInput = document.getElementById(InputId);
    fileInput.click();
}



/*else-panel*/
function changeBanAt(){
    setLocalStorage('banAtSomeone',JSON.stringify(event.target.checked));
    if (event.target.checked==true) banByFanDiv.style.display = "block";
    else banByFanDiv.style.display = "none";
}

function banByFan(){
  setLocalStorage('banByFan',JSON.stringify(event.target.checked));
}

function changeToolTip(){
  setLocalStorage('ToolTipEnabled',JSON.stringify(event.target.checked))
}

function setElsePanel(){
    //屏蔽某人的设置
    banAtcheckbox.checked = localStorage.getItem('banAtSomeone') === 'true';
    ToolTipcheckbox.checked = localStorage.getItem('ToolTipEnabled') === 'true';
    banByFancheckbox.checked = localStorage.getItem('banByFan') === 'true';
    if (banAtcheckbox.checked == false ) banByFanDiv.style.display = "none";
}

//导出全局设置
function exportGlobal(){
    const wordlist = JSON.parse(window.localStorage.filterwords || '[]');
    const emojilist = JSON.parse(window.localStorage.filteremojis || '[]');
    const banAtSomeone = localStorage.getItem('banAtSomeone') || 'false';
    const banByFanNum = localStorage.getItem('banByFanNum') || 'false';

    const settingsData = JSON.stringify({wordlist,emojilist,banAtSomeone,banByFanNum});

    const blob = new Blob([settingsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const hours = String(currentDate.getHours()).padStart(2, '0');
      const minutes = String(currentDate.getMinutes()).padStart(2, '0');
      const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day} ${hours}${minutes}${seconds}`;
    link.download = `屏蔽设置 ${formattedDate}.json`;

    link.click();
    URL.revokeObjectURL(url);
}

//导入全局设置
function importGlobal(){
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
      const fileContent = event.target.result;
      try {
          const jsonData = JSON.parse(fileContent);
          if (typeof jsonData === 'object') {
              if (!jsonData.hasOwnProperty('wordlist') || !jsonData.hasOwnProperty('emojilist') || !jsonData.hasOwnProperty('banAtSomeone') || !jsonData.hasOwnProperty('banByFanNum')) {
                  showErrorMessage("bad-pattern");
                  return;
              }
              //添加屏蔽词
              let wordlist = JSON.parse(window.localStorage.filterwords || '[]');
              let new_wordlist = jsonData.wordlist;
              for (let item of new_wordlist){
                  let new_word ={
                      word: item.word,
                      enabled: item.enabled,
                      type: item.type,
                  }
                  //检查重复
                  let duplicate = wordlist.find( item => item.word == new_word.word);
                  if (duplicate) continue;
                  wordlist.push(new_word);
              }
              setLocalStorage('filterwords',JSON.stringify(wordlist));
              setWordList();
              //添加emoji
              let emojilist = JSON.parse(window.localStorage.filteremojis || '[]');
              let new_emojilist = jsonData.emojilist;
              for (let emoji_item of new_emojilist){
                let new_emoji ={
                    id:emoji_item.id,
                    package_id:emoji_item.package_id,
                    text:emoji_item.text,
                    url:emoji_item.url,
                    size:emoji_item.size,
                }
                //检查重复
                let duplicate = emojilist.find( item => item.text == new_emoji.text);
                if (duplicate) continue;
                emojilist.push(new_emoji);
              }
              setLocalStorage('filteremojis',JSON.stringify(emojilist));
              setEmojiList();
              //设置ElsePanel
              setLocalStorage('banAtSomeone',jsonData.banAtSomeone);
              setLocalStorage('banByFan',jsonData.banByFanNum);
              setElsePanel();
          } 
          else {
              showErrorMessage("bad-pattern");
          }
      } catch (error) {
          showErrorMessage('parse-fail');
      }
  };
      reader.onerror = function() {
          showErrorMessage("read-fail");
      };
      reader.readAsText(file);
}
