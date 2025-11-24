# 示例

<button onclick="BackToTop('2')" class="BackToTop">返回 “托福”</button>

---

<div id="example_reminder">该例子由 <a href="https://grok.com/" target="_blank">Grok</a> 生成。仅供参考</div>

<!-- 分页器 -->
<div id="paginator" class="paginator_duplicate">
  <button id="prev-page" class="ui-btn prev-page_duplicate">上一篇</button>
  <button id="next-page" class="ui-btn next-page_duplicate">下一篇</button>

  <input
    id="page-input"
    type="number"
    min="1"
    value="1"
    class="ui-int-input page-input_duplicate"
  />

  <button id="go-page" class="ui-btn go-page_duplicate">跳转</button>

  <span id="page-info" class="page-info_duplicate"></span>
</div>

<div id="text-container"></div>

---

<!-- 分页器 -->
<div id="paginator" class="paginator_duplicate">
  <button id="prev-page" class="ui-btn prev-page_duplicate">上一篇</button>
  <button id="next-page" class="ui-btn next-page_duplicate">下一篇</button>

  <input
    id="page-input"
    type="number"
    min="1"
    value="1"
    class="ui-int-input page-input_duplicate"
  />

  <button id="go-page" class="ui-btn go-page_duplicate">跳转</button>

  <span id="page-info" class="page-info_duplicate"></span>
</div>

<script>
    const sampleTaskText = {
        "TaskNumber": "114514",
        "Reading": [
            "Deciding a College Major at the Campus Café",
            "Two freshmen, Sarah and Alex, are having coffee between classes. Sarah is struggling to choose between Biology and Environmental Science as her major. Alex tells her about the university’s brand-new environmental research building and an upcoming sea turtle conservation project, which finally helps Sarah make up her mind."
        ],
        "Listening": [
            "Now listen to two students discussing the major choice in the Café",
            "A: Hey Sarah, have you decided on your major yet?",
            "B: Not really... I'm stuck between Biology and Environmental Science.",
            "A: What's making it difficult?",
            "B: I love animals, but I'm also super worried about climate change.",
            "A: Why not do Environmental Science? A lot of it overlaps with ecology and conservation.",
            "B: True, but I heard the Biology department has better lab facilities.",
            "A: The new eco-building just opened this semester — they have a greenhouse and everything!",
            "B: Really? I didn't know that!",
            "A: Yeah, Professor Jenkins said they're even doing sea turtle research projects next year.",
            "B: Okay, you've convinced me. I'm switching to Environmental Science!"
        ],
        "Texts": []
    };
    const sampleSetting = {
        "hasReading": "1",
        "hasListening": "1",
        "hasTexts": "0",
        "readingHasTitle": "1",
        "listeningFirstIsIntro": "1",
        "textsFirstIsIntro": "0",
        "listeningIsDialogue": "1",
        "textsIsDialogue": "0"
    };
</script>

<script src="/assets/javascripts/url_utils.js"></script>
<script src="/assets/javascripts/init_toefl_listen_eg_page.js"></script>