# 阅读文章 单词

<button onclick="BackToTop('2')" class="BackToTop">返回 “托福”</button>

---

<div class="toefl-vocab-header"></div>

<div id="paginator">
    <button class="ui-btn prev-page">上一页</button>
    <button class="ui-btn next-page">下一页</button>
    <input
        id="page-input" type="number"
        min="1" value="1"
        class="ui-int-input page-input"
    />
    <button class="ui-btn go-page">跳转</button>
</div>

=== "托福词汇"

    <div class="words-table-container" id="table-toefl"></div>

=== "六级词汇"

    <div class="words-table-container" id="table-cet6"></div>

=== "四级词汇"

    <div class="words-table-container" id="table-cet4"></div>

=== "高中词汇"

    <div class="words-table-container" id="table-senior"></div>

=== "初中词汇"

    <div class="words-table-container" id="table-junior"></div>

<div id="failInfo"></div>

<script src="/assets/javascripts/utils.js"></script>
<script src="/assets/javascripts/init_page/toefl_reading_vocab_page.js"></script>