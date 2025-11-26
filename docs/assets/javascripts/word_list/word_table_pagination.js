const PAGE_SIZE = 20;
window.words = [];

initWordsGeneric('wordsReady', function(words) {
    window.words = words;

    const config = {
        containerId: 'words-table-container',
        colFactor: 2,
        headerTitles: ["单词", "中文意思"],
        isColArrange: false, // 或 true 试试纵向排版
        renderCell: (item) => `
            <td>
                <a href="/Languages/English_Vocab/WordDetail/?word=${encodeURIComponent(item.word)}&collection=${encodeURIComponent(window.currentWordKey)}" target="_blank">
                    <strong>${item.word}</strong>
                </a>
            </td>
            <td>${item.translations[0]?.translation || ''}</td>`
    };

    // 初始化分页器
    window.Utils.ui.pagination.init({
        totalItems: words.length,
        pageSize: PAGE_SIZE,
        onChange: (page) => {
            // 每次翻页时渲染表格
            window.Utils.ui.renderTable(words, page, config);
        }
    });

    window.Utils.ui.renderTable(words, 1, config);
});