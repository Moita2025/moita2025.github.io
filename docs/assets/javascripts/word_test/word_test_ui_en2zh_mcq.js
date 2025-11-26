window.TestUI = {
    core: window.Utils.vocab.testUICore,
    start(type = "EngToZhMultipleChoice") {

        // 2. 设置对应渲染器
        this.core.setRenderer(window.Utils.vocab.QuestionRenderer[type]);

        // 3. 开始渲染
        this.core.init();
        this.core.renderQuestion();
    }
};

// 如果 testReady 已经提前触发 → 立即初始化
if (window.blogStatusDict["testReady"]) {
    TestUI.start("EngToZhMultipleChoice");
}

// 否则监听事件
window.addEventListener("testReady", () => {
    TestUI.start("EngToZhMultipleChoice");
});