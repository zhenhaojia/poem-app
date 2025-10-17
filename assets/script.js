(function () {
  const state = {
    poems: [],
    filtered: [],
    indexMap: [], // current list indices for pager
    currentIndex: null, // index within filtered
    filters: {
      search: "",
      dynasty: "",
      theme: "",
      withNotes: false
    }
  };

  const els = {
    searchInput: document.getElementById("searchInput"),
    clearSearch: document.getElementById("clearSearch"),
    dynastyFilter: document.getElementById("dynastyFilter"),
    themeFilter: document.getElementById("themeFilter"),
    withNotes: document.getElementById("withNotes"),
    randomPoem: document.getElementById("randomPoem"),
    gridViewBtn: document.getElementById("gridViewBtn"),
    listViewBtn: document.getElementById("listViewBtn"),
    poemList: document.getElementById("poemList"),
    emptyState: document.getElementById("emptyState"),
    listView: document.getElementById("listView"),
    detailView: document.getElementById("detailView"),
    poemDetail: document.getElementById("poemDetail"),
    backBtn: document.getElementById("backBtn"),
    shareBtn: document.getElementById("shareBtn"),
    favoriteBtn: document.getElementById("favoriteBtn"),
    themeToggle: document.getElementById("themeToggle"),
    pager: document.getElementById("pager"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    currentIndex: document.getElementById("currentIndex"),
    totalCount: document.getElementById("totalCount"),
    aboutLink: document.getElementById("aboutLink"),
    aboutSection: document.getElementById("about"),
    backFromAbout: document.getElementById("backFromAbout"),
  };

  // 初始化设置
  const savedTheme = localStorage.getItem("theme");
  const savedViewMode = localStorage.getItem("viewMode") || "grid";
  if (savedTheme === "dark") document.documentElement.classList.add("dark");
  
  // 设置初始视图模式
  setViewMode(savedViewMode);

  // 事件监听器
  els.themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });

  els.gridViewBtn.addEventListener("click", () => setViewMode("grid"));
  els.listViewBtn.addEventListener("click", () => setViewMode("list"));
  
  els.randomPoem.addEventListener("click", showRandomPoem);
  els.shareBtn.addEventListener("click", sharePoem);
  els.favoriteBtn.addEventListener("click", toggleFavorite);
  
  els.aboutLink.addEventListener("click", (e) => {
    e.preventDefault();
    showAboutPage();
  });
  
  els.backFromAbout.addEventListener("click", () => {
    hideAboutPage();
  });

  // Load data
  fetch("data/poems.json")
    .then(r => r.json())
    .then(json => {
      state.poems = json;
      initFilters(json);
      applyFilters();
      // Simple hash routing: #id=xxx
      handleHash();
      window.addEventListener("hashchange", handleHash);
    })
    .catch(err => {
      console.error("加载数据失败：", err);
      els.emptyState.hidden = false;
      els.emptyState.innerHTML = "<p>数据加载失败。</p><p class='hint'>请检查 data/poems.json 是否存在。</p>";
    });

  function initFilters(poems) {
    const dynasties = Array.from(new Set(poems.map(p => p.dynasty).filter(Boolean))).sort();
    const themes = Array.from(new Set(poems.flatMap(p => (p.tags || [])).filter(Boolean))).sort();

    dynasties.forEach(d => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      els.dynastyFilter.appendChild(opt);
    });
    themes.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      els.themeFilter.appendChild(opt);
    });

    els.searchInput.addEventListener("input", (e) => {
      state.filters.search = e.target.value.trim();
      applyFilters();
    });
    els.clearSearch.addEventListener("click", () => {
      els.searchInput.value = "";
      state.filters.search = "";
      applyFilters();
    });
    els.dynastyFilter.addEventListener("change", (e) => {
      state.filters.dynasty = e.target.value;
      applyFilters();
    });
    els.themeFilter.addEventListener("change", (e) => {
      state.filters.theme = e.target.value;
      applyFilters();
    });
    els.withNotes.addEventListener("change", (e) => {
      state.filters.withNotes = e.target.checked;
      applyFilters();
    });

    els.backBtn.addEventListener("click", () => {
      location.hash = "";
      showList();
    });

    els.prevBtn.addEventListener("click", () => {
      if (state.currentIndex == null) return;
      const idx = Math.max(0, state.currentIndex - 1);
      showDetailByIndex(idx);
    });
    els.nextBtn.addEventListener("click", () => {
      if (state.currentIndex == null) return;
      const idx = Math.min(state.filtered.length - 1, state.currentIndex + 1);
      showDetailByIndex(idx);
    });
  }

  function applyFilters() {
    const { search, dynasty, theme, withNotes } = state.filters;
    const s = search.toLowerCase();

    state.filtered = state.poems.filter(p => {
      const text = [p.title, p.author, p.content, ...(p.tags || [])].join(" ").toLowerCase();
      const okSearch = s ? text.includes(s) : true;
      const okDynasty = dynasty ? p.dynasty === dynasty : true;
      const okTheme = theme ? (p.tags || []).includes(theme) : true;
      const okNotes = withNotes ? Boolean(p.notes && p.notes.length) : true;
      return okSearch && okDynasty && okTheme && okNotes;
    });

    state.indexMap = state.filtered.map(fp => state.poems.findIndex(p => p.id === fp.id));
    renderList();
  }

  function renderList() {
    els.poemList.innerHTML = "";
    if (!state.filtered.length) {
      els.emptyState.hidden = false;
      return;
    }
    els.emptyState.hidden = true;

    const frag = document.createDocumentFragment();
    state.filtered.forEach((p, i) => {
      const li = document.createElement("li");
      li.className = "card";
      li.innerHTML = `
        <div class="meta"><span>${p.dynasty || "佚朝"}</span> · <span>${p.author || "佚名"}</span></div>
        <h3>${p.title}</h3>
        <p class="excerpt">${(p.content || "").replace(/\n/g, " / ")}</p>
      `;
      li.addEventListener("click", () => {
        location.hash = "id=" + encodeURIComponent(p.id);
        showDetail(p);
        state.currentIndex = i;
      });
      frag.appendChild(li);
    });
    els.poemList.appendChild(frag);

    // If a hash is present but list changed, ensure detail can be synced
    const h = parseHash();
    if (h.id) {
      const idx = state.filtered.findIndex(p => p.id === h.id);
      if (idx >= 0) {
        state.currentIndex = idx;
        showDetail(state.filtered[idx]);
      } else {
        showList();
      }
    } else {
      showList();
    }
  }

  function showList() {
    els.listView.hidden = false;
    els.detailView.hidden = true;
  }

  function showDetail(poem) {
    els.listView.hidden = true;
    els.detailView.hidden = false;

    els.poemDetail.innerHTML = `
      <div class="title">
        <h2>${poem.title}</h2>
        <span class="author">（${poem.dynasty || "佚朝"} · ${poem.author || "佚名"}）</span>
      </div>
      <div class="tags">
        ${(poem.tags || []).map(t => `<span class="tag">${t}</span>`).join("")}
      </div>
      <div class="content">${(poem.content || "").replace(/\n/g, "<br/>")}</div>
      ${renderSection("注释", poem.notes)}
      ${renderSection("译文", poem.translation)}
      ${renderSection("赏析", poem.analysis)}
      ${renderSection("创作背景", poem.background)}
    `;

    const total = state.filtered.length;
    if (total > 1) {
      els.pager.hidden = false;
      const idx = state.filtered.findIndex(p => p.id === poem.id);
      state.currentIndex = idx;
      els.prevBtn.disabled = idx <= 0;
      els.nextBtn.disabled = idx >= total - 1;
    } else {
      els.pager.hidden = true;
    }
  }

  function renderSection(title, content) {
    if (!content) return "";
    const text = Array.isArray(content) ? content.join("\n") : String(content);
    return `
      <section class="section">
        <h4>${title}</h4>
        <div class="text">${text.replace(/\n/g, "<br/>")}</div>
      </section>
    `;
  }

  function parseHash() {
    const hash = location.hash.replace(/^#/, "");
    const params = new URLSearchParams(hash);
    // allow simple id=xxx (not true querystring but URLSearchParams handles it)
    const id = params.get("id") || (hash.startsWith("id=") ? decodeURIComponent(hash.slice(3)) : "");
    return { id };
  }

  function handleHash() {
    const { id } = parseHash();
    if (!id) { showList(); return; }
    const idx = state.filtered.findIndex(p => p.id === id);
    if (idx >= 0) {
      showDetail(state.filtered[idx]);
      state.currentIndex = idx;
    } else {
      // try from full dataset (in case filters exclude current)
      const p = state.poems.find(x => x.id === id);
      if (p) showDetail(p);
    }
  }

  function showDetailByIndex(idx) {
    const p = state.filtered[idx];
    if (!p) return;
    location.hash = "id=" + encodeURIComponent(p.id);
    showDetail(p);
    state.currentIndex = idx;
  }

  // 视图模式设置
  function setViewMode(mode) {
    localStorage.setItem("viewMode", mode);
    els.poemList.classList.toggle("list-view", mode === "list");
    els.poemList.classList.toggle("grid-view", mode === "grid");
    els.gridViewBtn.classList.toggle("active", mode === "grid");
    els.listViewBtn.classList.toggle("active", mode === "list");
    renderList();
  }

  // 随机诗词功能
  function showRandomPoem() {
    if (state.filtered.length === 0) return;
    const randomIndex = Math.floor(Math.random() * state.filtered.length);
    showDetailByIndex(randomIndex);
  }

  // 分享功能
  function sharePoem() {
    if (state.currentIndex === null) return;
    const poem = state.filtered[state.currentIndex];
    const shareText = `《${poem.title}》 - ${poem.author} (${poem.dynasty})

${poem.content}`;
    
    if (navigator.share) {
      navigator.share({
        title: poem.title,
        text: shareText,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert("诗词内容已复制到剪贴板！");
      });
    }
  }

  // 收藏功能
  function toggleFavorite() {
    if (state.currentIndex === null) return;
    const poem = state.filtered[state.currentIndex];
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const index = favorites.findIndex(f => f.id === poem.id);
    
    if (index === -1) {
      favorites.push(poem);
      els.favoriteBtn.textContent = "已收藏";
      els.favoriteBtn.classList.add("active");
    } else {
      favorites.splice(index, 1);
      els.favoriteBtn.textContent = "收藏";
      els.favoriteBtn.classList.remove("active");
    }
    
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  // 关于页面功能
  function showAboutPage() {
    els.listView.hidden = true;
    els.detailView.hidden = true;
    els.aboutSection.hidden = false;
  }

  function hideAboutPage() {
    els.aboutSection.hidden = true;
    showList();
  }

  // AI聊天助手功能
  initAIChat();
})();

function initAIChat() {
  const chatToggle = document.getElementById('chatToggle');
  const chatClose = document.getElementById('chatClose');
  const chatWindow = document.querySelector('.chat-window');
  const chatMessages = document.querySelector('.chat-messages');
  const chatInput = document.querySelector('.chat-input input');
  const chatSend = document.querySelector('.chat-input button');
  let isChatOpen = false;
  
  // Supabase配置
  const SUPABASE_CONFIG = {
    aiChatFunction: 'https://pbrlkenmlyefcuyxpovi.supabase.co/functions/v1/ai-chat'
  };

  chatToggle.addEventListener('click', () => {
    isChatOpen = !isChatOpen;
    chatWindow.hidden = !isChatOpen;
    if (isChatOpen) {
      chatInput.focus();
      addWelcomeMessage();
    }
  });

  chatClose.addEventListener('click', () => {
    isChatOpen = false;
    chatWindow.hidden = true;
  });

  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  function addWelcomeMessage() {
    if (chatMessages.children.length === 0) {
      addMessage('assistant', '您好！我是AI诗词助手，可以帮您：
• 解析诗词含义
• 查询作者背景
• 了解创作背景
• 提供诗词赏析

请问有什么可以帮助您的吗？');
    }
  }

  async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage('user', message);
    chatInput.value = '';

    // 显示输入中状态
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'message assistant typing';
    typingIndicator.innerHTML = `
      <div class="typing-indicator">
        <span>AI正在思考</span>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
      // 调用Supabase Edge Function获取AI回复
      const response = await fetchAIResponse(message);
      chatMessages.removeChild(typingIndicator);
      addMessage('assistant', response);
    } catch (error) {
      console.error('AI请求失败:', error);
      chatMessages.removeChild(typingIndicator);
      // 如果API调用失败，使用本地回复
      const fallbackResponse = generateAIResponse(message);
      addMessage('assistant', fallbackResponse);
    }
  }

  async function fetchAIResponse(message) {
    try {
      const response = await fetch(SUPABASE_CONFIG.aiChatFunction, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          currentPoem: getCurrentPoemContext()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || '抱歉，我暂时无法回答这个问题。';
    } catch (error) {
      console.error('调用AI服务失败:', error);
      throw error;
    }
  }

  function getCurrentPoemContext() {
    // 获取当前浏览的诗词信息，为AI提供上下文
    const currentPoem = state.poems.find(p => p.id === parseHash().id);
    return currentPoem ? {
      title: currentPoem.title,
      author: currentPoem.author,
      dynasty: currentPoem.dynasty
    } : null;
  }

  function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function generateAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // 简单的关键词匹配回复
    if (lowerMessage.includes('你好') || lowerMessage.includes('您好')) {
      return '您好！很高兴为您提供诗词相关的帮助。';
    }
    
    if (lowerMessage.includes('帮助') || lowerMessage.includes('功能')) {
      return '我可以帮您：
1. 解析诗词内容和意境
2. 介绍作者生平和创作背景
3. 提供诗词翻译和注释
4. 推荐相关诗词作品
5. 解答诗词相关的疑问';
    }
    
    if (lowerMessage.includes('春晓') || lowerMessage.includes('孟浩然')) {
      return '《春晓》是唐代诗人孟浩然的代表作之一。

这首诗通过"春眠不觉晓"的日常场景，描绘了春天的美好。诗中"处处闻啼鸟"展现生机，"夜来风雨声"暗示变化，"花落知多少"则带有淡淡的惋惜，体现了诗人对自然变化的细腻感受。';
    }
    
    if (lowerMessage.includes('登鹳雀楼') || lowerMessage.includes('王之涣')) {
      return '《登鹳雀楼》是唐代诗人王之涣的千古名篇。

前两句"白日依山尽，黄河入海流"描绘壮阔的自然景观，后两句"欲穷千里目，更上一层楼"由景入情，表达了不断进取的精神追求，成为激励后人的经典名句。';
    }
    
    if (lowerMessage.includes('推荐') || lowerMessage.includes('建议')) {
      return '根据您的兴趣，我推荐：
• 喜欢山水田园：陶渊明《饮酒》、王维《山居秋暝》
• 喜欢豪放风格：李白《将进酒》、苏轼《念奴娇》
• 喜欢婉约抒情：李清照《声声慢》、李商隐《无题》
• 喜欢边塞诗：王昌龄《出塞》、岑参《白雪歌》';
    }
    
    if (lowerMessage.includes('谢谢') || lowerMessage.includes('感谢')) {
      return '不客气！如果您还有其他关于诗词的问题，随时可以问我。';
    }
    
    // 默认回复
    return `关于"${message}"，这是一个很好的问题！

虽然我目前的知识库有限，但建议您：
1. 查看本站的诗词详情页面获取详细信息
2. 搜索具体的诗词标题或作者名
3. 关注诗词的创作背景和时代特征

如果您有具体的诗词作品想要了解，请告诉我诗名或作者，我会尽力为您解答。`;
  }
}