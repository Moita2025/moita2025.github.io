function search_init()
{
    const search_config = {
        wordsKey: 'words', // window 对象中存放数据的属性名
        fuseKeys: ['word', 'translations.translation', 'phrases.phrase', 'phrases.translation'],
        fuseThreshold: 0.3, // Fuse.js threshold 配置

        inputElId: 'word-search-input',
        searchBtnId: 'word-search-btn',
        clearBtnId: 'word-clear-btn',

        pattern: /^[A-Za-z]+$/,

        resultListId: 'search-result-list',
        maxResults: 20, // 最多显示 20 条
        liInnerHTML: (item) => `
            <a href="/Languages/English_Vocab/WordDetail/?word=${item.word}&collection=${window.currentWordKey}" target="_blank">
                <strong>${item.word}</strong>
            </a>：${item.translations[0].translation}`,
        
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