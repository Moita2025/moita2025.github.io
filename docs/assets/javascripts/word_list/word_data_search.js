function search_init()
{
    // ==== 1. 确保数据存在 ===================================================
    if (window.words == []) {
        console.log("words == []");
        return ;
    }

    // ==== 2. 初始化 Fuse.js ==================================================
    const fuse = new Fuse(window.words, {
        keys: ['word','translations.translation','phrases.phrase','phrases.translation'],
        threshold: 0.3,
    });

    // ==== 3. DOM ==============================================================
    const inputEl = document.getElementById("word-search-input");
    const searchBtn = document.getElementById("word-search-btn");
    const clearBtn = document.getElementById("word-clear-btn");
    const resultList = document.getElementById("search-result-list");

    // ==== 4. 搜索函数 ========================================================
    function doSearch() {
        const keyword = inputEl.value.trim();
        resultList.innerHTML = "";

        //console.log("here");

        if (!keyword) return;

        const results = fuse.search(keyword);

        const uniqueResults = [];
        const seenWords = new Set();
        for (const result of results) {
            const word = result.item.word;
            if (!seenWords.has(word)) {
                seenWords.add(word);
                uniqueResults.push(result);
            }
        }

        const max = 20;
        const realCount = Math.min(uniqueResults.length, max);

        for (let i = 0; i < realCount; i++) {
            const item = uniqueResults[i].item;
            const li = document.createElement("li");
            li.textContent = `${item.word}：${item.translations[0].translation}`;
            resultList.appendChild(li);
        }

        // 超过 20 条，追加 “…”（占 1 个 li）
        if (uniqueResults.length > max) {
            const li = document.createElement("li");
            li.textContent = "…";
            li.style.opacity = "0.6";
            li.style.fontWeight = "bold";
            resultList.appendChild(li);
        }

        updateSearchParams({ search: keyword });
    }

    const params = new URLSearchParams(window.location.search);
    const urlKeyword = params.get("search");

    if (urlKeyword && /^[A-Za-z]+$/.test(urlKeyword)) {
        inputEl.value = urlKeyword;
        doSearch();   // 自动搜索
    }

    // ==== 5. 事件 =============================================================

    // 添加按钮点击事件
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
        doSearch();
        });
    }

    // 添加Enter键事件
    if (inputEl) {
        inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            doSearch();
        }
        });
    }

    if (!clearBtn) return;

    clearBtn.addEventListener("click", () => {
        inputEl.value = "";
        resultList.innerHTML = "";
        inputEl.focus();

        updateSearchParams({ search: "" });
    });
}

if (typeof window.blogStatusDict !== "undefined" &&
    window.blogStatusDict){
    if (window.blogStatusDict["wordsReady"]) {
    search_init();
}}

window.addEventListener("wordsReady", () => {
    search_init();
});