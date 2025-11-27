let currentEngineInstance = null;

function startTest(words, type = "EngToZhMultipleChoice") {
    currentEngineInstance = window.Utils.vocab.QuestionType[type].generate(words, 50, 200);
    console.log("试题生成成功，共 50 题", currentEngineInstance);

    // 直接传这个有数据的实例
    TestUI.start(currentEngineInstance, type);
}

window.TestUI = {
    core: window.Utils.vocab.testUICore,

    start(engineInstance, type = "EngToZhMultipleChoice") {
        if (!engineInstance?.ready) {
            console.error("引擎实例无效");
            return;
        }

        const renderer = window.Utils.vocab.QuestionRenderer[type];
        renderer.init?.(engineInstance, this.core);                    // Renderer 也 init
        this.core.setRenderer(renderer);
        this.core.init(engineInstance);

        this.core.renderQuestion();
    }
};

// 立即执行 + 事件监听统一调用
if (window.blogStatusDict["wordsReady"] && window.words?.length >= 200) {
    startTest(window.words);
}

window.addEventListener("wordsReady", e => {
    if (e.detail.words?.length >= 200) {
        startTest(e.detail.words);
    }
});