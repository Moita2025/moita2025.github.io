# 单词详情

<button onclick="BackToTop('2')" class="BackToTop">返回 “语言”</button>

---

<div class="word-detail-container">
  <!-- 加载中 -->
  <div id="loading" class="loading">
    <md-linear-progress indeterminate></md-linear-progress>
    <p>加载单词中…</p>
  </div>

  <!-- 主要内容 -->
  <div id="content" class="content hidden">

    <h2 class="word-title" id="word"></h2>

    <!-- 音标与发音按钮（电脑端横排，手机端竖排） -->
    <div class="pronounce-bar">
      <!--<span id="uk-phonetic" class="phonetic-item"></span>-->
      <button id="play-uk" class="ui-btn">英</button>
      <!--<span id="us-phonetic" class="phonetic-item"></span>-->
      <button id="play-us" class="ui-btn">美</button>
    </div>

    <!-- 释义 -->
    <section class="section">
      <h3>释义</h3>
      <ul id="translations" class="translations"></ul>
    </section>

    <!-- 常见短语 -->
    <section class="section" id="phrases-section">
      <h3>常见短语</h3>
      <div id="phrases" class="phrases-grid"></div>
    </section>

    <!-- 例句（如果将来数据里有的话可以直接加） -->
    <!-- <section class="section">
      <h2>例句</h2>
      <div id="examples"></div>
    </section> -->

  </div>
</div>

<script src="/assets/javascripts/utils.js"></script>
<script src="/assets/javascripts/init_page/word_detail_page.js"></script>