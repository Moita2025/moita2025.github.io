// ==================== 配置 ====================
const BCZ_DATA_URL = '/assets/data/toefl_data/toefl_bcz_words.json';           // 百词斩生词记录（你自己的）
const TOEFL_DICT_URL = '/assets/data/KyleBing-english-vocabulary/6-托福-顺序.json'; // 托福词库（带翻译）

let bczDaysData = [];     // 原始百词斩数据：[{day:1, words:["abandon","ability",...]}, ...]
let toeflDict = [];       // 托福词库（已加载完的完整数组）

let dictMap = new Map();

// ==================== 初始化词典 Map ====================
function buildDictMap(dictArray) {
    dictMap.clear();
    dictArray.forEach(item => {
        if (item.word) {
            dictMap.set(item.word.toLowerCase(), item.translations?.[0]?.translation || '——');
        }
    });
}

// ==================== 工具函数 ====================
const $ = (tag, text = '', className = '') => {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    if (className) el.className = className;
    return el;
};

// ==================== 渲染核心 ====================
const renderDayTable = (dayObj, container) => {
    const day = dayObj.day;

    // ---- 第 X 天标题 ----
    container.appendChild($('h2', `第 ${day} 天`));

    const tableContainer = document.createElement("div");
    const tableId = `table-day-${day}`;
    tableContainer.id = tableId;

    container.appendChild(tableContainer);

    const wordsWithTrans = dayObj.words.map(word => ({
        word,
        trans: dictMap.get(word.toLowerCase()) || '——'
    }));

    window.Utils.ui.renderTable(wordsWithTrans, 1, {
        pageSize: wordsWithTrans.length,   // 本页就是这一天的全部
        colFactor: 1,                      // 每行显示 2 组
        isColArrange: false,               // 横向填充（更自然）
        containerId: tableId,        // 临时借用，我们会立刻移动 DOM
        headerTitles: ['单词', '中文翻译', '朗读'],

        renderCell: (item) => {
            return `
                <td>${item.word}</td>
                <td class="trans-hidden">${item.trans}</td>
                <td class="speak-cell" data-word="${item.word}">🔊</td>
            `;
        },

        emptyCell: `<td colspan="4"></td>`
    });

    container.lastElementChild?.addEventListener('click', e => {
        const btn = e.target.closest('.speak-cell');
        if (btn) window.Utils.vocab.speak(btn.dataset.word, 'en-US');
    });
};

// 渲染一页（3 天）
const renderPage = (pageIndex, container) => {
    container.innerHTML = '';

    const start = pageIndex * 3;
    const daysToShow = bczDaysData.slice(start, start + 3);

    daysToShow.forEach(dayObj => renderDayTable(dayObj, container));

    // 更新分页器标题（可选）
    window.Utils?.mkdocsRewrite?.rewriteMainTitle({
        label: `第 ${daysToShow[0].day}–${daysToShow[daysToShow.length - 1].day} 天`,
        append: false,
        brackets: false
    });

    window.Utils.mkdocsRewrite.rewriteToc();
};

// ==================== 初始化 ====================
async function initBczPage() {
    const container = document.getElementById('render-area');
    if (!container) return;

    try {
        const [bczResp, dictResp] = await Promise.all([
            fetch(BCZ_DATA_URL),
            fetch(TOEFL_DICT_URL)
        ]);

        if (!bczResp.ok || !dictResp.ok) throw new Error('fetch failed');

        const rawBcz = await bczResp.json();
        toeflDict = await dictResp.json();

        buildDictMap(toeflDict);

        // 把百词斩的结构统一成 [{day:1, words:[...]}, ...]
        // 假设你的 bcz json 是 [[word,word,...],[word,...],...] 即每天一个数组
        bczDaysData = rawBcz.map((words, idx) => ({
            day: idx + 1,
            words: words
        }));

        if (bczDaysData.length === 0) throw new Error('bcz data empty');

        // 初始化分页器（每页 3 天）
        window.Utils.ui.pagination.init({
            totalItems: bczDaysData.length,
            pageSize: 3,
            onChange: (page) => {
                renderPage(page - 1, container);
                scrollTo(0, 0);
            }
        });

        renderPage(0, container);

    } catch (err) {
        console.error('加载数据失败', err);
        container.innerHTML = '<p style="color:red">加载失败，请检查网络或数据文件</p>';
    }
}

document.addEventListener('DOMContentLoaded', initBczPage);