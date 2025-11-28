# 示例

<button onclick="BackToTop('2')" class="BackToTop">返回 “托福”</button>

---

<div id="example_reminder">该例子由 <a href="https://grok.com/" target="_blank">Grok</a> 生成。仅供参考</div>

<!-- 分页器 -->
<div id="paginator">
  <button class="ui-btn prev-page">上一篇</button>
  <button class="ui-btn next-page">下一篇</button>

  <input
    id="page-input"
    type="number"
    min="1"
    value="1"
    class="ui-int-input page-input"
  />

  <button class="ui-btn go-page">跳转</button>

  <span class="page-info"></span>
</div>

<div id="text-container"></div>

---

<!-- 分页器 -->
<div id="paginator">
  <button class="ui-btn prev-page">上一篇</button>
  <button class="ui-btn next-page">下一篇</button>

  <input
    id="page-input"
    type="number"
    min="1"
    value="1"
    class="ui-int-input page-input"
  />

  <button class="ui-btn go-page">跳转</button>

  <span class="page-info"></span>
</div>

<script>
const sampleArticle = {
    "ArticleName": "火星上的液态水证据",
    "Type": "TPO",
    "SerialNumber": "TPO-Practice-01",
    "Paragraphs": [
        "科学家们长期以来一直在寻找火星表面曾经存在液态水的明确证据。2015年，美国国家航空航天局（NASA）宣布了一项重大发现：火星上存在季节性的暗窄条纹（recurring slope lineae，简称RSL），这些条纹在温暖的季节会出现并延长，在较冷的季节则会逐渐消失。这种现象最有可能由含盐的液态水流动造成。",
        "这些季节性条纹通常出现在火星赤道附近的高陡坡上，宽度只有0.5到5米，但长度可达数百米。光谱仪数据显示，这些条纹区域含有水合盐类（perchlorates），这种盐能大幅降低水的冰点，使水在火星低温低压的环境中仍能保持液态。研究人员认为，RSL很可能是在火星浅层地下渗出的少量盐水沿坡面流动形成的。",
        "尽管这一发现极大地提升了火星过去或现在存在生命的可能性，但科学家也指出，目前还不能100%确定这些条纹就是液态水流动造成的。其他可能的解释包括干沙流动或季节性二氧化碳霜的升华。然而，大多数研究者认为，含水合盐的液态水是最合理的解释。这一发现促使NASA重新评估火星探测任务中的行星保护政策，以避免地球微生物污染潜在的火星水体。"
    ],
    "Questions": [
        {
            "Paragraph": 1,
            "QuestionText": "The word \"explicit\" in the passage is closest in meaning to",
            "Choices": [
                "clear and direct",
                "temporary",
                "possible",
                "ancient"
            ],
            "CorrectChoices": ["clear and direct"],
            "Analysis": ["explicit 表示‘明确的、不含糊的’，与 clear and direct 意思最接近。"]
        },
        {
            "Paragraph": 2,
            "QuestionText": "The word \"these\" in paragraph 2 refers to",
            "Choices": [
                "steep slopes",
                "seasonal streaks",
                "spectrometers",
                "perchlorates"
            ],
            "CorrectChoices": ["seasonal streaks"],
            "Analysis": ["these 指代前一句中出现的 seasonal streaks（季节性条纹），后文紧接着描述这些条纹的宽度和长度。"]
        },
        {
          "Paragraph": 2,
            "QuestionText": "Which of the following best expresses the essential information in the highlighted sentence? \"这种盐能大幅降低水的冰点，使水在火星低温低压的环境中仍能保持液态。\"",
            "Choices": [
                "This salt can significantly lower the freezing point of water, allowing it to remain liquid even in Mars' cold, low-pressure environment.",
                "This salt can raise the temperature on Mars so that water does not freeze.",
                "This salt prevents water from evaporating quickly under Mars' low pressure.",
                "This salt is the main reason why Mars has a cold and dry climate."
            ],
            "CorrectChoices": ["This salt can significantly lower the freezing point of water, allowing it to remain liquid even in Mars' cold, low-pressure environment."],
            "Analysis": ["句子简化题需保留原句核心信息：盐类降低冰点 → 在低温低压下仍保持液态。第一选项完全忠实原文。"]
        },
        {
            "Paragraph": 3,
            "QuestionText": "According to paragraph 3, what has the discovery of RSL caused NASA to do?",
            "Choices": [
                "Cancel all future Mars missions",
                "Reassess planetary protection policies",
                "Confirm that life exists on Mars",
                "Stop studying perchlorates"
            ],
            "CorrectChoices": ["Reassess planetary protection policies"],
            "Analysis": ["细节题。原文倒数第二句明确提到：This discovery has prompted NASA to reassess planetary protection policies..."]
        },
        {
            "Paragraph": 3,
            "QuestionText": "What can be inferred from paragraph 3 about the possibility of life on Mars?",
            "Choices": [
                "It has been completely ruled out.",
                "The discovery of RSL has greatly increased the estimated possibility.",
                "Scientists are certain that microbial life exists in RSL.",
                "The possibility remains exactly the same as before the discovery."
            ],
            "CorrectChoices": ["The discovery of RSL has greatly increased the estimated possibility."],
            "Analysis": ["推断题。原文提到‘这一发现极大地提升了火星过去或现在存在生命的可能性’，直接支持第二选项。其他选项要么过于绝对，要么与原文矛盾。"]
        }
    ]
};
</script>
<script src="/assets/javascripts/utils.js"></script>
<script src="/assets/javascripts/init_toefl_reading_eg_page.js"></script>