const jsonFile = "/assets/data/en_general_speak_write_samples_20.json";

const search_config = {
    dataKey: 'allCorpus', // window 对象中存放数据的属性名
    fuseKeys: ['topic', 'keywords', 'text'],
    fuseThreshold: 0.6, // Fuse.js threshold 配置

    inputElId: 'keyword-search-input',
    searchBtnId: 'keyword-search-btn',
    clearBtnId: 'keyword-clear-btn',

    pattern: /^[A-Za-z]+$/,
    dedupeBy: 'topic',

    rewriteToc: true,

    resultListId: 'search-result-items',
    maxResults: 6, // 最多显示 20 条
    renderItem: (item) => window.Utils.ui.renderCorpusEle(item,'', true),
    overflowText: '…',
    overflowOpacity: 0.3,
    overflowFontWeight: 'bold'
};

async function initAllCorpus() {

    try {
        const response = await fetch(jsonFile);
        const rawCorpus = await response.json();

        window.allCorpus = rawCorpus.flatMap(item => Array.isArray(item.corpus) ? item.corpus : []);
        window.Utils.ui.fuseSearchInit(search_config);

    } catch (err) {
        console.error(`发生错误：`, err);
    }
}

initAllCorpus();