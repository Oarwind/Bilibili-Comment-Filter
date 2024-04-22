/*预装载*/
//其他设置
let banAtSomeone = localStorage.getItem('banAtSomeone') === 'true';
let banByFanNum = localStorage.getItem('banByFan') === 'true';

//文本词汇屏蔽
let banMap=[];
let wordlist = JSON.parse(window.localStorage.filterwords || '[]');
for (let item of wordlist){
    if (item.enabled==true){
        switch (item.type){
            case 0:
                banMap.push(new RegExp(item.word,"gm"));
                break;
            case 1:
                banMap.push(new RegExp(item.word.slice(1, -1),"gm"));
                break;
        }
    }
}
//表情屏蔽
let banSmallEmoji = [];
let banLargeEmoji = [];
let emojilist = JSON.parse(window.localStorage.filteremojis || '[]');

for (let item of emojilist){
    if (item.size==1) banSmallEmoji.push(item.text);
    else banLargeEmoji.push(item.text);
}

/*开始过滤*/
//只面向大评论
function hiddenWay(item){
    let str=''
    let childs = item.childNodes;
    let emojisToRemove = [];
    childs.forEach(async (subitem)=>{
        // 纯文本
        if(subitem.nodeType===3){ 
            str = subitem.nodeValue;//评论内容
            for(let reg of banMap){
                if (reg.test(str)){
                    handleHidden(item);
                    break;
                }
            }
        }
        // 富文本
        else if (subitem.className != '' && subitem.className != undefined){ 
        switch(subitem.className) {
            case 'jump-link user': // @某人
                if (banAtSomeone) {
                    //去除回复
                    let previousTextNode = subitem.previousSibling;
                    if (previousTextNode && previousTextNode.nodeType === Node.TEXT_NODE) {
                        let replyText = previousTextNode.textContent.trim();
                      if (replyText.startsWith('回复')) {
                        break;
                      }
                    }
                    //去除大up主
                    if (banByFanNum) {
                        let mid = subitem.getAttribute('data-user-id');
                        let fanCount = await fetchFanCount(mid);
                        if (fanCount>100000) break;
                    }
                    handleHidden(item)
                }
                break;
            case 'emoji-small': // 小表情
                let tmp_small = banSmallEmoji.find(emoji_text => emoji_text == subitem.getAttribute('alt'));
                if (tmp_small) emojisToRemove.push(subitem);
                break;
            case 'emoji-large': // 大表情
                let tmp_large = banLargeEmoji.find(emoji_text => emoji_text == subitem.getAttribute('alt'));
                if (tmp_large) emojisToRemove.push(subitem);
                break;
        }
    }
    })
    emojisToRemove.forEach((emoji) => {
        emoji.remove();
    });
}

function handleHidden(item) {
    let targetItem = item.parentNode.parentNode;
    if (item.parentNode.parentNode.getAttribute("class").indexOf("root-reply") != -1) {
        // 新版本
        targetItem = targetItem.parentNode.parentNode.parentNode//往上顺三层
    }
    targetItem.style.display = 'none'
}


async function fetchFanCount(mid) {
    try {
      const response = await fetch(`https://api.bilibili.com/x/relation/stat?vmid=${mid}`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      return data.data.follower;
    } catch (error) {
      console.error(error);
    }
}

//立即执行函数
(function () {
    setInterval(()=>{
        replies = document.querySelectorAll('span.reply-content:not([filtered]),span.sub-reply-content:not([filtered])')
        replies.forEach((item)=>{
            hiddenWay(item)
            item.setAttribute('filtered',true)
        })
    },1000)
})();

