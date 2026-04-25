const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ── CONSTANTS ──
const EXPENSE_CATS = [
  { id: "food", label: "Food", emoji: "🍔", color: "#FF6B6B" },
  { id: "transport", label: "Transport", emoji: "🛵", color: "#FFB347" },
  { id: "shopping", label: "Shopping", emoji: "🛍️", color: "#A78BFA" },
  { id: "bills", label: "Bills", emoji: "📄", color: "#60A5FA" },
  { id: "health", label: "Health", emoji: "🏥", color: "#34D399" },
  { id: "entertainment", label: "Entertain", emoji: "🎬", color: "#F472B6" },
  { id: "groceries", label: "Groceries", emoji: "🛒", color: "#4ADE80" },
  { id: "education", label: "Education", emoji: "📚", color: "#38BDF8" },
  { id: "project", label: "Project", emoji: "💼", color: "#FBBF24" },
  { id: "other", label: "Other", emoji: "📦", color: "#94A3B8" },
];
const INCOME_CATS = [
  { id: "salary", label: "Salary", emoji: "💰", color: "#22C55E" },
  { id: "freelance", label: "Freelance", emoji: "💼", color: "#10B981" },
  { id: "gift", label: "Gift", emoji: "🎁", color: "#34D399" },
  { id: "interest", label: "Interest", emoji: "🏦", color: "#4ADE80" },
  { id: "otherinc", label: "Other", emoji: "💸", color: "#86EFAC" },
];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const SHORT_M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CAT_HINTS = {
  food: ["swiggy", "zomato", "pizza", "burger", "cafe", "chai", "biryani", "restaurant", "hotel", "eat", "lunch", "dinner", "breakfast", "dosa", "idli", "thali", "maggi", "noodle", "paratha"],
  transport: ["uber", "ola", "auto", "bus", "metro", "train", "petrol", "diesel", "fuel", "rapido", "cab", "rickshaw", "toll", "flight", "irctc", "redbus"],
  shopping: ["amazon", "flipkart", "myntra", "meesho", "ajio", "shop", "cloth", "shirt", "pant", "dress", "shoes", "wear", "nykaa", "purse", "bag"],
  bills: ["electricity", "wifi", "internet", "broadband", "jio", "airtel", "vi", "recharge", "water", "gas", "lpg", "bill", "emi", "loan", "rent", "maintenance"],
  health: ["doctor", "hospital", "clinic", "medicine", "pharma", "apollo", "medplus", "health", "chemist", "tablet", "injection", "gym", "yoga", "dentist"],
  entertainment: ["netflix", "hotstar", "prime", "youtube", "movie", "film", "game", "spotify", "concert", "show", "ticket", "bowling", "cricket", "match"],
  groceries: ["bigbasket", "blinkit", "grofer", "vegetable", "fruit", "milk", "dmart", "grocery", "kirana", "rice", "dal", "atta", "zepto", "instamart"],
  education: ["school", "college", "tuition", "course", "book", "udemy", "coursera", "fee", "class", "coaching", "linkedin learning", "skillshare"],
};

// ── HELPERS ──
function suggestCat(desc) { const d = desc.toLowerCase(); for (const [cat, keys] of Object.entries(CAT_HINTS)) { if (keys.some(k => d.includes(k))) return cat; } return null; }
function inr(n) { return "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function nowISO() { return new Date().toISOString(); }
function todayKey() { return new Date().toISOString().split("T")[0]; }
function monthKey(iso) { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; }
function curMonthKey() { return monthKey(new Date().toISOString()); }
function fmtDate(iso) { const d = new Date(iso); return `${DAYS[d.getDay()]}, ${d.getDate()} ${SHORT_M[d.getMonth()]}`; }
function fmtTime(iso) { const d = new Date(iso); return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); }
function fmtMonthLabel(key) { const [y, m] = key.split("-"); return `${MONTHS[parseInt(m) - 1]} ${y}`; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function getCat(id, type = "expense") {
  if (type === "income") return INCOME_CATS.find(c => c.id === id) || INCOME_CATS[4];
  return EXPENSE_CATS.find(c => c.id === id) || { id: "other", label: "Other", emoji: "📦", color: "#94A3B8" };
}

// ── SAMPLE DATA ──
function makeSamples() {
  const prev = new Date(); prev.setMonth(prev.getMonth() - 1);
  const mk = (days, type, amt, desc, cat) => { const d = new Date(); d.setDate(d.getDate() - days); return { id: uid(), type, amount: amt, description: desc, category: cat, date: d.toISOString(), isRecurring: false }; };
  const mkP = (day, type, amt, desc, cat) => { const d = new Date(prev.getFullYear(), prev.getMonth(), day); return { id: uid(), type, amount: amt, description: desc, category: cat, date: d.toISOString(), isRecurring: false }; };
  return [
    mk(0, "expense", 320, "Swiggy dinner", "food"),
    mk(0, "expense", 85, "Auto to office", "transport"),
    mk(1, "income", 45000, "Monthly salary", "salary"),
    mk(1, "expense", 1299, "Netflix subscription", "entertainment"),
    mk(2, "expense", 560, "BigBasket groceries", "groceries"),
    mk(3, "expense", 450, "Petrol refill", "transport"),
    mk(4, "expense", 2400, "Electricity bill", "bills"),
    mk(5, "expense", 890, "Zomato lunch", "food"),
    mk(6, "expense", 3500, "Amazon shirt", "shopping"),
    mk(7, "expense", 600, "Apollo pharmacy", "health"),
    mk(8, "expense", 120, "Chai and snacks", "food"),
    mk(9, "income", 8000, "Freelance project", "freelance"),
    mkP(1, "income", 45000, "Monthly salary", "salary"),
    mkP(3, "expense", 12000, "House rent", "bills"),
    mkP(8, "expense", 4200, "Grocery run", "groceries"),
    mkP(12, "expense", 850, "Ola cab", "transport"),
    mkP(15, "expense", 1800, "Jio recharge", "bills"),
    mkP(18, "expense", 720, "Swiggy biryani", "food"),
    mkP(22, "income", 8000, "Freelance project", "freelance"),
    mkP(25, "expense", 2100, "Udemy course", "education"),
  ];
}

// ── LOCAL STORAGE ──
const LS = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
};

// ══════════════════════════════════════
//  MAIN APP
// ══════════════════════════════════════
function App() {
  const [dark, setDark] = useState(() => LS.get("ss_dark", true));
  const [tab, setTab] = useState("home");
  const [txns, setTxns] = useState(() => { const s = LS.get("ss_txns", null); return (s && s.length > 0) ? s : []; });
  const [budgets, setBudgets] = useState(() => LS.get("ss_budgets", {}));
  const [customCats, setCustomCats] = useState(() => LS.get("ss_custom_cats", []));
  const [toast, setToast] = useState(null);
  const [undoStack, setUndoStack] = useState(null);
  const toastRef = useRef(null);

  useEffect(() => { LS.set("ss_txns", txns); }, [txns]);
  useEffect(() => { LS.set("ss_budgets", budgets); }, [budgets]);
  useEffect(() => { LS.set("ss_dark", dark); }, [dark]);
  useEffect(() => { LS.set("ss_custom_cats", customCats); }, [customCats]);
  useEffect(() => { document.body.className = dark ? "" : "light"; }, [dark]);

  useEffect(() => {
    const last = LS.get("ss_rec_check", "");
    const today = todayKey();
    const d = new Date();
    if (d.getDate() === 1 && last !== today) {
      const rec = txns.filter(t => t.isRecurring);
      if (rec.length > 0) {
        const newT = rec.map(t => ({ ...t, id: uid(), date: new Date().toISOString() }));
        setTxns(p => [...newT, ...p]);
        LS.set("ss_rec_check", today);
        showToast(`🔁 ${newT.length} recurring item(s) added`, "info", 5000);
      }
    }
  }, []);

  function showToast(msg, type = "success", dur = 3200) {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => { setToast(null); setUndoStack(null); }, dur);
  }

  function addTxn(t) {
    setTxns(p => [t, ...p]);
    setUndoStack({ t, action: "add" });
    showToast(`${t.type === "income" ? "💚 Income" : "🧾 Expense"} added!`, "success", 5000);
  }
  function deleteTxn(id) {
    const t = txns.find(x => x.id === id);
    setTxns(p => p.filter(x => x.id !== id));
    setUndoStack({ t, action: "delete" });
    showToast("🗑️ Deleted — tap to undo", "info", 5000);
  }
  function updateTxn(u) { setTxns(p => p.map(t => t.id === u.id ? u : t)); showToast("✅ Updated!"); }
  function handleUndo() {
    if (!undoStack) return;
    if (undoStack.action === "add") setTxns(p => p.filter(t => t.id !== undoStack.t.id));
    if (undoStack.action === "delete") setTxns(p => [undoStack.t, ...p]);
    setUndoStack(null); setToast(null);
    showToast("↩️ Undone!", "success", 2000);
  }

  const allCats = [...EXPENSE_CATS, ...customCats];

  const T = dark
    ? { bg: "#0D0D0F", bg2: "#111113", bg3: "#1A1A1E", border: "#232328", text: "#F0EEE8", muted: "#444", sub: "#777", card: "#141416", accent: "#F59E0B" }
    : { bg: "#F5F4F0", bg2: "#FFFFFF", bg3: "#ECEAE4", border: "#E0DDD6", text: "#1A1A1E", muted: "#BBB", sub: "#888", card: "#FFFFFF", accent: "#D97706" };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, paddingBottom: 80 }}>

      {/* Toast */}
      {toast && (
        <div onClick={undoStack ? handleUndo : undefined}
          style={{
            position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
            background: toast.type === "success" ? "#16A34A" : toast.type === "info" ? "#2563EB" : "#DC2626",
            color: "#fff", padding: "11px 22px", borderRadius: 40, fontWeight: 700, fontSize: 13,
            zIndex: 9999, boxShadow: "0 6px 32px rgba(0,0,0,0.5)", whiteSpace: "nowrap",
            cursor: undoStack ? "pointer" : "default", display: "flex", alignItems: "center", gap: 8,
            animation: "slideDown 0.22s cubic-bezier(0.34,1.56,0.64,1)"
          }}>
          {toast.msg}
          {undoStack && <span style={{ background: "rgba(255,255,255,0.22)", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 800 }}>UNDO</span>}
        </div>
      )}

      {/* Header */}
      <div style={{ background: T.bg2, borderBottom: `1px solid ${T.border}`, padding: "14px 18px 12px", position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1 }}>
              SpendSmart <span style={{ color: T.accent }}>₹</span>
            </div>
            <div style={{ fontSize: 10, color: T.muted, letterSpacing: 1.2, marginTop: 1 }}>TRACK · BUDGET · SHARE</div>
          </div>
          <button onClick={() => setDark(d => !d)}
            style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 12, padding: "8px 14px", fontSize: 16, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 540, margin: "0 auto", padding: "0 14px" }}>
        {tab === "home" && <HomeTab T={T} dark={dark} txns={txns} budgets={budgets} setBudgets={setBudgets} allCats={allCats} customCats={customCats} showToast={showToast} />}
        {tab === "add" && <AddTab T={T} dark={dark} addTxn={addTxn} allCats={allCats} customCats={customCats} setCustomCats={setCustomCats} showToast={showToast} />}
        {tab === "history" && <HistoryTab T={T} txns={txns} deleteTxn={deleteTxn} updateTxn={updateTxn} allCats={allCats} customCats={customCats} showToast={showToast} />}
        {tab === "settings" && <SettingsTab T={T} dark={dark} setDark={setDark} setTxns={setTxns} setBudgets={setBudgets} setCustomCats={setCustomCats} showToast={showToast} />}
      </div>

      {/* Bottom Nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: dark ? "rgba(13,13,15,0.96)" : "rgba(245,244,240,0.96)",
        backdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`,
        padding: "8px 0 env(safe-area-inset-bottom,12px)", zIndex: 60
      }}>
        <div style={{ maxWidth: 540, margin: "0 auto", display: "flex" }}>
          {[
            { id: "home", emoji: "📊", label: "Home", active: "#F59E0B" },
            { id: "add", emoji: "➕", label: "Add", active: "#22C55E" },
            { id: "history", emoji: "📋", label: "History", active: "#60A5FA" },
            { id: "settings", emoji: "⚙️", label: "Settings", active: "#94A3B8" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, border: "none", background: "transparent", borderRadius: 14,
              padding: "10px 4px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: tab === t.id ? t.active : T.muted, transition: "color 0.15s",
            }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{t.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════
//  ADD TAB
// ══════════════════════════════════════
function AddTab({ T, dark, addTxn, allCats, customCats, setCustomCats, showToast }) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("food");
  const [txnType, setTxnType] = useState("expense");
  const [recurring, setRecurring] = useState(false);
  const [catSug, setCatSug] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🏷️");
  const [newColor, setNewColor] = useState("#94A3B8");
  const amtRef = useRef(null);

  useEffect(() => { setTimeout(() => amtRef.current?.focus(), 120); }, []);

  function handleDescChange(v) {
    setDesc(v);
    const s = suggestCat(v);
    if (s && s !== cat) setCatSug(s);
    else setCatSug(null);
  }

  function handleAdd() {
    const a = parseFloat(amount);
    if (!a || a <= 0) { showToast("⚠️ Enter a valid amount", "error"); return; }
    if (!desc.trim()) { showToast("⚠️ Add a description", "error"); return; }
    addTxn({ id: uid(), type: txnType, amount: a, description: desc.trim(), category: cat, date: nowISO(), isRecurring: recurring });
    setAmount(""); setDesc(""); setRecurring(false); setCatSug(null);
    setTimeout(() => amtRef.current?.focus(), 80);
  }

  function addCustomCat() {
    if (!newName.trim()) { showToast("Enter a category name", "error"); return; }
    const nc = { id: "c_" + uid(), label: newName.trim(), emoji: newEmoji, color: newColor };
    setCustomCats(p => [...p, nc]);
    setCat(nc.id);
    setShowCustomModal(false);
    setNewName(""); setNewEmoji("🏷️"); setNewColor("#94A3B8");
    showToast(`✅ "${nc.label}" added!`);
  }

  function deleteCustomCat(id) {
    setCustomCats(p => p.filter(c => c.id !== id));
    if (cat === id) setCat("other");
    showToast("Category removed");
  }

  const cats = txnType === "income" ? INCOME_CATS : [...EXPENSE_CATS, ...customCats];
  const selectedCat = cats.find(c => c.id === cat) || (txnType === "income" ? INCOME_CATS[0] : EXPENSE_CATS[0]);

  const QUICK_AMOUNTS = txnType === "expense"
    ? [10, 20, 50, 100, 200, 500, 1000, 2000]
    : [1000, 2000, 5000, 10000, 15000, 20000, 50000, 100000];

  return (
    <div style={{ paddingTop: 18 }} className="fadein">

      {/* Type Toggle */}
      <div style={{ display: "flex", background: T.bg3, borderRadius: 18, padding: 4, marginBottom: 16, border: `1px solid ${T.border}` }}>
        {["expense", "income"].map(t => (
          <button key={t} onClick={() => { setTxnType(t); setCat(t === "income" ? "salary" : "food"); setCatSug(null); }} style={{
            flex: 1, padding: "13px", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 14, letterSpacing: 0.3,
            background: txnType === t
              ? (t === "expense" ? "linear-gradient(135deg,#FF6B6B,#EF4444)" : "linear-gradient(135deg,#22C55E,#16A34A)")
              : "transparent",
            color: txnType === t ? "#fff" : T.muted,
            boxShadow: txnType === t ? "0 3px 16px rgba(0,0,0,0.25)" : "none",
            transition: "all 0.18s",
          }}>{t === "expense" ? "💸 Expense" : "💚 Income"}</button>
        ))}
      </div>

      {/* Amount Card */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22, padding: "20px 18px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 10 }}>Amount</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 14, borderBottom: `1.5px solid ${T.border}` }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: T.accent, lineHeight: 1 }}>₹</span>
          <input ref={amtRef} type="number" inputMode="decimal" placeholder="0"
            value={amount} onChange={e => setAmount(e.target.value)}
            style={{
              flex: 1, minWidth: 0, background: "none", border: "none", outline: "none", fontSize: 42, fontWeight: 800,
              color: T.text, fontFamily: "'DM Mono',monospace", letterSpacing: -1, lineHeight: 1
            }}
          />
          {amount && <button onClick={() => setAmount("")} style={{
            background: T.bg3, border: "none", borderRadius: 50,
            width: 30, height: 30, fontSize: 14, color: T.sub, display: "flex", alignItems: "center", justifyContent: "center"
          }}>✕</button>}
        </div>
        {/* Quick amounts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, marginTop: 14 }}>
          {QUICK_AMOUNTS.map(a => (
            <button key={a} onClick={() => setAmount(String(a))} style={{
              padding: "10px 0", borderRadius: 12, border: `1.5px solid ${amount === String(a) ? T.accent : T.border}`,
              background: amount === String(a) ? `${T.accent}18` : T.bg3,
              color: amount === String(a) ? T.accent : T.sub,
              fontSize: 13, fontWeight: 700, transition: "all 0.15s", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis",
            }}>₹{a >= 1000 ? `${a / 1000}k` : a}</button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: "16px 18px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1.4, marginBottom: 8 }}>
          {txnType === "income" ? "Earned from" : "Spent on"}
        </div>
        <input type="text"
          placeholder={txnType === "income" ? "e.g. Client payment, Salary…" : "e.g. Swiggy order, Auto fare…"}
          value={desc} onChange={e => handleDescChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
          style={{
            display: "block", width: "100%", minWidth: 0, background: "none", border: "none", outline: "none",
            fontSize: 17, fontWeight: 600, color: T.text, lineHeight: 1.4
          }}
        />
        {catSug && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: T.muted }}>Suggested:</span>
            <button onClick={() => { setCat(catSug); setCatSug(null); }} style={{
              background: `${T.accent}18`, border: `1px solid ${T.accent}44`, borderRadius: 20,
              color: T.accent, padding: "4px 12px", fontSize: 12, fontWeight: 700,
            }}>
              {getCat(catSug).emoji} {getCat(catSug).label} — use?
            </button>
          </div>
        )}
      </div>

      {/* Category */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: "16px 18px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: 1.4 }}>Category</div>
          {txnType === "expense" && (
            <button onClick={() => setShowCustomModal(true)} style={{
              background: `${T.accent}18`, border: `1px solid ${T.accent}33`, borderRadius: 14,
              color: T.accent, padding: "4px 10px", fontSize: 12, fontWeight: 700,
            }}>+ Custom</button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {cats.map(c => (
            <div key={c.id} style={{ position: "relative" }}>
              <button onClick={() => setCat(c.id)} style={{
                width: "100%", padding: "10px 4px", borderRadius: 14,
                border: `2px solid ${cat === c.id ? c.color : T.border}`,
                background: cat === c.id ? `${c.color}18` : T.bg3,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                transition: "all 0.15s",
              }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>{c.emoji}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: cat === c.id ? c.color : T.sub,
                  textAlign: "center", lineHeight: 1.1, letterSpacing: 0.2
                }}>{c.label}</span>
              </button>
              {c.id.startsWith("c_") && (
                <button onClick={() => deleteCustomCat(c.id)} style={{
                  position: "absolute", top: -5, right: -5, width: 18, height: 18, borderRadius: 50,
                  background: "#EF4444", border: "none", color: "#fff", fontSize: 9, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recurring toggle */}
      <div style={{
        background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: "14px 18px", marginBottom: 20,
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>🔁 Recurring</div>
          <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>Auto-add on 1st of each month</div>
        </div>
        <button onClick={() => setRecurring(r => !r)} style={{
          width: 50, height: 28, borderRadius: 20, border: "none", position: "relative",
          background: recurring ? "#22C55E" : T.bg3, transition: "background 0.2s",
        }}>
          <div style={{
            position: "absolute", top: 3, left: recurring ? 24 : 3, width: 22, height: 22,
            borderRadius: 50, background: recurring ? "#fff" : T.muted, transition: "left 0.2s"
          }} />
        </button>
      </div>

      {/* Add Button */}
      <button onClick={handleAdd} style={{
        width: "100%", padding: "17px", borderRadius: 18, border: "none",
        background: txnType === "expense"
          ? "linear-gradient(135deg,#FF6B6B,#EF4444)"
          : "linear-gradient(135deg,#22C55E,#16A34A)",
        color: "#fff", fontSize: 17, fontWeight: 800, letterSpacing: 0.3,
        boxShadow: `0 4px 24px ${txnType === "expense" ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.4)"}`,
        marginBottom: 8,
      }}>
        {txnType === "expense" ? "💸 Add Expense" : "💚 Add Income"}
      </button>

      {/* Custom Cat Modal */}
      {showCustomModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200,
          display: "flex", alignItems: "flex-end", justifyContent: "center"
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowCustomModal(false); }}>
          <div className="pop" style={{
            background: T.bg2, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px",
            width: "100%", maxWidth: 540, border: `1px solid ${T.border}`
          }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 20 }}>✨ Create Custom Category</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 6 }}>EMOJI</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, marginBottom: 8 }}>
                {["🏋️", "🎮", "✈️", "🐾", "🌿", "🍺", "💇", "🎸", "🚗", "🏠", "💍", "🎯", "🧘", "🤝", "📷", "🎁"].map(e => (
                  <button key={e} onClick={() => setNewEmoji(e)} style={{
                    fontSize: 22, padding: "6px", borderRadius: 10,
                    border: `2px solid ${newEmoji === e ? T.accent : T.border}`,
                    background: newEmoji === e ? `${T.accent}18` : T.bg3,
                  }}>{e}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 6 }}>NAME</div>
              <input type="text" placeholder="e.g. Gym, Travel, Pets…"
                value={newName} onChange={e => setNewName(e.target.value)}
                autoFocus
                style={{
                  width: "100%", background: T.bg3, border: `1.5px solid ${T.border}`, borderRadius: 12,
                  padding: "12px 14px", fontSize: 16, fontWeight: 600, color: T.text, outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginBottom: 6 }}>COLOR</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["#FF6B6B", "#FFB347", "#FBBF24", "#22C55E", "#34D399", "#60A5FA", "#A78BFA", "#F472B6", "#94A3B8", "#38BDF8"].map(c => (
                  <button key={c} onClick={() => setNewColor(c)} style={{
                    width: 34, height: 34, borderRadius: 50, background: c, border: `3px solid ${newColor === c ? "#fff" : c}`,
                    boxShadow: newColor === c ? "0 0 0 2px " + c : "none",
                  }} />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowCustomModal(false)} style={{
                flex: 1, padding: "14px", borderRadius: 14, border: `1px solid ${T.border}`,
                background: T.bg3, color: T.sub, fontWeight: 700, fontSize: 15,
              }}>Cancel</button>
              <button onClick={addCustomCat} style={{
                flex: 2, padding: "14px", borderRadius: 14, border: "none",
                background: `linear-gradient(135deg,${T.accent},#D97706)`,
                color: "#fff", fontWeight: 800, fontSize: 15,
              }}>Create Category</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
//  HOME TAB
// ══════════════════════════════════════
function HomeTab({ T, dark, txns, budgets, setBudgets, allCats, customCats, showToast }) {
  const [monthIdx, setMonthIdx] = useState(0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetCat, setBudgetCat] = useState("food");
  const [budgetAmt, setBudgetAmt] = useState("");
  const [showShare, setShowShare] = useState(false);

  const allMonths = useMemo(() => {
    const keys = new Set(txns.map(t => monthKey(t.date)));
    return Array.from(keys).sort((a, b) => b.localeCompare(a));
  }, [txns]);

  const curKey = allMonths[monthIdx] || curMonthKey();

  const monthTxns = useMemo(() => txns.filter(t => monthKey(t.date) === curKey), [txns, curKey]);
  const income = useMemo(() => monthTxns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [monthTxns]);
  const expense = useMemo(() => monthTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [monthTxns]);
  const balance = income - expense;

  // Category breakdown
  const catBreakdown = useMemo(() => {
    const map = {};
    monthTxns.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, amt]) => ({ id, amt, cat: allCats.find(c => c.id === id) || { id: "other", label: "Other", emoji: "📦", color: "#94A3B8" } }));
  }, [monthTxns, allCats]);

  // 7-day bar data
  const sevenDayData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const total = txns.filter(t => t.type === "expense" && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      days.push({ label: SHORT_M[d.getMonth()] + "-" + d.getDate(), day: DAYS[d.getDay()].slice(0, 1), total });
    }
    return days;
  }, [txns]);
  const maxDay = Math.max(...sevenDayData.map(d => d.total), 1);

  // Budget progress
  const budgetKeys = Object.keys(budgets).filter(k => budgets[k] > 0);

  function saveBudget() {
    const a = parseFloat(budgetAmt);
    if (!a || a <= 0) { showToast("Enter a valid amount", "error"); return; }
    setBudgets(b => ({ ...b, [budgetCat]: a }));
    setBudgetAmt(""); setShowBudgetModal(false);
    showToast("✅ Budget saved!");
  }

  function removeBudget(k) { setBudgets(b => { const n = { ...b }; delete n[k]; return n; }); showToast("Budget removed"); }

  // CSV Export
  function exportCSV() {
    const rows = [["Date", "Time", "Type", "Category", "Description", "Amount"], ...txns.map(t => {
      const d = new Date(t.date);
      return [d.toLocaleDateString("en-IN"), d.toLocaleTimeString("en-IN"), t.type,
      allCats.find(c => c.id === t.category)?.label || t.category, `"${t.description}"`, t.amount];
    })];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "SpendSmart_Export.csv"; a.click();
    showToast("📥 CSV downloaded!");
  }

  // Share text
  const shareText = `💸 SpendSmart — ${fmtMonthLabel(curKey)}\n\n💰 Income: ${inr(income)}\n🧾 Expenses: ${inr(expense)}\n✅ Balance: ${inr(balance)}\n\n📊 Top spends:\n${catBreakdown.slice(0, 3).map(c => `${c.cat.emoji} ${c.cat.label}: ${inr(c.amt)}`).join("\n")}\n\n_Tracked with SpendSmart ₹_`;

  function copyShare() { navigator.clipboard?.writeText(shareText); showToast("📋 Copied to clipboard!"); }
  function whatsappShare() { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`); }

  return (
    <div style={{ paddingTop: 18 }} className="fadein">

      {/* Month Nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={() => setMonthIdx(i => Math.min(i + 1, allMonths.length - 1))} disabled={monthIdx >= allMonths.length - 1}
          style={{
            background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "8px 14px",
            color: monthIdx >= allMonths.length - 1 ? T.muted : T.text, fontSize: 16, fontWeight: 700
          }}>‹</button>
        <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.3 }}>{fmtMonthLabel(curKey)}</div>
        <button onClick={() => setMonthIdx(i => Math.max(i - 1, 0))} disabled={monthIdx === 0}
          style={{
            background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "8px 14px",
            color: monthIdx === 0 ? T.muted : T.text, fontSize: 16, fontWeight: 700
          }}>›</button>
      </div>

      {/* Balance Hero */}
      <div style={{
        background: `linear-gradient(135deg,${balance >= 0 ? "#16A34A" : "#DC2626"},${balance >= 0 ? "#14532D" : "#7F1D1D"})`,
        borderRadius: 24, padding: "24px 20px", marginBottom: 12, position: "relative", overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: 50,
          background: "rgba(255,255,255,0.05)"
        }} />
        <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 1.4, marginBottom: 4 }}>NET BALANCE</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>{inr(Math.abs(balance))}</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{balance >= 0 ? "✅ You're in the green" : "⚠️ Overspent this month"}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 18 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>INCOME</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 2 }}>{inr(income)}</div>
          </div>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 12px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>EXPENSES</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 2 }}>{inr(expense)}</div>
          </div>
        </div>
      </div>

      {/* 7-Day Chart */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, padding: "16px 14px", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: 1.2, marginBottom: 14 }}>7-DAY SPENDING</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {sevenDayData.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: "100%", borderRadius: "6px 6px 0 0",
                height: d.total > 0 ? Math.max(8, Math.round((d.total / maxDay) * 72)) : 4,
                background: i === 6 ? "#F59E0B" : `${T.accent}44`,
                transition: "height 0.3s ease",
              }} />
              <span style={{ fontSize: 9, fontWeight: 700, color: i === 6 ? T.accent : T.sub }}>{d.day}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: T.muted, marginTop: 8, textAlign: "right" }}>
          Week total: <span style={{ color: T.accent, fontWeight: 700 }}>{inr(sevenDayData.reduce((s, d) => s + d.total, 0))}</span>
        </div>
      </div>

      {/* Category Breakdown */}
      {catBreakdown.length > 0 && (
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, padding: "16px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: 1.2, marginBottom: 12 }}>SPENDING BY CATEGORY</div>
          {catBreakdown.map(({ id, amt, cat }) => {
            const pct = expense > 0 ? Math.round((amt / expense) * 100) : 0;
            return (
              <div key={id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{cat.emoji} {cat.label}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: T.sub }}>{pct}%</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{inr(amt)}</span>
                  </div>
                </div>
                <div style={{ height: 5, background: T.bg3, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 10, transition: "width 0.5s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budgets */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, padding: "16px 14px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: 1.2 }}>BUDGETS</div>
          <button onClick={() => setShowBudgetModal(true)} style={{
            background: `${T.accent}18`, border: `1px solid ${T.accent}33`, borderRadius: 14,
            color: T.accent, padding: "4px 10px", fontSize: 12, fontWeight: 700,
          }}>+ Set Budget</button>
        </div>
        {budgetKeys.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px 0", color: T.muted, fontSize: 13 }}>
            No budgets set — tap "+ Set Budget" to add limits
          </div>
        ) : (
          budgetKeys.map(k => {
            const spent = monthTxns.filter(t => t.type === "expense" && t.category === k).reduce((s, t) => s + t.amount, 0);
            const pct = Math.min(100, Math.round((spent / budgets[k]) * 100));
            const over = spent > budgets[k];
            const cat = allCats.find(c => c.id === k) || { emoji: "📦", label: "Other", color: "#94A3B8" };
            return (
              <div key={k} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{cat.emoji} {cat.label}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: over ? "#EF4444" : T.sub }}>{inr(spent)} / {inr(budgets[k])}</span>
                    <button onClick={() => removeBudget(k)} style={{ background: "none", border: "none", color: T.muted, fontSize: 14, padding: "0 2px" }}>✕</button>
                  </div>
                </div>
                <div style={{ height: 8, background: T.bg3, borderRadius: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`, borderRadius: 10, transition: "width 0.5s",
                    background: over ? "#EF4444" : pct > 80 ? "#F59E0B" : cat.color
                  }} />
                </div>
                {over && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 3, fontWeight: 700 }}>⚠️ Over budget by {inr(spent - budgets[k])}</div>}
              </div>
            );
          })
        )}
      </div>

      {/* Recent Transactions */}
      {monthTxns.length > 0 && (
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, padding: "16px 14px", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: 1.2, marginBottom: 12 }}>RECENT — {fmtMonthLabel(curKey).toUpperCase()}</div>
          {monthTxns.slice(0, 5).map(t => {
            const cat = t.type === "income" ? INCOME_CATS.find(c => c.id === t.category) || INCOME_CATS[4] : allCats.find(c => c.id === t.category) || { emoji: "📦", label: "Other", color: "#94A3B8" };
            return (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                borderBottom: `1px solid ${T.border}`
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12, background: `${cat.color}20`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0
                }}>
                  {cat.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                  <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>{fmtDate(t.date)} · {fmtTime(t.date)}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: t.type === "income" ? "#22C55E" : "#FF6B6B", flexShrink: 0 }}>
                  {t.type === "income" ? "+" : "-"}{inr(t.amount)}
                </div>
              </div>
            );
          })}
          {monthTxns.length > 5 && <div style={{ textAlign: "center", fontSize: 12, color: T.muted, marginTop: 8 }}>{monthTxns.length - 5} more in History tab</div>}
        </div>
      )}

      {/* Export & Share */}
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        <button onClick={exportCSV} style={{
          flex: 1, padding: "14px", borderRadius: 16, border: `1px solid ${T.border}`,
          background: T.bg2, color: T.text, fontWeight: 700, fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>📥 Export CSV</button>
        <button onClick={() => setShowShare(s => !s)} style={{
          flex: 1, padding: "14px", borderRadius: 16, border: `1px solid ${T.border}`,
          background: T.bg2, color: T.text, fontWeight: 700, fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>📤 Share Summary</button>
      </div>

      {/* Share Panel */}
      {showShare && (
        <div className="pop" style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, padding: "16px", marginBottom: 12 }}>
          <pre style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: T.sub, whiteSpace: "pre-wrap", lineHeight: 1.6, marginBottom: 14 }}>{shareText}</pre>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={whatsappShare} style={{
              flex: 1, padding: "12px", borderRadius: 12, border: "none",
              background: "#25D366", color: "#fff", fontWeight: 700, fontSize: 13
            }}>
              💬 WhatsApp
            </button>
            <button onClick={copyShare} style={{
              flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${T.border}`,
              background: T.bg3, color: T.text, fontWeight: 700, fontSize: 13
            }}>
              📋 Copy
            </button>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200,
          display: "flex", alignItems: "flex-end", justifyContent: "center"
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowBudgetModal(false); }}>
          <div className="pop" style={{
            background: T.bg2, borderRadius: "24px 24px 0 0", padding: "24px 20px 40px",
            width: "100%", maxWidth: 540, border: `1px solid ${T.border}`
          }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 18 }}>🎯 Set Monthly Budget</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 8 }}>CATEGORY</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, maxHeight: 200, overflowY: "auto" }}>
                {allCats.map(c => (
                  <button key={c.id} onClick={() => setBudgetCat(c.id)} style={{
                    padding: "8px 4px", borderRadius: 12,
                    border: `2px solid ${budgetCat === c.id ? c.color : T.border}`,
                    background: budgetCat === c.id ? `${c.color}18` : T.bg3,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  }}>
                    <span style={{ fontSize: 20 }}>{c.emoji}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: budgetCat === c.id ? c.color : T.sub, textAlign: "center" }}>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginBottom: 8 }}>MONTHLY LIMIT</div>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, background: T.bg3,
                borderRadius: 14, padding: "12px 14px", border: `1.5px solid ${T.border}`
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: T.accent }}>₹</span>
                <input type="number" inputMode="decimal" placeholder="e.g. 5000"
                  value={budgetAmt} onChange={e => setBudgetAmt(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    fontSize: 24, fontWeight: 800, color: T.text, fontFamily: "'DM Mono',monospace"
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowBudgetModal(false)} style={{
                flex: 1, padding: "14px", borderRadius: 14, border: `1px solid ${T.border}`,
                background: T.bg3, color: T.sub, fontWeight: 700, fontSize: 15,
              }}>Cancel</button>
              <button onClick={saveBudget} style={{
                flex: 2, padding: "14px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#F59E0B,#D97706)",
                color: "#fff", fontWeight: 800, fontSize: 15,
              }}>Save Budget</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
//  HISTORY TAB
// ══════════════════════════════════════
function HistoryTab({ T, txns, deleteTxn, updateTxn, allCats, customCats, showToast }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editTxn, setEditTxn] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCat, setEditCat] = useState("");
  const [editType, setEditType] = useState("expense");

  const filtered = useMemo(() => {
    return txns
      .filter(t => filter === "all" || t.type === filter)
      .filter(t => !search || t.description.toLowerCase().includes(search.toLowerCase()));
  }, [txns, filter, search]);

  // Group by date
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(t => {
      const k = t.date.split("T")[0];
      if (!map[k]) map[k] = [];
      map[k].push(t);
    });
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  function startEdit(t) {
    setEditTxn(t);
    setEditAmount(String(t.amount));
    setEditDesc(t.description);
    setEditCat(t.category);
    setEditType(t.type);
  }

  function saveEdit() {
    const a = parseFloat(editAmount);
    if (!a || a <= 0) { showToast("Enter a valid amount", "error"); return; }
    if (!editDesc.trim()) { showToast("Add a description", "error"); return; }
    updateTxn({ ...editTxn, amount: a, description: editDesc.trim(), category: editCat, type: editType });
    setEditTxn(null);
  }

  const editCats = editType === "income" ? INCOME_CATS : [...EXPENSE_CATS, ...customCats];

  return (
    <div style={{ paddingTop: 18 }} className="fadein">

      {/* Search */}
      <div style={{
        background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16,
        padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8
      }}>
        <span style={{ fontSize: 16, color: T.muted }}>🔍</span>
        <input type="text" placeholder="Search transactions…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            fontSize: 15, fontWeight: 500, color: T.text
          }}
        />
        {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: T.muted, fontSize: 16 }}>✕</button>}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[{ id: "all", label: "All", emoji: "📋" }, { id: "expense", label: "Expenses", emoji: "💸" }, { id: "income", label: "Income", emoji: "💰" }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            flex: 1, padding: "10px 6px", borderRadius: 14, border: `1.5px solid ${filter === f.id ? T.accent : T.border}`,
            background: filter === f.id ? `${T.accent}15` : T.bg2,
            color: filter === f.id ? T.accent : T.sub, fontWeight: 700, fontSize: 12,
          }}>{f.emoji} {f.label}</button>
        ))}
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: "10px 12px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700 }}>SHOWING</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{filtered.length}</div>
        </div>
        <div style={{ flex: 1, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: "10px 12px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#FF6B6B", fontWeight: 700 }}>SPENT</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2, color: "#FF6B6B" }}>{inr(filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0))}</div>
        </div>
        <div style={{ flex: 1, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: "10px 12px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#22C55E", fontWeight: 700 }}>EARNED</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2, color: "#22C55E" }}>{inr(filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0))}</div>
        </div>
      </div>

      {/* Transaction List */}
      {grouped.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 20px", color: T.muted }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{search ? "No results found" : "No transactions yet"}</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>{search ? "Try a different search term" : "Add your first expense!"}
          </div>
        </div>
      ) : (
        grouped.map(([dateKey, dayTxns]) => {
          const dayTotal = dayTxns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
          return (
            <div key={dateKey} style={{ marginBottom: 14 }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 6, padding: "0 2px"
              }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.muted }}>{fmtDate(dayTxns[0].date).toUpperCase()}</span>
                {dayTotal > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B6B" }}>-{inr(dayTotal)}</span>}
              </div>
              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, overflow: "hidden" }}>
                {dayTxns.map((t, i) => {
                  const cat = t.type === "income"
                    ? INCOME_CATS.find(c => c.id === t.category) || INCOME_CATS[4]
                    : allCats.find(c => c.id === t.category) || { emoji: "📦", label: "Other", color: "#94A3B8" };
                  return (
                    <div key={t.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 14px",
                      borderBottom: i < dayTxns.length - 1 ? `1px solid ${T.border}` : "none"
                    }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 13, background: `${cat.color}20`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0
                      }}>
                        {cat.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.description}</div>
                        <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
                          {cat.label} · {fmtTime(t.date)}{t.isRecurring ? " · 🔁" : ""}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: t.type === "income" ? "#22C55E" : "#FF6B6B" }}>
                          {t.type === "income" ? "+" : "-"}{inr(t.amount)}
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 4, justifyContent: "flex-end" }}>
                          <button onClick={() => startEdit(t)} style={{
                            background: `${T.accent}18`, border: "none",
                            borderRadius: 8, padding: "3px 8px", color: T.accent, fontSize: 11, fontWeight: 700
                          }}>Edit</button>
                          <button onClick={() => deleteTxn(t.id)} style={{
                            background: "#EF444418", border: "none",
                            borderRadius: 8, padding: "3px 8px", color: "#EF4444", fontSize: 11, fontWeight: 700
                          }}>Del</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Edit Modal */}
      {editTxn && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200,
          display: "flex", alignItems: "flex-end", justifyContent: "center"
        }}
          onClick={e => { if (e.target === e.currentTarget) setEditTxn(null); }}>
          <div className="pop" style={{
            background: T.bg2, borderRadius: "24px 24px 0 0",
            padding: "24px 20px 40px", width: "100%", maxWidth: 540, border: `1px solid ${T.border}`
          }}>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 18 }}>✏️ Edit Transaction</div>

            {/* Type */}
            <div style={{ display: "flex", background: T.bg3, borderRadius: 14, padding: 3, marginBottom: 14 }}>
              {["expense", "income"].map(tp => (
                <button key={tp} onClick={() => { setEditType(tp); setEditCat(tp === "income" ? "salary" : "food"); }} style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: 11, fontWeight: 700, fontSize: 13,
                  background: editType === tp ? (tp === "expense" ? "#EF4444" : "#22C55E") : "transparent",
                  color: editType === tp ? "#fff" : T.muted, transition: "all 0.15s",
                }}>{tp === "expense" ? "💸 Expense" : "💚 Income"}</button>
              ))}
            </div>

            {/* Amount */}
            <div style={{
              background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: "12px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8
            }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: T.accent }}>₹</span>
              <input type="number" inputMode="decimal" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                autoFocus style={{
                  flex: 1, background: "none", border: "none", outline: "none",
                  fontSize: 26, fontWeight: 800, color: T.text, fontFamily: "'DM Mono',monospace"
                }}
              />
            </div>

            {/* Description */}
            <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)}
              style={{
                width: "100%", background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 14,
                padding: "13px 14px", fontSize: 15, fontWeight: 600, color: T.text, outline: "none", marginBottom: 14
              }}
            />

            {/* Category */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 18,
              maxHeight: 180, overflowY: "auto"
            }}>
              {editCats.map(c => (
                <button key={c.id} onClick={() => setEditCat(c.id)} style={{
                  padding: "8px 4px", borderRadius: 12,
                  border: `2px solid ${editCat === c.id ? c.color : T.border}`,
                  background: editCat === c.id ? `${c.color}18` : T.bg3,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                }}>
                  <span style={{ fontSize: 18 }}>{c.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: editCat === c.id ? c.color : T.sub, textAlign: "center" }}>{c.label}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditTxn(null)} style={{
                flex: 1, padding: "14px", borderRadius: 14, border: `1px solid ${T.border}`,
                background: T.bg3, color: T.sub, fontWeight: 700, fontSize: 15,
              }}>Cancel</button>
              <button onClick={saveEdit} style={{
                flex: 2, padding: "14px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#60A5FA,#3B82F6)",
                color: "#fff", fontWeight: 800, fontSize: 15,
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════
//  SETTINGS TAB
// ══════════════════════════════════════
function SettingsTab({ T, dark, setDark, setTxns, setBudgets, setCustomCats, showToast }) {
  function clearData() {
    if (window.confirm("⚠️ Are you sure you want to delete ALL your data? This cannot be undone.")) {
      setTxns([]);
      setBudgets({});
      setCustomCats([]);
      showToast("🗑️ All data deleted", "success");
    }
  }

  return (
    <div style={{ paddingTop: 18 }} className="fadein">
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, padding: "0 4px" }}>Settings</div>

      <div style={{ background: T.bg2, borderRadius: 18, border: `1px solid ${T.border}`, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontWeight: 600 }}>Theme</div>
          <button onClick={() => setDark(!dark)} style={{ background: T.bg3, border: `1px solid ${T.border}`, padding: '6px 12px', borderRadius: 8, color: T.text, fontWeight: 700 }}>
            {dark ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#EF4444' }}>Danger Zone</div>
            <div style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>Delete all transactions and budgets</div>
          </div>
          <button onClick={clearData} style={{ background: '#EF444415', color: '#EF4444', border: '1px solid #EF444440', padding: '6px 12px', borderRadius: 8, fontWeight: 700 }}>
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
}

// ── RENDER ──
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
