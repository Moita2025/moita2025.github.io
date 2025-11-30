const params = new URLSearchParams(location.search);

const word = window.Utils.url.getSearchParam({
    paramName: "word", 
    defaultParam: "a"
});
const collection = window.Utils.url.getSearchParam({
    paramName: "collection", 
    defaultParam: "junior"
});

const cache = {};

async function loadWord() {
    const contentEl = document.getElementById("content");
    const loadingEl = document.getElementById("loading");

    try {
        // 1. 加载对应词表的 JSON（缓存）
        let wordsArray = cache[collection];
        if (!wordsArray) {
            const url = window.Utils.vocab.WORD_JSON_MAP[collection];
            if (!url) throw new Error("不支持的词表");

            const resp = await fetch(url);
            if (!resp.ok) throw new Error("词表加载失败");

            wordsArray = await resp.json();
            cache[collection] = wordsArray;
        }

        // 2. 查找单词（不区分大小写）
        const item = wordsArray.find(w =>w.word.toLowerCase() === word);

        if (!item) {
            loadingEl.innerHTML = `<p>未找到单词“${word}”</p>`;
            return;
        }

        //3.填充页面
        document.getElementById("word").textContent = item.word;

        // 音标（如果有扩展字段可自行加上，这里先留空）
        // 如有 uk/us phonetic，可在 JSON 中加 "phonetic_uk": "/æbɪləti/", "audio_uk": "xxx.mp3" 等
        // 释义
        const transUl = document.getElementById("translations");
        transUl.innerHTML = ""; (item.translations || []).forEach(t =>{
            const li = document.createElement("li");
            li.innerHTML = `<span class = "type"> ${t.type} </span> ${t.translation}`;
            transUl.appendChild(li);
        });

        //短语
        const phrasesDiv = document.getElementById("phrases");
        phrasesDiv.innerHTML = "";
        if (item.phrases && item.phrases.length) {
            document.getElementById("phrases-section").style.display = "block";
            item.phrases.forEach(p =>{
                const card = document.createElement("div");
                card.className = "phrase-card";
                card.innerHTML = `<div class = "phrase">${p.phrase}</div><div class="trans">${p.translation}</div >`;
                phrasesDiv.appendChild(card);
            });
        } else {
            document.getElementById("phrases-section").style.display = "none";
        }
        // 显示内容
        loadingEl.classList.add("hidden");
        contentEl.classList.remove("hidden");
    } catch(err) {
        console.error(err);
        loadingEl.innerHTML = `<p style = "color:red">加载失败：${err.message}</p>`;
    }
}

document.getElementById("play-uk")?.addEventListener("click", () => window.Utils.vocab.speak(word, "en-GB"));
document.getElementById("play-us")?.addEventListener("click", () => window.Utils.vocab.speak(word, "en-US"));

// 页面加载完立即执行
document.addEventListener("DOMContentLoaded", loadWord);