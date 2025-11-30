const jsonFile = "/assets/data/en_general_speak_write_samples_20.json";

const search_config = {
    wordsKey: 'words', // window 对象中存放数据的属性名
    fuseKeys: ['word', 'translations.translation', 'phrases.phrase', 'phrases.translation'],
    fuseThreshold: 0.3, // Fuse.js threshold 配置

    inputElId: 'keyword-search-input',
    searchBtnId: 'keyword-search-btn',
    clearBtnId: 'keyword-clear-btn',

    pattern: /^[A-Za-z]+$/,

    resultListId: 'search-result-items',
    maxResults: 20, // 最多显示 20 条
    liInnerHTML: (item) => `
        ${window.Utils.vocab.getWordLink(item.word, window.currentWordKey)}
        ：${item.translations[0].translation}`,
    overflowText: '…',
    overflowOpacity: 0.6,
    overflowFontWeight: 'bold'
};

async function initAllCorpus() {

    try {
        const response = await fetch(jsonFile);
        const words = await response.json();

        window.words = words;
        window.Utils.ui.fuseSearchInit(search_config);

    } catch (err) {
        console.error(`发生错误：`, err);
    }
}

initAllCorpus();