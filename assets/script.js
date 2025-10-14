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
    poemList: document.getElementById("poemList"),
    emptyState: document.getElementById("emptyState"),
    listView: document.getElementById("listView"),
    detailView: document.getElementById("detailView"),
    poemDetail: document.getElementById("poemDetail"),
    backBtn: document.getElementById("backBtn"),
    themeToggle: document.getElementById("themeToggle"),
    pager: document.getElementById("pager"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
  };

  // Theme restore
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") document.documentElement.classList.add("dark");

  els.themeToggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
    const isDark = document.documentElement.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
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
})();