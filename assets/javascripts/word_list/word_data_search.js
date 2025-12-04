function search_init()
{
    const search_config = {
        dataKey: 'words', // window 对象中存放数据的属性名
        fuseKeys: ['word', 'translations.translation', 'phrases.phrase', 'phrases.translation'],
        fuseThreshold: 0.3, // Fuse.js threshold 配置

        inputElId: 'word-search-input',
        searchBtnId: 'word-search-btn',
        clearBtnId: 'word-clear-btn',

        pattern: /^[A-Za-z]+$/,
        dedupeBy: 'word',

        resultListId: 'search-result-list',
        maxResults: 20, // 最多显示 20 条
        renderItem: (item) => `<li>
            ${window.Utils.vocab.getWordLink(item.word, window.currentWordKey)}
            ：${item.translations[0].translation}</li>`,
        overflowText: '…',
        overflowOpacity: 0.6,
        overflowFontWeight: 'bold'
    };

    window.Utils.ui.fuseSearchInit(search_config);
}

if (typeof window.blogStatusDict !== "undefined" &&
    window.blogStatusDict){
    if (window.blogStatusDict["wordsReady"]) {
    search_init();
}}

window.addEventListener("wordsReady", () => {
    search_init();
});