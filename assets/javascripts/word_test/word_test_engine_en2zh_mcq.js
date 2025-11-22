window.blogStatusDict["testReady"]  = false;

// ============ Base64 工具 ============
function b64(s) {
    return btoa(unescape(encodeURIComponent(s)));
}
function b64d(s) {
    return decodeURIComponent(escape(atob(s)));
}

// ============ 随机工具 ============
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

// ============ 抽题核心状态 ============
window.TestEngine = {
    pool200: [],
    final50: [],
    questions: [],

    currentIndex: 0,
    result: {
        total: 50,
        correct: 0,
        wrong: 0,
        unfinished: 50,
        wrongWords: []   // base64 编码的英文单词列表
    },

    ready: false,

    // 生成试题
    generateQuestions(words) {
        if (!words || words.length < 200) {
            console.error("单词不足 200，无法生成试题");
            return;
        }

        // 1. 打乱并抽 200
        const pool = shuffle([...words]).slice(0, 200);
        this.pool200 = pool;

        // 2. 从 200 中抽 50
        this.final50 = shuffle([...pool]).slice(0, 50);

        // 3. 生成 50 道题目
        this.questions = this.final50.map((item) => {
            // 该题的正确含义
            const correctZh = item.translations[0].translation;

            // 从 pool200 中找 150 个其他单词的 zh
            const other = pool.filter(x => x.word !== item.word);
            const wrongs = shuffle(other).slice(0, 3).map(x => x.translations[0].translation);

            // 混合 4 个选项
            const options = shuffle([correctZh, ...wrongs]);

            // base64 键名
            return {
                word: b64(item.word),
                correct: b64(correctZh),
                options: options.map(o => b64(o))
            };
        });

        this.ready = true;
    },

    // 用户作答
    answer(optionB64) {
        const q = this.questions[this.currentIndex];
        if (!q) return;

        if (optionB64 === q.correct) {
            this.result.correct++;
        } else {
            this.result.wrong++;
            this.result.wrongWords.push(q.word); // base64
        }

        this.result.unfinished =
            this.result.total - this.result.correct - this.result.wrong;

        this.currentIndex++;
    },

    hasNext() {
        return this.currentIndex < this.questions.length;
    },

    getCurrent() {
        return this.questions[this.currentIndex];
    }
};

if (window.blogStatusDict["wordsReady"])
{
    const words = window.words;
    if (words && words.length >= 200) {
        console.log("生成测试题目...");
        TestEngine.generateQuestions(words);

        window.blogStatusDict["testReady"]  = true;

        // 通知 UI：试题准备好了
        const evt = new CustomEvent("testReady");
        window.dispatchEvent(evt);
    }
}

// ============ 事件：收到 wordsReady 后开始生成试题 ============
window.addEventListener("wordsReady", (e) => {
    const words = e.detail.words;
    if (words && words.length >= 200) {
        console.log("生成测试题目...");
        TestEngine.generateQuestions(words);

        window.blogStatusDict["testReady"]  = true;

        // 通知 UI：试题准备好了
        const evt = new CustomEvent("testReady");
        window.dispatchEvent(evt);
    }
});
