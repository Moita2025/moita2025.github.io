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

// ==================== 渲染核心 ====================
const renderDayTable = (dayObj, container) => {
    const day = dayObj.day;

    // ---- 第 X 天标题 ----
    container.appendChild($$('h2', `第 ${day} 天`));

    const tableContainer = document.createElement("table");
    const tableId = `table-day-${day}`;
    tableContainer.id = tableId;

    container.appendChild(tableContainer);

    const wordsWithTrans = dayObj.words.map(word => ([
        word,
        dictMap.get(word.toLowerCase()) || '——',
        "🔊"
    ]));

    const table = window.Utils.ui.createDataTable(
        tableId,                 // tableId
        ['单词', '中文', '发音'],                // columns
        wordsWithTrans,                       // data
        {
            pageLength: 10,
            rowCallbackFunc: function(row, data, dataIndex) {
                $('td:eq(1)', row).addClass('trans-hidden'); 
                $('td:eq(2)', row).addClass('speak-cell');
                var word = $('td:eq(0)', row).text().trim();
                $('td:eq(2)', row).on('click', function() {
                    if (word) {
                        window.Utils.vocab.speak(word, 'en-US'); // 朗读单词
                    }
                });
            }
        }
    );
};

// 渲染一页（3 天）
const renderPage = (pageIndex, container) => {
    container.innerHTML = '';

    const start = pageIndex * 3;
    const end = Math.min(start + 3, bczDaysData.length);
    const daysToShow = bczDaysData.slice(start, end);

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

        const pageParam = window.Utils.url.getSearchParam({ 
            paramName: "page",
            isInt: true,
            defaultParam: 1
        });

        renderPage(pageParam - 1, container);

    } catch (err) {
        console.error('加载数据失败', err);
        container.innerHTML = '<p style="color:red">加载失败，请检查网络或数据文件</p>';
    }
}

document.addEventListener('DOMContentLoaded', initBczPage);