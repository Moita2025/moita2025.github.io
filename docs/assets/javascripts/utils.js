window.Utils = {
    url: {},
    str: {},
    list: {},
    ui: {},
    vocab: {},
    mkdocsRewrite: {}
};

const $$ = (tag, text = '', className = '') => {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
};

////////url

Utils.url.getSearchParam = function(config = {}){

    const {isInt = false} = config;

    const params = new URLSearchParams(window.location.search);
    const value = params.get(config.paramName);

    if (config.map) 
    {
        if (value && config.map[value]) {
            return isInt ? parseInt(value, 10) : value;
        }
    }
    else if (value) {
        return isInt ? parseInt(value, 10) : value;
    }
    
    return config.defaultParam; // 默认
}

Utils.url.updateSearchParams = function(params = {}, config = {}){
    const {
        clearHash = true,
        usePush = false,
        removeEmpty = true,
    } = config;

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

Utils.url.isLocalHttps = function(){
    const { protocol, hostname } = window.location;

    // 你可以按自己实际情况再扩展判断条件
    const isLocalHost = 
        hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.endsWith('.local');

    return isLocalHost;
}

////////str

Utils.str.escapeHTML = function(str){
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

Utils.str.b64 = function(s){
    return btoa(unescape(encodeURIComponent(s)));
};

Utils.str.b64d = function(s){
    return decodeURIComponent(escape(atob(s)));
};

Utils.str.splitAfterColon = function(strings){
    return strings.map(str => {
        const index = str.indexOf(':');
        return index === -1 ? str : str.substring(index + 1);
    });
}

Utils.str.hasCompleteLiTags = function(str) {
    // 使用正则表达式匹配完整的<li>...</li>标签对
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    const matches = str.match(liRegex);

    // 如果找到匹配项，则返回true
    return matches && matches.length > 0;
}

Utils.str.truncateText = function(str, maxLength = 20){

    var result = "";

    if (str.length > maxLength) {
        result = str.slice(str, maxLength - 3) + '...';  // 截取并添加省略号
    }
    else{result = str;}

    return result;
}

Utils.str.getTransPreffix = function(str, maxLength = 20){
    str = String(str || '').trim();
    str = str.replace(/\[.*?\]/g, '');

    if (str.length <= maxLength) {
        return str;
    }

    for (let i = maxLength; i >= 1; i--) {
        const prefix = str.substring(0, i);
        const lastChar = prefix.charAt(i - 1);
        if (lastChar === '，' || lastChar === '；'){
            return prefix;
        }
    }

    return str.substring(0, 20);
}

////////list

Utils.list.shuffle = function(arr) { return arr.sort(() => Math.random() - 0.5); }

////////ui

Utils.ui.fuseSearchInit = function(config = {}){
    const {
        fuseThreshold = 0.3,
        maxResults = 20,
        dedupeBy = null,
        rewriteToc = false
    } = config;

    // ==== 1. 确保数据存在 ===================================================
    if (!window[config.dataKey] || window[config.dataKey].length === 0) {
        console.log(`${config.dataKey} == []`);
        return;
    }

    // ==== 2. 初始化 Fuse.js ==================================================
    const fuse = new Fuse(window[config.dataKey], {
        keys: config.fuseKeys,
        threshold: fuseThreshold,
    });

    // ==== 3. DOM ============================================================
    const inputEl = document.getElementById(config.inputElId);
    const searchBtn = document.getElementById(config.searchBtnId);
    const clearBtn = document.getElementById(config.clearBtnId);
    const resultList = document.getElementById(config.resultListId);

    function getDedupeValue(item) {
        if (!dedupeBy) {
            // 自动探测常见唯一字段
            return item.id ?? item.topic ?? item.word ?? item.title ?? JSON.stringify(item);
        }
        // 支持点路径，如 'metadata.id'
        return dedupeBy.split('.').reduce((obj, key) => obj?.[key], item) 
               ?? JSON.stringify(item); // 兜底
    }

    // ==== 4. 搜索函数 ========================================================
    function doSearch() {
        const keyword = inputEl.value.trim();
        resultList.innerHTML = "";

        if (!keyword) return;

        const results = fuse.search(keyword);

        const uniqueResults = [];
        const seen = new Set();
        for (const result of results) {
            const value = getDedupeValue(result.item);
            if (!seen.has(value)) {
                seen.add(value);
                uniqueResults.push(result);
            }
        }

        const max = maxResults;
        const realCount = Math.min(uniqueResults.length, max);
        const limited = uniqueResults.slice(0, realCount);

        var isli = false;

        limited.forEach((result, index) => {
            const el = config.renderItem(result.item, index, keyword, result);

            if (Utils.str.hasCompleteLiTags(el)) 
            {if (!isli) isli = true;}

            resultList.innerHTML += el;
        });

        // 超过最大显示条数，追加 “...” （占 1 个 li）
        if (uniqueResults.length > max) {
            const of = isli ? document.createElement("li") : document.createElement("p");
            of.textContent = config.overflowText;
            of.style.opacity = config.overflowOpacity;
            of.style.fontWeight = config.overflowFontWeight;
            resultList.appendChild(of);
        }

        // 更新 URL search params
        window.Utils.url.updateSearchParams({ search: keyword });

        if (rewriteToc) window.Utils.mkdocsRewrite.rewriteToc();
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

Utils.ui.generateSwitchListHTML = function(config){
    const {
        keyToDataMap = null,
        renderItem = null,
        linkText = '切换',
        containerClass = 'grid cards compact-grid-single-row'
    } = config;

    let listHTML = '<ul>';

    Object.keys(config.keyToNameMap).forEach(key => {
        if (key === config.currentKey) return; // 排除当前项

        const name = config.keyToNameMap[key];
        const data = keyToDataMap ? keyToDataMap[key] : null;
        const url  = config.buildUrl(key, data);

        if (typeof renderItem === 'function') {
            // 完全自定义渲染
            listHTML += renderItem({ key, name, url, data });
        } else {
            // 默认简洁渲染
            listHTML += `
              <li>
                <p><strong>${Utils.str.escapeHTML(name)}</strong></p>
                <p><a href="${Utils.str.escapeHTML(url)}">${Utils.str.escapeHTML(linkText)}</a></p>
              </li>
            `;
        }
    });

    listHTML += '</ul>';

    return `
      <h2>${Utils.str.escapeHTML(config.title)}</h2>
      <div class="${Utils.str.escapeHTML(containerClass)}">
        ${listHTML}
      </div>
    `;
}

Utils.ui.bindDlg2Btn = function(btnSelector, dlgContent, waitDOMLoaded = true){

    if (!waitDOMLoaded)
    {
        const btn = document.querySelector(btnSelector);

        if (btn) {
            btn.addEventListener("click", () => {
                showDialog(dlgContent);
            });
        }
    }
    else
    {
        document.addEventListener("DOMContentLoaded", () => {
            const btn = document.querySelector(btnSelector);

            if (btn) {
                btn.addEventListener("click", () => {
                    showDialog(dlgContent);
                });
            }
        });
    }  
}

Utils.ui.pagination = {
    currentPage: 1,
    totalPages: 1,
    onPageChange: null,
    _inited: false,

    // 1. 正确使用 this. 保存到对象自身
    updateTotalPages(totalItems, pageSize) {
        this.totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        }
    },

    setCurrentPage(page) {
        const target = Math.max(1, Math.min(this.totalPages, parseInt(page) || 1));
        if (target !== this.currentPage) {
            this.currentPage = target;
            this.onPageChange?.(this.currentPage);
        }
    },

    // 2. 全部改成普通函数（非箭头），这样可以用 this
    goToPage(page) {
        this.setCurrentPage(page);
        this.updateUrl();
        this.updateUI();
    },

    prev() {
        if (this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    },

    next() {
        if (this.currentPage < this.totalPages) {
            this.goToPage(this.currentPage + 1);
        }
    },

    updateUrl() {
        window.Utils.url.updateSearchParams({
            page: this.currentPage === 1 ? null : this.currentPage
        });
    },

    updateUI() {
        const infoEls = document.querySelectorAll('.page-info');
        const inputEls = document.querySelectorAll('.page-input');

        infoEls.forEach((infoEl) => {
            infoEl.textContent = `第 ${this.currentPage} 页 / 共 ${this.totalPages} 页`;
        });

        inputEls.forEach((inputEl) => {
            inputEl.value = this.currentPage;
        });

        // 控制按钮状态
        document.querySelectorAll('.prev-page').forEach(btn => btn.disabled = this.currentPage <= 1);
        document.querySelectorAll('.next-page').forEach(btn => btn.disabled = this.currentPage >= this.totalPages);
    },

    // 3. init 中所有事件绑定都用 .bind(this) 修正 this 指向
    init(config) {

        if (this._inited) return;
        this._inited = true;

        this.onPageChange = config.onChange;

        // 从 URL 读取初始页码
        const urlPage = window.Utils.url.getSearchParam({ paramName: "page", defaultParam: 1 });
        this.currentPage = parseInt(urlPage) || 1;

        this.updateTotalPages(config.totalItems, config.pageSize);
        this.setCurrentPage(this.currentPage); // 会触发 onChange、更新 URL 和 UI

        const pag = this; // 缓存 this，方便下面 bind 使用

        // 前一页 / 后一页按钮（支持多个）
        document.querySelectorAll('.prev-page').forEach(btn => {
            btn.addEventListener('click', pag.prev.bind(pag));
        });
        document.querySelectorAll('.next-page').forEach(btn => {
            btn.addEventListener('click', pag.next.bind(pag));
        });

        // 跳转输入框 + 按钮（支持多个）
        const inputEls = document.querySelectorAll('.page-input');
        const goPageBtns = document.querySelectorAll('.go-page');

        goPageBtns.forEach((goPageBtn, index) => {
            const inputEl = inputEls[index];
            if (!goPageBtn || !inputEl) return;

            const handleGo = () => {
                const val = inputEl.value.trim();
                if (val) pag.goToPage(val);
            };

            goPageBtn.addEventListener('click', handleGo);
            inputEl.addEventListener('keypress', e => {
                if (e.key === 'Enter') {
                    handleGo();
                }
            });
        });

        this.updateUI();
    }
};

Utils.ui.renderTable = function(data, page, config = {}){
    const {
        pageSize = 20,
        colFactor = 2,           // 每行显示几组“单词+翻译”
        isColArrange = false,    // true=纵向填充，false=横向填充（默认）
        containerId = 'words-table-container',
        renderCell,              // 自定义渲染函数: (item, indexInPage) => `<td>...</td><td>...</td>`
        emptyCell = ''           // 空单元格内容
    } = config;

    const start = (page - 1) * pageSize;
    const end = Math.min(page * pageSize, data.length);
    const pageData = data.slice(start, end);

    const rows = Math.ceil((end - start) / colFactor);
    const colsPerGroup = 2; // 单词 + 翻译
    const totalCols = colFactor * colsPerGroup;

    let html = `<table>`;

    // === thead ===
    html += `<thead><tr>`;
    for (let i = 0; i < colFactor; i++) {
        let headers = "";
        config.headerTitles.forEach(title => {
            headers += `<th>${title}</th>`;
        });
        html += headers;
    }
    html += `</tr></thead>`;

    // === tbody ===
    html += `<tbody>`;
    for (let r = 0; r < rows; r++) {
        html += `<tr>`;
        for (let c = 0; c < colFactor; c++) {
            let indexInPage;
            if (isColArrange) {
                // 纵向填充：先填完一列再填下一列
                indexInPage = r + c * rows;
            } else {
                // 横向填充（默认）
                indexInPage = c + r * colFactor;
            }

            const item = pageData[indexInPage];

            if (item !== undefined) {
                if (typeof renderCell === 'function') {
                   html += renderCell(item, indexInPage);
                } else {
                    let cells = "<td></td>";
                    config.headerTitles.forEach(title => {
                        cells += `<td>缺省单元格</td>`;
                    });
                    html += cells;
                }
            } else {
                html += emptyCell;
            }
        }
         html += `</tr>`;
       }
    html += `</tbody></table>`;

    document.getElementById(containerId).innerHTML = html;
}

Utils.ui.generateDialogue = function(lines, parentElement, isDialogue, chatTitle = "聊天记录") {
    
    lines = Utils.str.splitAfterColon(lines);
    
    if (!isDialogue) {
        lines.forEach(line => {
            const p = document.createElement("p");
            p.textContent = line;
            parentElement.appendChild(p);
        });
        return;
    }

    const chatCard = document.createElement("div");
    chatCard.className = "chat-card";

    const chatHeader = document.createElement("div");
    chatHeader.className = "chat-header";
    const headerTitle = document.createElement("div");
    headerTitle.className = "h2";
    headerTitle.textContent = chatTitle;
    chatHeader.appendChild(headerTitle);

    const chatBody = document.createElement("div");
    chatBody.className = "chat-body";

    chatCard.appendChild(chatHeader);
    chatCard.appendChild(chatBody);
    parentElement.appendChild(chatCard);

    lines.forEach((line, index) => {
        const wrapper = document.createElement("div");
        wrapper.className = index % 2 === 0 ? "message incoming" : "message outgoing";

        const p = document.createElement("p");
        p.textContent = line;

        wrapper.appendChild(p);
        chatBody.appendChild(wrapper);
    });
}

Utils.ui.generateLink = function(text, href, isBlank = false, isUnderlined = false){
    const link = document.createElement("a");
    link.href = href;
    if (isBlank) link.target = "_blank";
    link.textContent = text;
    link.style.color = "var(--md-primary-fg-color)";
    if (isUnderlined) link.style.textDecoration = "underline";

    return link;
}

Utils.ui.renderCorpusEle = function(ele, container, returnStr = false) {

    if (returnStr)
    {
        let result = "";
        
        result += `<h2>主题： ${ele.topic} </h2><ul>`;
        for (const keyword of ele.keywords)
        {
            result += `<li class="tag__name">${keyword}</li>`;
        }
        result += `</ul>`;

        for (const text of ele.text)
        {
            result += `<p>${text}</p>`;
        }

        return result;
    }
    else
    {
        container.appendChild($$('h2', `主题： ${ele.topic} `));

        var keywords = $$("ul");
        for (const keyword of ele.keywords)
        {
            keywords.innerHTML += `<li class="tag__name">${keyword}</li>`;
        }
        container.appendChild(keywords);

        for (const text of ele.text)
        {
            container.appendChild($$("p", text));
        }
    }
}

Utils.ui.createDataTable = function (
    tableId,
    columns,
    data,
    {
        pageLength = 10,
        lengthMenu = [5, 10, 15, 20],
        tableClass = "cell-border compact stripe",
        useURLParam = false,
        rowCallbackFunc = function(row, data, dataIndex){}
    } = {},
    customColumns = null
) {
    // 1. 确保表格存在并清空可能已有的内容
    const $table = $(`#${tableId}`);
    if ($table.length === 0) {
        console.error(`未找到 id 为 "${tableId}" 的 table 元素`);
        return;
    }

    // 如果已经初始化过，先销毁
    if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().destroy();
        $table.empty();
    }

    // 2. 动态生成 thead
    let theadHTML = '<tr>';
    columns.forEach(col => {
        theadHTML += `<th>${col}</th>`;
    });
    theadHTML += '</tr>';
    $table.html('<thead>' + theadHTML + '</thead><tbody></tbody>');

    // 3. 添加类名
    $table.removeClass().addClass(tableClass);

    // 4. 定义 columns 配置（支持对象数组或二维数组）
    const dtColumns = customColumns || columns.map(title => ({ title }));

    // 5. 初始化 DataTable
    const table = $table.DataTable({
        data: data,
        columns: dtColumns,
        rowCallback: rowCallbackFunc,
        paging: true,
        pageLength,
        lengthMenu,
        searching: true,
        info: true,
        ordering: true,
        language: {
            // 可选：中文语言包
            // url: "//cdn.datatables.net/plug-ins/1.13.7/i18n/zh.json"
        }
    });

    // 6. 【可选】URL 参数同步页码
    if (useURLParam) {
        const page = window.Utils.url.getSearchParam({
            paramName: 'page',
            defaultParam: 0
        });
        if (page !== null && !isNaN(page)) {
            const pageIndex = Math.max(0, parseInt(page, 10) - 1); // 防止负数
            if (table.page.info().pages > pageIndex) {        // 防止超出最大页
                table.page(pageIndex).draw('page');
            }
        }

        // 每次分页后更新 URL
        table.on('draw.dt', function () {
            const info = table.page.info();
            const currentPageIndex = info.page;
            var paramResult = (currentPageIndex == 0)?(""):(currentPageIndex + 1);
            window.Utils.url.updateSearchParams({page: paramResult});
        });
    }

    return table; // 返回 DataTable 实例，方便后续操作
};

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

Utils.vocab.speak = function(text, lang = "en-GB") {
    if (! ("speechSynthesis" in window)) {
        alert("当前浏览器不支持语音朗读");
        return;
    }
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang; // en-GB 英式，en-US 美式
    utter.rate = 0.9;
    window.speechSynthesis.speak(utter);
};

Utils.vocab.testEngineCore = {
    questions: [],       // 最终生成的题目数组
    currentIndex: 0,
    result: {
        total: 0,
        correct: 0,
        wrong: 0,
        unfinished: 0,
        wrongItems: []    // 统一存错题原始数据（可自定义结构）
    },
    ready: false,

    init(questions) {
        this.questions = questions;
        this.currentIndex = 0;
        this.result = {
            total: questions.length,
            correct: 0,
            wrong: 0,
            unfinished: questions.length,
            wrongItems: []
        };
        this.ready = true;
    },

    answer(userAnswerB64, correctAnswerB64, currentQuestionItem) {
        if (!this.questions[this.currentIndex]) return false;

        const isCorrect = userAnswerB64 === correctAnswerB64;
        if (isCorrect) {
            this.result.correct++;
        } else {
            this.result.wrong++;
            // 错题记录完全交给调用者决定存什么，这里只存原始题对象（或你自定义的）
            this.result.wrongItems.push(currentQuestionItem || this.questions[this.currentIndex]);
        }

        this.result.unfinished = this.result.total - this.result.correct - this.result.wrong;
        this.currentIndex++;
        return isCorrect;
    },

    hasNext() {
        return this.currentIndex < this.questions.length;
    },

    getCurrent() {
        return this.questions[this.currentIndex];
    },

    getResult() {
        return { ...this.result };
    },

    reset() {
        this.currentIndex = 0;
        this.ready = false;
        this.questions = [];
        this.result = { total: 0, correct: 0, wrong: 0, unfinished: 0, wrongItems: [] };
    }
};

Utils.vocab.QuestionType = {
    EngToZhMultipleChoice: {
        generate(words, count = 50, poolSize = 50 * 4) {
            if (words.length < poolSize) throw new Error("单词数量不足");
            if (poolSize % count != 0) throw new Error(`poolSize ${poolSize} 应当是 count ${count} 的倍数`);

            const pool = window.Utils.list.shuffle([...words]).slice(0, poolSize);
            const selected =  window.Utils.list.shuffle([...pool]).slice(0, count);

            const questions = selected.map(item => {
                const correctZh = item.translations[0].translation;

                const wrongs =  window.Utils.list.shuffle(pool.filter(x => x.word !== item.word))
                    .slice(0, parseInt(poolSize / count) - 1)
                    .map(x => x.translations[0].translation);

                const options =  window.Utils.list.shuffle([correctZh, ...wrongs]);

                return {
                    type: this.name,
                    word: window.Utils.str.b64(item.word),                    // 题目：英文
                    correct: window.Utils.str.b64(correctZh),                  // 正确答案 base64
                    options: options.map(o => window.Utils.str.b64(o)),        // 四个选项都 base64
                    raw: item                                 // 原始单词对象，方便错题分析
                };
            });

            const engineInstance = { ...Utils.vocab.testEngineCore };
            engineInstance.init(questions);
            return engineInstance;
        }
    }
};

Utils.vocab.testUICore = {
    app: null,
    chart: null,
    currentRenderer: null,  // 当前使用的题型渲染器
    testEngineCore: null,

    init(core, containerId = "test-app") {
        this.app = document.getElementById(containerId);
        this.testEngineCore = core;
    },

    setRenderer(renderer) {
        this.currentRenderer = renderer;
    },

    renderQuestion() {
        if (!this.currentRenderer) throw new Error("未设置题型渲染器");
        this.currentRenderer.renderQuestion();
    },

    renderResult() {
        const r = this.testEngineCore.getResult();
        this.app.innerHTML = `
            <div class="result-chart">
                <canvas id="resultChart" width="160" height="160"></canvas>
                <div class="result-text">
                    正确：${r.correct}  
                    错误：${r.wrong}  
                    未完成：${r.unfinished}
                </div>
                <button onclick="location.reload()" class="ui-btn">重新开始</button>
            </div>

            <h3>错误单词：</h3>
            <div class="wrong-list">
                ${this.currentRenderer?.renderWrongWords?.() || ""}
            </div>
        `;
        this.renderChart(r);
    },

    renderChart(r) {
        // 统一的饼图逻辑
        if (this.chart) this.chart.destroy();
        const ctx = document.getElementById('resultChart');
        this.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ["正确", "错误", "未完成"],
                datasets: [{
                    data: [r.correct, r.wrong, r.unfinished],
                    backgroundColor: [
                        '#4caf50',
                        '#f44336',
                        '#ccc'
                    ]
                }]
            },
            options: {
                responsive: false,
                animation: {
                    animateRotate: true,
                    duration: 1200
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    destroy() {
        if (this.chart) this.chart.destroy();
        this.chart = null;
    }
};

Utils.vocab.QuestionRenderer = {

    EngToZhMultipleChoice: {

        testEngineCore: null,
        testUICore: null,

        init(engineCore, uiCore)
        {
            this.testEngineCore = engineCore;
            this.testUICore = uiCore
        },

        renderQuestion() {
            const q = this.testEngineCore.getCurrent();
            if (!q) return this.testUICore.renderResult();

            const word = window.Utils.str.b64d(q.word);
            const options = q.options.map(o => ({
                raw: o,
                text: window.Utils.str.b64d(o)
            }));

            this.testUICore.app.innerHTML = `
                <div class="test-progress">
                    <div class="bar" style="width:${(this.testEngineCore.currentIndex / this.testEngineCore.questions.length) * 100}%"></div>
                </div>
                <div class="test-count">${this.testEngineCore.currentIndex + 1} / 50</div>
                <div class="test-word">${word}</div>
                <div class="test-options">
                    ${options.map((o, i) => `
                        <button class="opt-btn" data-opt="${o.raw}">
                            ${String.fromCharCode(65 + i)}. ${o.text}
                        </button>
                    `).join('')}
                </div>
                <div class="test-end">
                    <button id="end-now" class="ui-btn">提前结束</button>
                </div>
            `;

            document.querySelectorAll(".opt-btn").forEach(btn => {
                btn.onclick = () => {
                    const correct = q.correct;
                    const isCorrect = this.testEngineCore.answer(btn.dataset.opt, correct, q);
                    btn.classList.add(isCorrect ? 'correct' : 'wrong');
                    if (this.testEngineCore.hasNext()) {
                        this.testUICore.renderQuestion();
                    } else {
                        this.testUICore.renderResult();
                    }
                };
            });

            document.getElementById("end-now").onclick = () => this.testUICore.renderResult();
        },

        renderWrongWords() {
            const wrongItems = this.testEngineCore.getResult().wrongItems;
            if (wrongItems.length === 0) return "<p>全部正确！太棒了！</p>";

            return wrongItems.map(q => {
                const word = window.Utils.str.b64d(q.word);
                const item = window.words.find(x => x.word === word);
                const zh = item?.translations[0]?.translation || "未知";
                return `<div class="wrong-item">
                ${window.Utils.vocab.getWordLink(word, window.currentWordKey)}
                - ${zh}</div>`;
            }).join("");
        }
    }
};

Utils.vocab.getWordLink = function(word, collection){
    const linkStr = `
        <a href="/Languages/English_Vocab/WordDetail/?word=${encodeURIComponent(word)}&collection=${encodeURIComponent(collection)}" target="_blank">
            <strong>${word}</strong>
        </a>
    `;

    return linkStr;
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
            (
                config.rewrite_nav_items.includes(span.innerText.trim()) ||
                config.rewrite_nav_items.some(item => span.innerText.trim().includes(item))
            )
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

Utils.mkdocsRewrite.rewriteMainTitle = function (config = {}){

    const {
        selector = ".md-typeset h1",
        append = true,
        brackets = true
    } = config;

    const h1 = document.querySelector(selector);
    if (!h1) return;

    if (!h1.innerText.includes(config.label)) {

        var targetText = "";

        if (brackets) targetText = ` (${config.label})`;
        else targetText = `${config.label}`;

        if (append) h1.innerText += targetText;
        else h1.innerText = targetText;
    }
}

Utils.mkdocsRewrite.rewriteToc = function (config = {}){
    const {
        selector = ".md-nav.md-nav--secondary",
    } = config;

    const container = document.querySelector(selector);
    const article = document.querySelector('.md-typeset');
    if (!container || !article) return;

    // 清空旧 toc（避免重复）
    container.innerHTML = "";

    // 1. 创建 Toc 标题 label
    const label = document.createElement('label');
    label.className = 'md-nav__title';
    label.setAttribute('for', '__toc');
    label.innerHTML = `
        <span class="md-nav__icon md-icon"></span>
        Table of contents
    `;
    container.appendChild(label);

    // 2. 创建 TOC ul
    const ul = document.createElement('ul');
    ul.className = 'md-nav__list';
    ul.dataset.mdComponent = 'toc';
    container.appendChild(ul);

    // 3. 找到所有 h2
    const h2s = article.querySelectorAll('h2');
    const counter = new Map();

    h2s.forEach(h2 => {
        const title = h2.textContent.trim();
        if (!title) return;

        // 生成基础 slug
        const base = title.replace(/\s+/g, '-').replace(/[^\w\-]/g, '').toLowerCase();

        // 计数并决定最终 id
        const idx = (counter.get(title) || 0) + 1;
        counter.set(title, idx);

        const id = idx === 1 ? base : `${base}_${idx}`;
        h2.id = id;

        // TOC 条目
        const li = document.createElement('li');
        li.className = 'md-nav__item';
        li.innerHTML = `
            <a href="#${id}" class="md-nav__link">
                <span class="md-ellipsis">${title}</span>
            </a>`;
        ul.appendChild(li);
    });
}