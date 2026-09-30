/*
 * Shared menu data layer used by every design.
 *
 *   BH.load() → Promise<{ restaurant, categories: [{ id, name, icon, items: [dish] }] }>
 *   dish = { id, name, description, tags, prices: [{ label, price, code }] }
 *
 * Sources, in order:
 *   ?preview      → unsaved draft from the Menu Manager (this browser only)
 *   sheetCsvUrl   → live Google Sheet (see assets/config.js)
 *   /data/menu.json
 */
(function () {
  const CFG = window.BH_CONFIG || {};
  const ROOT = (document.currentScript && document.currentScript.src.replace(/assets\/menu-core\.js.*$/, "")) || "/";
  const DRAFT_KEY = "bh-menu-draft";
  const SHEET_CACHE = "bh-menu-sheet-cache";

  // category name → icon, used when categories come from a spreadsheet
  const ICON_WORDS = [
    ["iced", "iced"], ["matcha", "iced"], ["mocktail", "mocktail"], ["cocktail", "mocktail"],
    ["juice", "juice"], ["shake", "juice"], ["smoothie", "juice"], ["soft", "soda"], ["water", "soda"],
    ["beer", "beer"], ["wine", "wine"], ["spirit", "spirits"], ["alcohol", "spirits"], ["arak", "spirits"],
    ["arguil", "arguileh"], ["shisha", "arguileh"], ["hookah", "arguileh"], ["hot", "coffee"], ["coffee", "coffee"],
    ["dessert", "dessert"], ["sweet", "dessert"], ["pasta", "pasta"], ["platter", "platter"], ["main", "platter"],
    ["grill", "platter"], ["combo", "combo"], ["meal", "combo"], ["sub", "sub"], ["sandwich", "burger"],
    ["burger", "burger"], ["pizza", "pizza"], ["manak", "pizza"], ["salad", "salad"], ["starter", "starters"],
    ["mezze", "starters"], ["appetizer", "starters"], ["extra", "plus"], ["add", "plus"],
  ];
  const iconFor = (name) => {
    const n = name.toLowerCase();
    const hit = ICON_WORDS.find(([w]) => n.includes(w));
    return hit ? hit[1] : "plus";
  };
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // ---- CSV (RFC 4180-ish, handles quotes/commas/newlines in cells)
  function parseCSV(text) {
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.some((x) => x.trim() !== ""));
  }

  function fromCSV(text) {
    const rows = parseCSV(text);
    const head = (rows.shift() || []).map((h) => h.trim().toLowerCase().replace(/^\ufeff/, ""));
    if (!head.includes("name") || !head.includes("price")) throw new Error("not a menu sheet (needs name + price columns)");
    const col = (r, k) => { const i = head.indexOf(k); return i < 0 ? "" : (r[i] || "").trim(); };
    const cats = [], seen = {};
    const items = rows.map((r) => {
      const catName = col(r, "category") || "Menu";
      const id = slug(catName);
      if (!seen[id]) { seen[id] = 1; cats.push({ id, name: catName, icon: iconFor(catName) }); }
      const vis = col(r, "visible").toLowerCase();
      return {
        code: col(r, "code"), name: col(r, "name"), option: col(r, "option"),
        price: parseFloat(col(r, "price").replace(/[^0-9.]/g, "")) || 0,
        category: id, description: col(r, "description"),
        tags: col(r, "tags").split(/[\s,]+/).filter(Boolean),
        visible: !["no", "n", "false", "0", "hidden", "hide"].includes(vis),
      };
    });
    return { restaurant: { name: "Best Home" }, categories: cats, items };
  }

  // ---- flat rows → categories with grouped dishes
  function shape(raw) {
    const byCat = {};
    raw.categories.forEach((c) => (byCat[c.id] = { ...c, items: [], _k: {} }));
    raw.items.forEach((it) => {
      if (!it.visible || !it.name) return;
      let cat = byCat[it.category];
      if (!cat) {
        cat = byCat[it.category] = { id: it.category, name: it.category, icon: iconFor(it.category), items: [], _k: {} };
        raw.categories.push(cat);
      }
      const key = it.name.toLowerCase();
      let dish = cat._k[key];
      if (!dish) {
        dish = cat._k[key] = { id: cat.id + "-" + slug(it.name), name: it.name, description: it.description || "", tags: [...(it.tags || [])], prices: [] };
        cat.items.push(dish);
      } else {
        if (!dish.description && it.description) dish.description = it.description;
        (it.tags || []).forEach((t) => dish.tags.includes(t) || dish.tags.push(t));
      }
      dish.prices.push({ label: it.option || "", price: +it.price, code: it.code });
    });
    const categories = raw.categories.map((c) => byCat[c.id]).filter((c) => c && c.items.length);
    categories.forEach((c) => delete c._k);
    return { restaurant: { ...(raw.restaurant || {}), name: (raw.restaurant && raw.restaurant.name) || "Best Home" }, categories };
  }

  // Accepts either a "Publish to web" CSV link, or a normal share link
  // (Share → Anyone with the link → Viewer), which is read through Google's CSV endpoint.
  function sheetUrl(u) {
    const m = String(u || "").match(/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/);
    if (!m || m[1] === "e") return u;
    return "https://docs.google.com/spreadsheets/d/" + m[1] + "/gviz/tq?tqx=out:csv&sheet=Menu";
  }

  async function fetchRaw() {
    const params = new URLSearchParams(location.search);
    if (params.has("preview")) {
      try { const d = localStorage.getItem(DRAFT_KEY); if (d) return JSON.parse(d); } catch (e) { /* fall through */ }
    }
    if (CFG.sheetCsvUrl) {
      // Google Sheet → validated → remembered as "last good" in case Google is unreachable later
      try {
        const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 8000);
        const r = await fetch(sheetUrl(CFG.sheetCsvUrl), { cache: "no-store", signal: ctl.signal });
        clearTimeout(t);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const raw = fromCSV(await r.text());
        if (!raw.items.some((i) => i.visible && i.name)) throw new Error("sheet has no visible items");
        try { localStorage.setItem(SHEET_CACHE, JSON.stringify(raw)); } catch (e) { /* storage full / private mode */ }
        return raw;
      } catch (e) {
        console.warn("Google Sheet unavailable:", e.message);
        try { const c = localStorage.getItem(SHEET_CACHE); if (c) return JSON.parse(c); } catch (e2) { /* ignore */ }
      }
    }
    const r = await fetch(ROOT + "data/menu.json", { cache: "no-cache" });
    return r.json();
  }

  const fmt = new Intl.NumberFormat(CFG.locale || "en-US", { style: "currency", currency: CFG.currency || "USD", minimumFractionDigits: 2 });
  const fold = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  window.BH = {
    config: CFG,
    root: ROOT,
    DRAFT_KEY,
    async load() { return shape(await fetchRaw()); },
    fetchRaw, shape, fromCSV, parseCSV, slug, sheetUrl,
    price: (n) => fmt.format(n),
    esc,
    /** from-price for dishes with several sizes */
    minPrice: (d) => Math.min(...d.prices.map((p) => p.price)),
    matches(dish, cat, q) {
      q = fold(q).trim();
      if (!q) return true;
      // every query word must start a word of the dish (so "latte" ≠ "Platters")
      const words = fold([dish.name, dish.description, cat.name, dish.tags.join(" "), dish.prices.map((p) => p.label).join(" ")].join(" ")).split(/[^a-z0-9½¼]+/);
      return q.split(/\s+/).every((w) => words.some((x) => x.startsWith(w)));
    },
    icon: (n, c) => window.BH_ICON(n, c),
    /** preview banner + "all concepts" pill */
    chrome() {
      if (new URLSearchParams(location.search).has("preview")) {
        document.body.insertAdjacentHTML("afterbegin", '<div class="preview-bar">Preview of your unpublished changes — only visible in this browser</div>');
      }
      if (CFG.demo && window.top === window.self) {
        document.body.insertAdjacentHTML("beforeend", '<a class="demo-pill" href="' + ROOT + '">' + window.BH_ICON("back") + "All concepts</a>");
      }
    },
    contactHTML() {
      const c = CFG, I = window.BH_ICON, out = [];
      if (c.address) out.push('<span>' + I("pin", "ico-s") + esc(c.address) + "</span>");
      if (c.hours) out.push('<span>' + I("clock", "ico-s") + esc(c.hours) + "</span>");
      if (c.phone) out.push('<a href="tel:' + esc(c.phone.replace(/\s/g, "")) + '">' + I("phone", "ico-s") + esc(c.phone) + "</a>");
      if (c.instagram) out.push('<a href="https://instagram.com/' + esc(c.instagram) + '" target="_blank" rel="noopener">' + I("insta", "ico-s") + "@" + esc(c.instagram) + "</a>");
      return out.join("");
    },
  };
})();
