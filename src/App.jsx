import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, Search, Trash2, Pencil, Check, X, Calendar, Clock,
  ChevronDown, ChevronRight, Circle, CheckCircle2, Flag,
  ListChecks, Sparkles, Filter as FilterIcon, MoreHorizontal,
  Briefcase, User, BookOpen, Zap, CalendarDays, Save
} from "lucide-react";

/* ---------------------------------------------------------
   Design tokens (see inline <style> for font imports)
   bg      : #0a0d14 -> #10131c gradient, near-black w/ blue tint
   glass   : white/[0.03] surfaces, white/[0.08] hairline borders
   accent  : emerald (done/progress), violet (brand/focus ring)
   priority: rose (high) / amber (medium) / sky (low)
--------------------------------------------------------- */

const CATEGORIES = [
  { id: "work", label: "Work", icon: Briefcase, color: "text-indigo-300", ring: "ring-indigo-500/30", bg: "bg-indigo-500/10", dot: "bg-indigo-400" },
  { id: "personal", label: "Personal", icon: User, color: "text-emerald-300", ring: "ring-emerald-500/30", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  { id: "study", label: "Study", icon: BookOpen, color: "text-cyan-300", ring: "ring-cyan-500/30", bg: "bg-cyan-500/10", dot: "bg-cyan-400" },
  { id: "urgent", label: "Urgent", icon: Zap, color: "text-rose-300", ring: "ring-rose-500/30", bg: "bg-rose-500/10", dot: "bg-rose-400" },
];

const PRIORITIES = [
  { id: "high", label: "High", color: "text-rose-300", bg: "bg-rose-500/10", border: "border-rose-500/30", dot: "bg-rose-400" },
  { id: "medium", label: "Medium", color: "text-amber-300", bg: "bg-amber-500/10", border: "border-amber-500/30", dot: "bg-amber-400" },
  { id: "low", label: "Low", color: "text-sky-300", bg: "bg-sky-500/10", border: "border-sky-500/30", dot: "bg-sky-400" },
];

const QUOTES = [
  "A clear list makes for a clear mind.",
  "Small steps, done daily, move mountains.",
  "Nothing pending. Nothing pulling at you.",
  "The best time to start was earlier. The next best time is now.",
  "Discipline is choosing what you want most over what you want now.",
];

const uid = () => Math.random().toString(36).slice(2, 10);
const todayISO = () => new Date().toISOString().slice(0, 10);

const seedTasks = () => [
  {
    id: uid(),
    title: "Finalize Q3 investor deck",
    notes: "Focus on the retention slide, add the new cohort chart.",
    priority: "high",
    category: "work",
    dueDate: todayISO(),
    dueTime: "17:00",
    completed: false,
    createdAt: Date.now() - 400000,
    subtasks: [
      { id: uid(), title: "Update revenue chart", completed: true },
      { id: uid(), title: "Proofread narrative", completed: false },
      { id: uid(), title: "Send to design for polish", completed: false },
    ],
  },
  {
    id: uid(),
    title: "Morning run — 5k",
    notes: "",
    priority: "low",
    category: "personal",
    dueDate: todayISO(),
    dueTime: "07:00",
    completed: true,
    createdAt: Date.now() - 900000,
    subtasks: [],
  },
  {
    id: uid(),
    title: "Read chapter 4 — Linear Algebra",
    notes: "Eigenvectors & diagonalization.",
    priority: "medium",
    category: "study",
    dueDate: todayISO(),
    dueTime: "20:00",
    completed: false,
    createdAt: Date.now() - 250000,
    subtasks: [
      { id: uid(), title: "Work through practice set", completed: false },
    ],
  },
  {
    id: uid(),
    title: "Renew passport",
    notes: "Appointment slots open Monday 9am.",
    priority: "high",
    category: "urgent",
    dueDate: "",
    dueTime: "",
    completed: false,
    createdAt: Date.now() - 100000,
    subtasks: [],
  },
];

const STORAGE_KEY = "classy-todo:tasks:v1";

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedTasks();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : seedTasks();
  } catch {
    return seedTasks();
  }
}

function useDebounced(value, delay = 150) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function categoryMeta(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}
function priorityMeta(id) {
  return PRIORITIES.find((p) => p.id === id) || PRIORITIES[1];
}

function formatDue(dateStr, timeStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d - today) / 86400000);
  let label;
  if (diffDays === 0) label = "Today";
  else if (diffDays === 1) label = "Tomorrow";
  else if (diffDays === -1) label = "Yesterday";
  else
    label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return { label, overdue: diffDays < 0, timeStr: timeStr || null };
}

/* ---------------------------- Progress ring ---------------------------- */
function ProgressRing({ pct, size = 56 }) {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-white/[0.06]" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke="url(#ringGrad)" strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-semibold text-zinc-100 tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}

/* ------------------------------ Task Editor ----------------------------- */
function TaskEditor({ initial, onCancel, onSave, autoFocus }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [priority, setPriority] = useState(initial?.priority ?? "medium");
  const [category, setCategory] = useState(initial?.category ?? "work");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [dueTime, setDueTime] = useState(initial?.dueTime ?? "");
  const [subtasks, setSubtasks] = useState(initial?.subtasks ?? []);
  const [subtaskDraft, setSubtaskDraft] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const addSubtask = () => {
    const t = subtaskDraft.trim();
    if (!t) return;
    setSubtasks((s) => [...s, { id: uid(), title: t, completed: false }]);
    setSubtaskDraft("");
  };

  const submit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      notes: notes.trim(),
      priority,
      category,
      dueDate,
      dueTime,
      subtasks,
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] animate-[fadeIn_.18s_ease-out]">
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()}
        placeholder="What needs to get done?"
        className="w-full bg-transparent text-[15px] sm:text-base text-zinc-100 placeholder:text-zinc-500 outline-none font-medium"
      />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add a note (optional)"
        rows={1}
        className="mt-2 w-full resize-none bg-transparent text-sm text-zinc-400 placeholder:text-zinc-600 outline-none"
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {/* Priority */}
        <div className="flex items-center gap-1 rounded-lg bg-black/20 p-1 border border-white/[0.06]">
          {PRIORITIES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPriority(p.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                priority === p.id ? `${p.bg} ${p.color} ring-1 ${p.border}` : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${p.dot} mr-1.5 align-middle`} />
              {p.label}
            </button>
          ))}
        </div>

        {/* Category */}
        <div className="flex items-center gap-1 rounded-lg bg-black/20 p-1 border border-white/[0.06]">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 flex items-center gap-1 ${
                  category === c.id ? `${c.bg} ${c.color} ring-1 ${c.ring}` : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon size={12} />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 rounded-lg bg-black/20 border border-white/[0.06] px-2.5 py-1.5 text-xs text-zinc-400 focus-within:ring-1 focus-within:ring-violet-500/40">
          <Calendar size={13} className="text-zinc-500" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-transparent outline-none text-zinc-300 [color-scheme:dark]"
          />
        </label>
        <label className="flex items-center gap-1.5 rounded-lg bg-black/20 border border-white/[0.06] px-2.5 py-1.5 text-xs text-zinc-400 focus-within:ring-1 focus-within:ring-violet-500/40">
          <Clock size={13} className="text-zinc-500" />
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="bg-transparent outline-none text-zinc-300 [color-scheme:dark]"
          />
        </label>
      </div>

      {/* Subtasks */}
      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
          <ListChecks size={13} />
          Subtasks
        </div>
        <div className="space-y-1.5">
          {subtasks.map((s) => (
            <div key={s.id} className="flex items-center gap-2 group">
              <button
                type="button"
                onClick={() =>
                  setSubtasks((arr) => arr.map((x) => (x.id === s.id ? { ...x, completed: !x.completed } : x)))
                }
                className="text-zinc-500 hover:text-emerald-400 transition-colors"
              >
                {s.completed ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Circle size={15} />}
              </button>
              <span className={`text-sm flex-1 ${s.completed ? "text-zinc-600 line-through" : "text-zinc-300"}`}>
                {s.title}
              </span>
              <button
                type="button"
                onClick={() => setSubtasks((arr) => arr.filter((x) => x.id !== s.id))}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-400 transition-all"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input
            value={subtaskDraft}
            onChange={(e) => setSubtaskDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubtask())}
            placeholder="Add a subtask and press Enter"
            className="flex-1 bg-black/20 border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-violet-500/40"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3.5 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!title.trim()}
          className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-emerald-500/90 text-emerald-950 hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500/90 transition-colors flex items-center gap-1.5 shadow-[0_0_20px_rgba(52,211,153,0.15)]"
        >
          <Save size={14} />
          {initial ? "Save changes" : "Add task"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- Task card ------------------------------ */
function TaskCard({ task, onToggle, onDelete, onEdit, onToggleSubtask, editing, onStartEdit, onCancelEdit, onSaveEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pr = priorityMeta(task.priority);
  const cat = categoryMeta(task.category);
  const CatIcon = cat.icon;
  const due = formatDue(task.dueDate, task.dueTime);
  const subDone = task.subtasks.filter((s) => s.completed).length;
  const hasSubs = task.subtasks.length > 0;

  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 2500);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  if (editing) {
    return <TaskEditor initial={task} onCancel={onCancelEdit} onSave={onSaveEdit} autoFocus />;
  }

  return (
    <div
      className={`group rounded-2xl border backdrop-blur-xl transition-all duration-300 ${
        task.completed
          ? "border-white/[0.05] bg-white/[0.015]"
          : "border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.05] hover:border-white/[0.12]"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 shrink-0 transition-all duration-200 ${
            task.completed ? "text-emerald-400" : "text-zinc-600 hover:text-emerald-400 hover:scale-110"
          }`}
        >
          {task.completed ? <CheckCircle2 size={21} /> : <Circle size={21} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-[15px] leading-snug font-medium break-words transition-colors ${
                task.completed ? "text-zinc-600 line-through" : "text-zinc-100"
              }`}
            >
              {task.title}
            </p>
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <button
                onClick={() => onStartEdit(task.id)}
                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors"
                aria-label="Edit"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => (confirmDelete ? onDelete(task.id) : setConfirmDelete(true))}
                className={`p-1.5 rounded-md transition-colors ${
                  confirmDelete ? "text-rose-300 bg-rose-500/15" : "text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10"
                }`}
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {task.notes && !task.completed && (
            <p className="mt-1 text-[13px] text-zinc-500 leading-relaxed line-clamp-2">{task.notes}</p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1 rounded-md border ${pr.border} ${pr.bg} ${pr.color} px-1.5 py-0.5 text-[11px] font-medium`}>
              <Flag size={10} />
              {pr.label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-md ${cat.bg} ${cat.color} px-1.5 py-0.5 text-[11px] font-medium`}>
              <CatIcon size={10} />
              {cat.label}
            </span>
            {due && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${
                  due.overdue && !task.completed ? "bg-rose-500/10 text-rose-300" : "bg-white/[0.05] text-zinc-400"
                }`}
              >
                <CalendarDays size={10} />
                {due.label}
                {due.timeStr && ` · ${due.timeStr}`}
              </span>
            )}
            {hasSubs && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] text-zinc-400 hover:text-zinc-200 px-1.5 py-0.5 text-[11px] font-medium transition-colors"
              >
                {expanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                <ListChecks size={10} />
                {subDone}/{task.subtasks.length}
              </button>
            )}
          </div>

          {hasSubs && expanded && (
            <div className="mt-3 space-y-1.5 border-l border-white/[0.08] pl-3">
              {task.subtasks.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onToggleSubtask(task.id, s.id)}
                  className="flex items-center gap-2 w-full text-left group/sub"
                >
                  {s.completed ? (
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Circle size={14} className="text-zinc-600 group-hover/sub:text-zinc-400 shrink-0" />
                  )}
                  <span className={`text-[13px] ${s.completed ? "text-zinc-600 line-through" : "text-zinc-400"}`}>
                    {s.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Empty state --------------------------------- */
function EmptyState({ filter, search }) {
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [filter, search]);
  let heading = "Nothing here";
  if (search) heading = `No tasks match "${search}"`;
  else if (filter === "completed") heading = "Nothing completed yet";
  else if (filter === "active") heading = "You're all caught up";
  else if (filter === "high") heading = "No high priority fires";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
        <Sparkles className="text-violet-300" size={22} />
      </div>
      <p className="text-zinc-300 font-medium text-[15px]">{heading}</p>
      <p className="text-zinc-500 text-sm mt-1.5 max-w-xs italic">{quote}</p>
    </div>
  );
}

/* ------------------------------------ App ------------------------------------ */
export default function TodoApp() {
  const [tasks, setTasks] = useState(loadTasks);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounced(search, 150);
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | completed | high
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Persist to localStorage whenever tasks change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      /* storage unavailable (e.g. private browsing) — fail silently */
    }
  }, [tasks]);

  const addTask = (data) => {
    setTasks((t) => [
      { id: uid(), completed: false, createdAt: Date.now(), ...data },
      ...t,
    ]);
    setComposerOpen(false);
  };

  const saveEdit = (id, data) => {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, ...data } : x)));
    setEditingId(null);
  };

  const toggleTask = (id) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, completed: !x.completed } : x)));

  const toggleSubtask = (taskId, subId) =>
    setTasks((t) =>
      t.map((x) =>
        x.id === taskId
          ? { ...x, subtasks: x.subtasks.map((s) => (s.id === subId ? { ...s, completed: !s.completed } : s)) }
          : x
      )
    );

  const deleteTask = (id) => setTasks((t) => t.filter((x) => x.id !== id));
  const clearCompleted = () => setTasks((t) => t.filter((x) => !x.completed));

  const filtered = useMemo(() => {
    let list = tasks;
    if (categoryFilter !== "all") list = list.filter((t) => t.category === categoryFilter);
    if (statusFilter === "active") list = list.filter((t) => !t.completed);
    else if (statusFilter === "completed") list = list.filter((t) => t.completed);
    else if (statusFilter === "high") list = list.filter((t) => t.priority === "high" && !t.completed);
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return b.createdAt - a.createdAt;
    });
  }, [tasks, statusFilter, categoryFilter, debouncedSearch]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const activeCount = total - done;
    const highCount = tasks.filter((t) => t.priority === "high" && !t.completed).length;
    return { total, done, pct, activeCount, highCount };
  }, [tasks]);

  const statusPills = [
    { id: "all", label: "All", count: tasks.length },
    { id: "active", label: "Active", count: stats.activeCount },
    { id: "completed", label: "Completed", count: stats.done },
    { id: "high", label: "High priority", count: stats.highCount },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0a0d14] text-zinc-100 relative overflow-x-hidden">
      {/* ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[36rem] h-[36rem] bg-emerald-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-violet-500/[0.06] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-50">
              Today's Focus
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {stats.activeCount === 0 && stats.total > 0
                ? "Everything's done — take a breath."
                : `${stats.activeCount} task${stats.activeCount === 1 ? "" : "s"} left to close out`}
            </p>
          </div>
          <ProgressRing pct={stats.pct} />
        </header>

        {/* overall progress bar */}
        <div className="mb-6">
          <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-violet-400 transition-[width] duration-700 ease-out"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>

        {/* Search + add */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 outline-none focus:ring-1 focus:ring-violet-500/40 focus:border-violet-500/30 transition-all"
            />
          </div>
          {!composerOpen && (
            <button
              onClick={() => { setComposerOpen(true); setEditingId(null); }}
              className="shrink-0 flex items-center gap-1.5 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-emerald-950 font-medium text-sm px-4 py-2.5 transition-colors shadow-[0_0_20px_rgba(52,211,153,0.15)]"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Add task</span>
            </button>
          )}
        </div>

        {/* Composer */}
        {composerOpen && (
          <div className="mb-4">
            <TaskEditor onCancel={() => setComposerOpen(false)} onSave={addTask} autoFocus />
          </div>
        )}

        {/* Status pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-3 [scrollbar-width:none]">
          {statusPills.map((p) => (
            <button
              key={p.id}
              onClick={() => setStatusFilter(p.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all duration-150 ${
                statusFilter === p.id
                  ? "bg-white/[0.09] border-white/[0.16] text-zinc-100"
                  : "bg-transparent border-white/[0.06] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12]"
              }`}
            >
              {p.label}
              <span className={`text-[10px] px-1 rounded-full ${statusFilter === p.id ? "bg-white/[0.12]" : "bg-white/[0.05]"}`}>
                {p.count}
              </span>
            </button>
          ))}
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-6 [scrollbar-width:none]">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
              categoryFilter === "all" ? "text-zinc-200 bg-white/[0.07]" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <FilterIcon size={11} />
            All categories
          </button>
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`shrink-0 flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                  categoryFilter === c.id ? `${c.bg} ${c.color}` : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon size={11} />
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Task list */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <EmptyState filter={statusFilter} search={debouncedSearch} />
          ) : (
            filtered.map((task) => (
              <div key={task.id} className="task-enter">
                <TaskCard
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                  onToggleSubtask={toggleSubtask}
                  editing={editingId === task.id}
                  onStartEdit={setEditingId}
                  onCancelEdit={() => setEditingId(null)}
                  onSaveEdit={(data) => saveEdit(task.id, data)}
                />
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {stats.done > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={clearCompleted}
              className="text-xs text-zinc-500 hover:text-rose-300 transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={12} />
              Clear {stats.done} completed
            </button>
          </div>
        )}

        <p className="text-center text-[11px] text-zinc-700 mt-10">
          {stats.total} total · {stats.done} done · {stats.total - stats.done} remaining
        </p>
      </div>
    </div>
  );
}
