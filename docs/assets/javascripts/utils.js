window.Utils = {
    url: {},
    str: {},
    ui: {},
    vocab: {},
    mkdocsRewrite: {}
};

////////url

Utils.url.getSearchParam = function(config = {}){

    const params = new URLSearchParams(window.location.search);
    const key = params.get(config.paramName);

    if (config.map) 
    {
        if (key && config.map[key]) return key;
    }
    else
    {
        if (key) return key;
    }
    
    return config.defaultParam; // 默认
}

Utils.url.updateSearchParams = function(params = {}, options = {}){
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

Utils.ui.fuseSearchInit = function(config = {}){
    const {
        fuseThreshold = 0.3,
        maxResults = 20
    } = config;

    // ==== 1. 确保数据存在 ===================================================
    if (window[config.wordsKey] == []) {
        console.log(`${config.wordsKey} == []`);
        return;
    }

    // ==== 2. 初始化 Fuse.js ==================================================
    const fuse = new Fuse(window[config.wordsKey], {
        keys: config.fuseKeys,
        threshold: fuseThreshold,
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

        const max = maxResults;
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

////////vocab

Utils.vocab.WORD_JSON_MAP = {
    "junior": "/assets/data/KyleBing-english-vocabulary/1-初中-顺序.json",
    "senior": "/assets/data/KyleBing-english-vocabulary/2-高中-顺序.json",
    "cet4": "/assets/data/KyleBing-english-vocabulary/3-CET4-顺序.json",
    "cet6": "/assets/data/KyleBing-english-vocabulary/4-CET6-顺序.json",
    "pg": "/assets/data/KyleBing-english-vocabulary/5-考研-顺序.json",
    "toefl": "/assets/data/KyleBing-english-vocabulary/6-托福-顺序.json",
    "sat": "/assets/data/KyleBing-english-vocabulary/7-SAT-顺序.json"
};

Utils.vocab.WORD_NAME_MAP = {
    "junior": "初中词汇",
    "senior": "高中词汇",
    "cet4": "四级词汇",
    "cet6": "六级词汇",
    "pg": "考研词汇",
    "toefl": "托福词汇",
    "sat": "SAT词汇"
};

////////mkdocsRewrite

Utils.mkdocsRewrite.rewriteNav = function (config = {}){

    const {
        selector = ".md-sidebar--primary .md-nav__item a",
        append = true,
        brackets = true
    } = config;

    document.querySelectorAll(selector).forEach(a => {
        const url = new URL(a.href, location.origin);

        const span = a.querySelector("span");

        if (
            span && !span.innerText.includes(config.label) && 
            config.rewrite_nav_items.includes(span.innerText.trim())
        ) 
        {
            url.searchParams.set(config.paramName, config.key);
            a.href = url.toString();

            var targetText = "";

            if (brackets) targetText = ` (${config.label})`;
            else targetText = `${config.label}`;

            if (append) span.innerText += targetText;
            else span.innerText = targetText;
        }
    });
}
