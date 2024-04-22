/*要执行的初始化操作*/
setWordList();//无语了
//输入=Enter
let word_editor = document.getElementById("word_editor");
word_editor.addEventListener("keydown",function(event) {
    if (event.key === "Enter") addWord();
})

//插入wordlist的上下文菜单
let wl_container = document.getElementById("word_list_container");
let contextMenu = document.getElementById("wl-context-menu");
wl_container.addEventListener("contextmenu", function(event) {
    event.preventDefault(); // 阻止默认的上下文菜单弹出
  let target = document.getElementById("word_list_container");
  let rect = target.getBoundingClientRect(); // 获取元素相对于视口的位置
  let x = event.clientX - rect.left; // 相对于元素左边缘的水平坐标
  let y = event.clientY - rect.top; // 相对于元素上边缘的垂直坐标
  contextMenu.style.display = "block";
  contextMenu.style.left = x + "px";
  contextMenu.style.top = y + "px";
});
document.addEventListener("click", function() {
    contextMenu.style.display = "none";
});

/*正式的函数定义*/
function addWord(){
    let word = document.getElementById("word_editor").value;
    let wordlist = JSON.parse(window.localStorage.filterwords || '[]');
    document.getElementById("word_editor").value="";
    if (/^\s*$/.test(word)) {//字符串仅包含空白字符
        showErrorMessage("space-message");
        return;
    }
    //重复词检查
    for (let item of wordlist){
        if (item.word==word){
            showErrorMessage("duplicate-message");
            return; //提前结束
        }
    }
    let item = {
        enabled: true,
        word: word,
    };
    if (/^\/.*\/$/.test(item.word)) item.type=1;//正则表达式类型
    else item.type=0;//普通字符串类型
    wordlist.push(item);
    setLocalStorage('filterwords',JSON.stringify(wordlist));
    setWordList();
}

function setWordList(){
    document.getElementById("word_list").innerHTML = "";
    let wordlist = JSON.parse(window.localStorage.filterwords || '[]');
    if(wordlist.length === 0) return;
    for(let i = 0; i < wordlist.length; i++){
        let item = wordlist[i];
        //文字内容
        let word=document.createElement("div")
            word.innerText=item.word
            word.classList.add("wl_item_word")
        //启用checkbox
        let box=document.createElement("input")
            box.type="checkbox"
            box.checked=item.enabled
            box.onchange=function(){changeEnabled(i)}
        //删除按键
        let btn=document.createElement("button")
            btn.innerText="删除"
            btn.classList.add("wl_item_delete")
            btn.onclick=function(){deleteWord(i)}
        //一些框的打包
        let div_other=document.createElement("div");
            div_other.appendChild(box);
            div_other.appendChild(btn);
            div_other.classList.add("wl_item_nonword");
        let div_whole=document.createElement("div");
            div_whole.appendChild(word);
            div_whole.appendChild(div_other);
            div_whole.classList.add("wl-item");
        document.getElementById("word_list").appendChild(div_whole);
    }
}

function deleteWord(index){
    let wordlist = JSON.parse(window.localStorage.filterwords);
    wordlist.splice(index, 1);
    setLocalStorage('filterwords',JSON.stringify(wordlist));
    setWordList();
}

function changeEnabled(index){
    let wordlist = JSON.parse(window.localStorage.filterwords);
    wordlist[index].enabled=event.target.checked;
    setLocalStorage('filterwords',JSON.stringify(wordlist));
}

function importWordList(event){
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const fileContent = event.target.result;
        try {
            const jsonData = JSON.parse(fileContent);
            if (Array.isArray(jsonData)) {
            // 第一种JSON格式
            if (!jsonData[0].hasOwnProperty('type') || !jsonData[0].hasOwnProperty('filter') || !jsonData[0].hasOwnProperty('opened') || !jsonData[0].hasOwnProperty('id')) {
                showErrorMessage("bad-pattern");
                return;
            }
            let wordlist = JSON.parse(window.localStorage.filterwords || '[]');
            let wordcount = 0;
            for (item of jsonData){
                //处理弹幕屏蔽词列表内容
                if (item.type==2) continue; 
                let new_word ={
                    word: item.filter,
                    enabled: item.opened,
                    type: item.type,
                }
                //检查重复
                let duplicate = wordlist.find( item => item.word == new_word.word);
                if (duplicate) continue;
                    wordcount++;
                wordlist.push(new_word);
            }
                //添加成功消息
                document.getElementById('add-success').innerText = `成功导入${wordcount}个屏蔽词！`;
                showErrorMessage('add-success');
                //添加单词
                setLocalStorage('filterwords',JSON.stringify(wordlist));
                setWordList();
            } 
            else if (typeof jsonData === 'object') {
            // 第二种JSON格式
                if (!jsonData.hasOwnProperty('wordlist') || !jsonData.hasOwnProperty('emojilist') || !jsonData.hasOwnProperty('banAtSomeone')) {
                    showErrorMessage("bad-pattern");
                    return;
                }
                let wordcount = 0;
                let new_wordlist = jsonData.wordlist;
                for (new_item of new_wordlist){
                    let new_word ={
                        word: item.word,
                        enabled: item.enabled,
                        type: item.type,
                    }
                    //检查重复
                    let duplicate = wordlist.find( item => item.word == new_word.item);
                    if (duplicate) continue;
                        wordcount++;
                    wordlist.push(new_word);
                }
                //添加成功消息
                document.getElementById('add-success').innerText = `成功导入${wordcount}个屏蔽词！`;
                showErrorMessage('add-success');
                //添加单词
                setLocalStorage('filterwords',JSON.stringify(wordlist));
                setWordList();
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

//导出屏蔽词列表（以弹幕屏蔽词列表的形式）
function exportWordList(){
    let wordlist = JSON.parse(window.localStorage.filterwords || '[]');
    if (wordlist.length == 0){
        showErrorMessage("noword-message");
        return;
    }
    let export_list=[];
    for (item of wordlist){
        let export_item = {
            filter:item.word,
            opened:item.enabled,
            type:item.type,
        }
        export_list.push(export_item);
    }
    const export_data = JSON.stringify(export_list);
    const blob = new Blob([export_data], { type: 'application/json' });
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

    link.download = `屏蔽词列表 ${formattedDate}.json`;

    link.click();
    URL.revokeObjectURL(url);
}
