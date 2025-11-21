# 词汇表

<button onclick="BackToTop('3')" class="BackToTop">返回 “语言”</button>

---

<style>
  #words-table-container{text-align:center;}
  #words-table-container td{max-width: 150px;word-break: break-all;}
</style>

## 单词表

<div id="letter-buttons-container"></div>

---

<div id="words-table-container" data-json="/assets/data/KyleBing-english-vocabulary/1-初中-顺序.json"></div>

---

<!-- 分页器 -->
<div id="paginator">
  <button id="prev-page" class="ui-btn">上一页</button>
  <button id="next-page" class="ui-btn">下一页</button>

  <input
    id="page-input"
    type="number"
    min="1"
    value="1"
    class="ui-int-input"
  />

  <button id="go-page" class="ui-btn">跳转</button>

  <span id="page-info"></span>
</div>

## 搜索

<div class="search-box">
  <input id="word-search-input" class="ui-txt" type="text" placeholder="搜索单词..." />
  <button id="word-search-btn" class="ui-btn">搜索</button>
  <button id="word-clear-btn" class="ui-btn">清空</button>
</div>

<ul id="search-result-list"></ul>

<script src="/assets/javascripts/common_initWords.js"></script>
<script src="/assets/javascripts/word_list/word_table_pagination.js"></script>
<script src="/assets/javascripts/word_list/word_table_letter_index.js"></script>