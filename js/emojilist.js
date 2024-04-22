/*前期准备*/
let whole_emojilist; // 将whole_emojilist定义为全局变量
//下载并保存表情列表
fetch('https://api.bilibili.com/x/emote/user/panel/web?business=reply', {
    method: 'GET',
    credentials: 'include'
  })
    .then(response => response.json()) // 解析为JSON对象
    .then(data => {
        whole_emojilist = data.data.packages; // 获取packages数组
    })
    .catch(error => {
        console.error('Error retrieving data:', error);
    });

//输入=Enter
let emoji_editor = document.getElementById("emoji_editor");
emoji_editor.addEventListener("keydown",function(event) {
    if (event.key === "Enter") addEmoji();
})

setEmojiList();
/*正经函数*/
function addEmoji(){
    let emoji_text = document.getElementById("emoji_editor").value;
    document.getElementById("emoji_editor").value="";
    //检查输入
    let emoji_text_array = emoji_text.match(/\[[^\]]+\]/g);
    //检查非空
    if (emoji_text_array.length === 0){
        showErrorMessage('noemoji-message');
        return;
    }
    //检查重复
    emoji_text_array = [...new Set(emoji_text_array)];//输入去重
    let emoji_list = JSON.parse(window.localStorage.filteremojis || '[]');

    emoji_text_array = emoji_text_array.filter(new_emoji_text =>{
        let flag = emoji_list.find(emoji_item => emoji_item.text==new_emoji_text);
        return !flag;
    });
    if (emoji_text_array.length === 0){
        showErrorMessage('nochange-message');
        return;
    }
    emoji_text_array.map(new_emoji_text => {
        const emoji = handleEmoji(new_emoji_text);
        if (emoji) {
          emoji_list.push(emoji);
        }
    });
    //添加至浏览器缓存
    setLocalStorage('filteremojis',JSON.stringify(emoji_list));
    setEmojiList();
}

//创建数据结构，并检查表情是否合法
function handleEmoji(emoji_text){
    let new_emoji_item=null;
    whole_emojilist.forEach(emojitype => {
        //对每个emojitype进行查找
        let emote = emojitype.emote;//emote数组
        let emoji_item = emote.find(item => item.text == emoji_text);//在emote数组里一项项找
        if (emoji_item) {
            new_emoji_item ={
                id:emoji_item.id,
                package_id:emoji_item.package_id,
                text:emoji_item.text,
                url:emoji_item.url,
                size:emoji_item.meta.size,
            }
        }
    })
    return new_emoji_item;
}


function setEmojiList(){
    //清空
    document.getElementById("small_emoji_list").innerHTML = "";
    document.getElementById("big_emoji_list").innerHTML = "";

    let emoji_list = JSON.parse(window.localStorage.filteremojis || '[]');
    if(emoji_list.length === 0) return;

    emoji_list.map(emoji_item =>{
        //装emoji的小方块
        let emoji_holder=document.createElement("div");
        //创建emoji的图像
        let emoji=document.createElement("img");
            switch(emoji_item.size){
                case 1://small-emoji
                    emoji_holder.classList.add("small-emoji-holder");
                    emoji.classList.add("diy-small-emoji");
                    showlist=document.getElementById("small_emoji_list");
                    break;
                case 2://big-emoji
                    emoji_holder.classList.add("big-emoji-holder");
                    emoji.classList.add("diy-big-emoji");
                    showlist=document.getElementById("big_emoji_list");
                    break;
            }
            emoji.src=emoji_item.url;
            emoji.alt=emoji_item.text;
            emoji_holder.setAttribute('emojiname', emoji_item.text);
            emoji_holder.appendChild(emoji);
            showlist.append(emoji_holder);

        //添加上下文菜单
        emoji_holder.addEventListener("contextmenu", function(event) {
         event.preventDefault(); 
         let rect = emoji_holder.getBoundingClientRect(); // 获取元素相对于视口的位置
         let x = event.clientX - rect.left; // 相对于元素左边缘的水平坐标
         let y = event.clientY - rect.top; // 相对于元素上边缘的垂直坐标

         //创建deleteMenu
         let deleteMenu = document.createElement('li');
             deleteMenu.classList.add('context-menu');
             deleteMenu.style.display = "block";
             deleteMenu.innerText="删除";
             deleteMenu.style.left = x + "px";
             deleteMenu.style.top = y + "px";
             deleteMenu.addEventListener("click", function(event) {
                 event.stopPropagation();
                 deleteEmoji(emoji_list.indexOf(emoji_item));
                 deleteMenu.remove();
                });
             emoji_holder.appendChild(deleteMenu);
             //左键显示
         document.addEventListener("click", function(){
             deleteMenu.remove();
            });
        });
       
    })
}

function deleteEmoji(index){
    let emoji_list = JSON.parse(window.localStorage.filteremojis);
    emoji_list.splice(index, 1);
    setLocalStorage('filteremojis',JSON.stringify(emoji_list));
    setEmojiList();
}
