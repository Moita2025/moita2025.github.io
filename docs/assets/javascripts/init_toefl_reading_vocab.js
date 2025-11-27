// init_toefl_reading_vocab.js
document.addEventListener("DOMContentLoaded", async () => {
    // 1. 核心映射表（最清晰、最易维护）
    const TAB_TEXT_TO_COLLECTION = {
        "托福词汇": "toefl",
        "六级词汇": "cet6",
        "四级词汇": "cet4",
        "高中词汇": "senior",
        "初中词汇": "junior"
    };

    const COLLECTION_TO_JSON_KEY = {
        toefl:  "TOEFL",
        cet6:   "CET6",
        cet4:   "CET4",
        senior: "Senior",
        junior: "Junior"
    };

    const TABLE_IDS = {
        toefl:  "table-toefl",
        cet6:   "table-cet6",
        cet4:   "table-cet4",
        senior: "table-senior",
        junior: "table-junior"
    };

    const article_title = "toefl-vocab-header";

    let currentCollection = 'toefl';

    // 3. 获取文章标题
    const articleParam = window.Utils.url.getSearchParam({
        paramName: "article",
        defaultParam: "timberline_vegetation_on_mountains"
    });

    let articleTitle = articleParam;
    try {
        const idx = await fetch('/assets/data/toefl_data/toefl_reading_articles_index.json').then(r => r.json());
        const match = idx.find(i => i.ParamName === articleParam);
        if (match) articleTitle = match.Article || match.KeyName;
    } catch (e) {
        console.warn("索引加载失败", e);
    }

    // 4. 加载所有生词数据
    let allWords = {};
    try {
        const res = await fetch('/assets/data/toefl_data/toefl_reading_articles_words.json');
        const data = await res.json();
        const articleData = data.find(d => d.Article === articleTitle);
        if (!articleData) throw new Error("文章未找到");

        for (const [collection, jsonKey] of Object.entries(COLLECTION_TO_JSON_KEY)) {
            allWords[collection] = (articleData.Words[jsonKey] || []).map(w => ({ word: w }));
        }
    } catch (err) {
        document.getElementById("failInfo").innerHTML = `
            <div style="text-align:center;padding:4rem;color:#999">
                <h3>加载失败</h3><p>${err.message}</p>
            </div>`;
        return;
    }

    // 5. 设置主标题
    const niceTitle = articleTitle.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    document.querySelector(`.${article_title}`).innerHTML = `<h2>${niceTitle}</h2>`;

    // 6. 核心渲染函数
    const renderCurrent = (page = 1) => {
        const words = allWords[currentCollection] || [];
        const displayName = window.Utils.vocab.WORD_NAME_MAP[currentCollection] || currentCollection.toUpperCase();

        // 更新副标题
        const subHeader = document.querySelector(`.${article_title} h2:nth-child(2)`);
        if (subHeader) subHeader.remove();
        document.querySelector(`.${article_title}`).insertAdjacentHTML("beforeend",
            `<h2>${displayName}（第 ${page}/${window.Utils.ui.pagination.totalPages} 页，共 ${words.length} 词）</h2>`);

        window.Utils.ui.renderTable(words, page, {
            containerId: TABLE_IDS[currentCollection],
            pageSize: 36,
            colFactor: 3,
            headerTitles: ["单词"],
            emptyCell: '<td></td>',
            renderCell: item => `<td>${window.Utils.vocab.getWordLink(item.word.toLowerCase(), currentCollection)}</td>`
        });
    };

    // 7. 初始化分页器（只一次！）
    window.Utils.ui.pagination.init({
        totalItems: allWords[currentCollection].length,
        pageSize: 36,
        onChange: renderCurrent
    });

    // 8. 精准监听 Tab 点击（Material for MkDocs 标准结构）
    document.addEventListener("click", e => {
        const tabLink = e.target.closest('.tabbed-set .tabbed-labels label');

        if (!tabLink) return;

        const tabText = tabLink.querySelector('a').textContent.trim();
        const newCollection = TAB_TEXT_TO_COLLECTION[tabText];
        if (!newCollection || newCollection === currentCollection) return;

        // 切换词库
        currentCollection = newCollection;

        // 更新 URL
        window.Utils.url.updateSearchParams({
            collection: currentCollection === "toefl" ? null : currentCollection,
            page: null
        });

        // 更新分页器 + 渲染
        window.Utils.ui.pagination.updateTotalPages(allWords[currentCollection].length, 36);
        window.Utils.ui.pagination.currentPage = 1;
        window.Utils.ui.pagination.updateUI();
        renderCurrent(1);

        console.log('here');
    });

    // 9. 首次渲染 + 支持 URL 直接打开指定词库
    const urlCollection = window.Utils.url.getSearchParam({ paramName: "collection" });
    if (urlCollection && TAB_TEXT_TO_COLLECTION[Object.keys(TAB_TEXT_TO_COLLECTION).find(k => 
        TAB_TEXT_TO_COLLECTION[k] === urlCollection)]) {
        currentCollection = urlCollection;
    }

    // 确保分页器和渲染正确
    window.Utils.ui.pagination.updateTotalPages(allWords[currentCollection].length, 36);
    renderCurrent(1);

    // 自动选中 URL 对应的 tab（Material for MkDocs 会自动处理，但保险）
    const targetLabelText = Object.keys(TAB_TEXT_TO_COLLECTION).find(
        key => TAB_TEXT_TO_COLLECTION[key] === currentCollection
    );
    if (targetLabelText) {
        const link = Array.from(document.querySelectorAll('.tabbed-set label a'))
            .find(a => a.textContent.trim() === targetLabelText);
        if (link) link.click();
    }
});