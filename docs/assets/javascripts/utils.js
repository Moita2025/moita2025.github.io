window.Utils = {
    url: {},
    str: {},
    ui: {}
};

////////url

Utils.url.updateSearchParams = function (params = {}, options = {}) {
    const {
        clearHash = true,
        usePush = false,
        removeEmpty = true,
    } = options;

    const url = new URL(window.location.href);

    // 设置参数
    for (const key in params) {
        const value = params[key];

        if (removeEmpty && (value === null || value === undefined || value === "")) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, String(value));
        }
    }

    // 可选：清除 hash
    if (clearHash) {
        url.hash = "";
    }

    // 无刷新更新地址
    if (usePush) {
        window.history.pushState({}, "", url.toString());
    } else {
        window.history.replaceState({}, "", url.toString());
    }
}

////////str



////////ui

Utils.ui.fuseSearchInit = function (config) {
    // ==== 1. 确保数据存在 ===================================================
    if (window[config.wordsKey] == []) {
        console.log(`${config.wordsKey} == []`);
        return;
    }

    // ==== 2. 初始化 Fuse.js ==================================================
    const fuse = new Fuse(window[config.wordsKey], {
        keys: config.fuseKeys,
        threshold: config.fuseThreshold,
    });

    // ==== 3. DOM ============================================================
    const inputEl = document.getElementById(config.inputElId);
    const searchBtn = document.getElementById(config.searchBtnId);
    const clearBtn = document.getElementById(config.clearBtnId);
    const resultList = document.getElementById(config.resultListId);

    // ==== 4. 搜索函数 ========================================================
    function doSearch() {
        const keyword = inputEl.value.trim();
        resultList.innerHTML = "";

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

        const max = config.maxResults;
        const realCount = Math.min(uniqueResults.length, max);

        for (let i = 0; i < realCount; i++) {
            const item = uniqueResults[i].item;
            const li = document.createElement("li");
            li.innerHTML = config.liInnerHTML(item);
            resultList.appendChild(li);
        }

        // 超过最大显示条数，追加 “...” （占 1 个 li）
        if (uniqueResults.length > max) {
            const li = document.createElement("li");
            li.textContent = config.overflowText;
            li.style.opacity = config.overflowOpacity;
            li.style.fontWeight = config.overflowFontWeight;
            resultList.appendChild(li);
        }

        // 更新 URL search params
        window.Utils.url.updateSearchParams({ search: keyword });
    }

    // ==== 5. URL 自动搜索 ===================================================
    const params = new URLSearchParams(window.location.search);
    const urlKeyword = params.get("search");

    const regex = config.pattern 
        ? new RegExp(config.ppattern) 
        : /^[A-Za-z]+$/;

    if (urlKeyword && regex.test(urlKeyword)) {
        inputEl.value = urlKeyword;
        doSearch(); // 自动搜索
    }

    // ==== 6. 事件 ===========================================================

    // 搜索按钮点击事件
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            doSearch();
        });
    }

    // Enter 键事件
    if (inputEl) {
        inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                doSearch();
            }
        });
    }

    // 清除按钮事件
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            inputEl.value = "";
            resultList.innerHTML = "";
            inputEl.focus();
            Utils.url.updateSearchParams({ search: "" });
        });
    }
}