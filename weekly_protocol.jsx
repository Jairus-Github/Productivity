import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Bell, Trash2, Check, X, Lock, Flame, Pencil, Undo2, AlertTriangle, Dumbbell } from "lucide-react";

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const JS_DAY_TO_NAME = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CATS = {
  class: { label: "Class", color: "#8291A8" },
  gym: { label: "Physique", color: "#F5A623" },
  cyber: { label: "Cybersecurity", color: "#4FD8E8" },
  study: { label: "BSIT Study", color: "#6E8FFF" },
  va: { label: "VA / Income", color: "#5FD98A" },
  gf: { label: "Girlfriend / LDR", color: "#FF4F8B" },
};

const DAY_TAGS = {
  Mon: "No class · deep work day",
  Tue: "Classes 7:00–4:30",
  Wed: "Classes 8:30–12:30",
  Thu: "PATHFit + classes 11:30–3:00",
  Fri: "Classes 7:00–2:00",
  Sat: "Free until 2 · NSTP 2–5",
  Sun: "Girlfriend day · protected",
};

// Fixed weekly schedule — pulled from the actual class timetable. Same every week, locked (not user-editable in this view).
const FIXED_SCHEDULE = [
  { id: "f1", day: "Tue", start: "07:00", end: "08:30", title: "GEd 101", room: "OL", cat: "class" },
  { id: "f2", day: "Tue", start: "08:30", end: "10:00", title: "GEd 102", room: "OL", cat: "class" },
  { id: "f3", day: "Tue", start: "10:00", end: "11:30", title: "MATH 101", room: "OL", cat: "class" },
  { id: "f4", day: "Tue", start: "14:30", end: "16:30", title: "CC 101", room: "OL", cat: "class" },

  { id: "f5", day: "Wed", start: "08:30", end: "10:00", title: "GEd 102", room: "103", cat: "class" },
  { id: "f6", day: "Wed", start: "10:00", end: "12:30", title: "CC 100", room: "LAB 3", cat: "class" },

  { id: "f7", day: "Thu", start: "08:00", end: "09:30", title: "PATHFit 1", room: "GYM", cat: "gym" },
  { id: "f8", day: "Thu", start: "11:30", end: "12:30", title: "GEd 105", room: "101", cat: "class" },
  { id: "f9", day: "Thu", start: "13:00", end: "15:00", title: "CC 101", room: "LAB 3", cat: "class" },

  { id: "f10", day: "Fri", start: "07:00", end: "08:00", title: "GEd 105", room: "101", cat: "class" },
  { id: "f11", day: "Fri", start: "08:00", end: "09:00", title: "GEd 101", room: "101", cat: "class" },
  { id: "f12", day: "Fri", start: "10:00", end: "11:00", title: "CC 100", room: "102", cat: "class" },
  { id: "f13", day: "Fri", start: "13:00", end: "14:00", title: "MATH 101", room: "101", cat: "class" },

  { id: "f14", day: "Sat", start: "14:00", end: "17:00", title: "NSTP", room: "", cat: "class" },
];

// Routines built around your actual kit: resistance band(s), push-up handles, an ab roller —
// no pull-up bar, no free weights. Matched to the gym tasks below by keyword in the title.
const WORKOUTS = {
  push: {
    label: "Push Day",
    match: ["push"],
    focus: "Chest · shoulders · triceps",
    equipment: "Push-up handles + band",
    exercises: [
      { name: "Handle push-ups", sets: "4 x 10–15", note: "Deeper range than flat-hand push-ups — squeeze chest at the top." },
      { name: "Wide push-ups (on handles)", sets: "3 x 10–12", note: "Hands wider than shoulders, targets outer chest." },
      { name: "Diamond push-ups (on floor)", sets: "3 x 8–12", note: "Hands close together under chest, hits triceps hard." },
      { name: "Band standing chest press", sets: "3 x 12–15", note: "Anchor band behind you at chest height, press forward." },
      { name: "Band overhead press", sets: "3 x 12–15", note: "Stand on the band, press straight overhead." },
      { name: "Band tricep pushdown", sets: "3 x 15", note: "Anchor band high, elbows pinned to sides." },
      { name: "Pike push-ups (handles or floor)", sets: "3 x 8–12", note: "Hips high, targets shoulders like an overhead press." },
      { name: "Ab roller — kneeling rollout", sets: "3 x 8–10", note: "Finisher. Keep core braced, don't let hips sag." },
    ],
  },
  pull: {
    label: "Pull Day",
    match: ["pull"],
    focus: "Back · biceps · rear delts",
    equipment: "Band only",
    exercises: [
      { name: "Band bent-over rows", sets: "4 x 12–15", note: "Stand on band, hinge forward, row to hips." },
      { name: "Band single-arm rows", sets: "3 x 12 each side", note: "Anchor under foot, control the negative." },
      { name: "Band pull-aparts", sets: "3 x 15–20", note: "Arms straight out front, pull band apart at chest height." },
      { name: "Band face pulls", sets: "3 x 15", note: "Anchor at head height, pull to face — great for posture." },
      { name: "Band bicep curls", sets: "3 x 12–15", note: "Stand on band, elbows pinned to sides." },
      { name: "Superman holds", sets: "3 x 20–30 sec", note: "No bar needed — bodyweight substitute for lat/lower-back work." },
      { name: "Band deadlift-to-row combo", sets: "3 x 10", note: "Stand on band, hinge to deadlift, then row at the top." },
    ],
  },
  legs: {
    label: "Legs Day",
    match: ["leg"],
    focus: "Quads · hamstrings · glutes",
    equipment: "Band + bodyweight",
    exercises: [
      { name: "Band squats", sets: "4 x 15–20", note: "Band under feet, up over shoulders — adds resistance to bodyweight squats." },
      { name: "Band Romanian deadlifts", sets: "3 x 12–15", note: "Stand on band, hinge at hips, feel the hamstring stretch." },
      { name: "Bulgarian split squats", sets: "3 x 10 each leg", note: "Rear foot up on a chair/bed — no bar needed, bodyweight is enough." },
      { name: "Band lateral walks", sets: "3 x 15 steps each way", note: "Band around ankles or knees, stay low." },
      { name: "Band glute bridges", sets: "3 x 15–20", note: "Band above knees, drive hips up and squeeze." },
      { name: "Calf raises", sets: "4 x 20", note: "Bodyweight, slow and controlled — add band tension if easy." },
    ],
  },
  upper: {
    label: "Upper Body Day",
    match: ["upper"],
    focus: "Full upper body combo",
    equipment: "Handles + band + ab roller",
    exercises: [
      { name: "Handle push-ups", sets: "3 x 12", note: "Chest/triceps." },
      { name: "Band rows", sets: "3 x 12–15", note: "Back — anchor under feet." },
      { name: "Band overhead press", sets: "3 x 12", note: "Shoulders." },
      { name: "Band curls", sets: "3 x 12", note: "Biceps." },
      { name: "Pike push-ups", sets: "3 x 8–10", note: "Shoulders/triceps." },
      { name: "Ab roller rollout", sets: "3 x 8–10", note: "Core finisher — go standing-roll once kneeling feels easy." },
    ],
  },
  core: {
    label: "Core Finisher",
    match: ["core", "ab"],
    focus: "Core / abs — pairs well after any day",
    equipment: "Ab roller + band",
    exercises: [
      { name: "Ab roller kneeling rollout", sets: "4 x 8–12", note: "The centerpiece move — control the return, don't let your back sag." },
      { name: "Band woodchoppers", sets: "3 x 12 each side", note: "Anchor band low or high, rotate through the core." },
      { name: "Plank", sets: "3 x 30–45 sec", note: "Straight line from shoulders to heels." },
      { name: "Bicycle crunches", sets: "3 x 20", note: "Slow and controlled beats fast and sloppy." },
    ],
  },
};
function findWorkout(title) {
  const t = (title || "").toLowerCase();
  return Object.values(WORKOUTS).find((w) => w.match.some((m) => t.includes(m))) || null;
}

const DEFAULT_TASKS = [
  { id: "d1", day: "Mon", time: "06:00", dur: 60, title: "Gym — Push day", cat: "gym", notify: true },
  { id: "d2", day: "Mon", time: "07:15", dur: 15, title: "Good morning text → GF", cat: "gf", notify: true },
  { id: "d3", day: "Mon", time: "08:00", dur: 180, title: "Deep work: BSIT projects", cat: "study", notify: false },
  { id: "d4", day: "Mon", time: "13:00", dur: 120, title: "Cybersecurity cert study", cat: "cyber", notify: true },
  { id: "d5", day: "Mon", time: "15:00", dur: 120, title: "VA outreach — prospecting", cat: "va", notify: false },
  { id: "d6", day: "Mon", time: "21:00", dur: 15, title: "Good night call → GF", cat: "gf", notify: true },

  { id: "d7", day: "Tue", time: "06:45", dur: 15, title: "Morning text → GF", cat: "gf", notify: true },
  { id: "d10", day: "Tue", time: "16:30", dur: 60, title: "Gym — Pull day", cat: "gym", notify: true },
  { id: "d11", day: "Tue", time: "19:00", dur: 60, title: "Cybersecurity practice", cat: "cyber", notify: true },
  { id: "d12", day: "Tue", time: "21:00", dur: 15, title: "Good night text → GF", cat: "gf", notify: true },

  { id: "d13", day: "Wed", time: "08:00", dur: 15, title: "Morning text → GF", cat: "gf", notify: true },
  { id: "d15", day: "Wed", time: "14:30", dur: 60, title: "VA / income work", cat: "va", notify: true },
  { id: "d16", day: "Wed", time: "16:00", dur: 90, title: "Gym — Legs day", cat: "gym", notify: true },
  { id: "d17", day: "Wed", time: "21:00", dur: 15, title: "Good night text → GF", cat: "gf", notify: true },

  { id: "d18", day: "Thu", time: "07:45", dur: 15, title: "Morning text → GF", cat: "gf", notify: true },
  { id: "d20b", day: "Thu", time: "15:00", dur: 60, title: "Same-day review", cat: "study", notify: false },
  { id: "d21", day: "Thu", time: "16:00", dur: 90, title: "Cybersecurity cert study", cat: "cyber", notify: true },
  { id: "d22", day: "Thu", time: "21:00", dur: 15, title: "Good night text → GF", cat: "gf", notify: true },

  { id: "d23", day: "Fri", time: "06:45", dur: 15, title: "Morning text → GF", cat: "gf", notify: true },
  { id: "d25", day: "Fri", time: "15:00", dur: 90, title: "Gym — Upper body", cat: "gym", notify: true },
  { id: "d26", day: "Fri", time: "16:30", dur: 90, title: "VA / income — deep work", cat: "va", notify: true },
  { id: "d27", day: "Fri", time: "20:00", dur: 30, title: "Video call → GF (low-key)", cat: "gf", notify: true },

  { id: "d28", day: "Sat", time: "07:00", dur: 15, title: "Morning text → GF", cat: "gf", notify: true },
  { id: "d29", day: "Sat", time: "08:00", dur: 210, title: "Cybersecurity — CTFs / labs", cat: "cyber", notify: true },
  { id: "d31", day: "Sat", time: "19:00", dur: 120, title: "VA / income (if energy allows)", cat: "va", notify: false },
  { id: "d32b", day: "Sat", time: "21:30", dur: 15, title: "Good night text → GF", cat: "gf", notify: true },

  { id: "d32", day: "Sun", time: "08:00", dur: 15, title: "Morning text → GF", cat: "gf", notify: true },
  { id: "d33", day: "Sun", time: "09:00", dur: 45, title: "Light cert review / week planning", cat: "cyber", notify: false },
  { id: "d34", day: "Sun", time: "11:00", dur: 180, title: "VA / income (capped)", cat: "va", notify: false },
  { id: "d35", day: "Sun", time: "19:00", dur: 120, title: "Video call date — no work", cat: "gf", notify: true },
];

const GRID_START_MIN = 6 * 60; // 6:00 AM
const GRID_END_MIN = 22 * 60; // 10:00 PM
const HOUR_HEIGHT = 56; // px per hour

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function minutesToLabel(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? ":" + String(m).padStart(2, "0") : ""} ${ampm}`;
}
// Monday-anchored week key — completion state naturally resets every week without any cleanup job.
function getWeekKey(date) {
  const d = new Date(date);
  const dow = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - dow);
  return d.toISOString().slice(0, 10);
}
function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export default function WeeklyProtocol() {
  const [tasks, setTasks] = useState(null);
  const [doneMap, setDoneMap] = useState({}); // { [weekKey]: { [itemId]: true } }
  const [loaded, setLoaded] = useState(false);
  const todayName = JS_DAY_TO_NAME[new Date().getDay()];
  const [activeDay, setActiveDay] = useState(DAY_ORDER.includes(todayName) ? todayName : "Mon");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [undoBuffer, setUndoBuffer] = useState(null); // { task, timeoutId }
  const [notifPermission, setNotifPermission] = useState("default");
  const [activeWorkout, setActiveWorkout] = useState(null); // workout object being viewed, or null
  const [showLibrary, setShowLibrary] = useState(false);
  const [now, setNow] = useState(new Date());
  const firedRef = useRef(new Set());
  const gridRef = useRef(null);
  const scrolledRef = useRef(false);
  const [form, setForm] = useState({ day: "Mon", time: "08:00", dur: 30, title: "", cat: "study", notify: true });

  const weekKey = useMemo(() => getWeekKey(now), [now]);
  const doneSet = doneMap[weekKey] || {};

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("tasks", false);
        setTasks(result && result.value ? JSON.parse(result.value) : DEFAULT_TASKS);
      } catch (e) {
        setTasks(DEFAULT_TASKS);
      }
      try {
        const result = await window.storage.get("doneMap", false);
        setDoneMap(result && result.value ? JSON.parse(result.value) : {});
      } catch (e) {
        setDoneMap({});
      }
      setLoaded(true);
    })();
    try {
      if (typeof Notification !== "undefined") setNotifPermission(Notification.permission);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!loaded || tasks === null) return;
    (async () => {
      try {
        await window.storage.set("tasks", JSON.stringify(tasks), false);
      } catch (e) {
        console.error("Storage save failed", e);
      }
    })();
  }, [tasks, loaded]);

  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try {
        // Keep only the last few weeks so this doesn't grow forever.
        const keys = Object.keys(doneMap).sort().slice(-6);
        const trimmed = {};
        keys.forEach((k) => (trimmed[k] = doneMap[k]));
        await window.storage.set("doneMap", JSON.stringify(trimmed), false);
      } catch (e) {
        console.error("Storage save failed", e);
      }
    })();
  }, [doneMap, loaded]);

  // Clock tick every 30s — drives current-time line + notification checks
  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    if (!tasks) return;
    const nowDayName = JS_DAY_TO_NAME[now.getDay()];
    const nowMin = now.getHours() * 60 + now.getMinutes();
    tasks.forEach((t) => {
      if (t.day !== nowDayName || !t.notify || doneSet[t.id]) return;
      const taskMin = timeToMinutes(t.time);
      const key = `${t.id}-${now.toDateString()}`;
      if (Math.abs(nowMin - taskMin) <= 1 && !firedRef.current.has(key)) {
        firedRef.current.add(key);
        pushToast(t.time, t.title, t.cat);
      }
    });
    FIXED_SCHEDULE.forEach((f) => {
      if (f.day !== nowDayName) return;
      const startMin = timeToMinutes(f.start);
      const key = `${f.id}-${now.toDateString()}`;
      if (Math.abs(nowMin - startMin) <= 1 && !firedRef.current.has(key)) {
        firedRef.current.add(key);
        pushToast(f.start, f.title, f.cat);
      }
    });
  }, [now, tasks]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll the grid to "now" the first time today's view loads.
  useEffect(() => {
    if (!loaded || scrolledRef.current) return;
    if (activeDay !== todayName || !gridRef.current) return;
    const nowMinToday = now.getHours() * 60 + now.getMinutes();
    if (nowMinToday < GRID_START_MIN || nowMinToday > GRID_END_MIN) return;
    const top = ((nowMinToday - GRID_START_MIN) / 60) * HOUR_HEIGHT;
    gridRef.current.scrollTop = Math.max(top - 120, 0);
    scrolledRef.current = true;
  }, [loaded, activeDay, todayName, now]);

  function pushToast(time, title, cat) {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, time, title, cat, kind: "reminder" }]);
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Weekly Protocol", { body: `${time} — ${title}` });
      }
    } catch (e) {}
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 8000);
  }

  async function requestNotifPermission() {
    try {
      if (typeof Notification !== "undefined") {
        const perm = await Notification.requestPermission();
        setNotifPermission(perm);
      }
    } catch (e) {}
  }

  function findConflict(day, time, dur, ignoreId) {
    const start = timeToMinutes(time);
    const end = start + Number(dur || 30);
    const fixedHit = FIXED_SCHEDULE.find(
      (f) => f.day === day && overlaps(start, end, timeToMinutes(f.start), timeToMinutes(f.end))
    );
    if (fixedHit) return `Overlaps locked class: ${fixedHit.title} (${fixedHit.start}–${fixedHit.end})`;
    const taskHit = (tasks || []).find(
      (t) => t.day === day && t.id !== ignoreId && overlaps(start, end, timeToMinutes(t.time), timeToMinutes(t.time) + (t.dur || 30))
    );
    if (taskHit) return `Overlaps existing task: ${taskHit.title} (${taskHit.time})`;
    return null;
  }

  const formConflict = useMemo(
    () => findConflict(form.day, form.time, form.dur, editingId),
    [form.day, form.time, form.dur, editingId, tasks]
  );

  function openNewForm() {
    setEditingId(null);
    setForm({ day: activeDay, time: "08:00", dur: 30, title: "", cat: "study", notify: true });
    setShowForm(true);
  }
  function openEditForm(task) {
    setEditingId(task.id);
    setForm({ day: task.day, time: task.time, dur: task.dur || 30, title: task.title, cat: task.cat, notify: task.notify });
    setShowForm(true);
  }

  function submitForm(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editingId) {
      setTasks((prev) => prev.map((t) => (t.id === editingId ? { ...t, ...form, title: form.title.trim() } : t)));
    } else {
      setTasks((prev) => [
        ...prev,
        { id: Math.random().toString(36).slice(2), day: form.day, time: form.time, dur: Number(form.dur) || 30, title: form.title.trim(), cat: form.cat, notify: form.notify },
      ]);
    }
    setShowForm(false);
    setEditingId(null);
    setActiveDay(form.day);
  }

  function toggleDone(id) {
    setDoneMap((prev) => {
      const week = { ...(prev[weekKey] || {}) };
      if (week[id]) delete week[id];
      else week[id] = true;
      return { ...prev, [weekKey]: week };
    });
  }

  function deleteTask(task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    if (undoBuffer) clearTimeout(undoBuffer.timeoutId);
    const timeoutId = setTimeout(() => setUndoBuffer(null), 6000);
    setUndoBuffer({ task, timeoutId });
  }
  function undoDelete() {
    if (!undoBuffer) return;
    clearTimeout(undoBuffer.timeoutId);
    setTasks((prev) => [...prev, undoBuffer.task]);
    setUndoBuffer(null);
  }

  const fixedForDay = useMemo(() => FIXED_SCHEDULE.filter((f) => f.day === activeDay), [activeDay]);
  const tasksForDay = useMemo(() => (tasks || []).filter((t) => t.day === activeDay), [tasks, activeDay]);

  const dayProgress = useMemo(() => {
    if (!tasksForDay.length) return null;
    const done = tasksForDay.filter((t) => doneSet[t.id]).length;
    return { done, total: tasksForDay.length, pct: Math.round((done / tasksForDay.length) * 100) };
  }, [tasksForDay, doneSet]);

  const weekStats = useMemo(() => {
    if (!tasks) return {};
    const stats = {};
    Object.keys(CATS).forEach((c) => (stats[c] = { total: 0, done: 0 }));
    tasks.forEach((t) => {
      stats[t.cat].total += 1;
      if (doneSet[t.id]) stats[t.cat].done += 1;
    });
    return stats;
  }, [tasks, doneSet]);

  // Current streak: consecutive days up to (and including, if fully done) today where every
  // flexible task for that day was completed, walking backward through stored weekly done-maps.
  const streak = useMemo(() => {
    if (!tasks) return 0;
    let count = 0;
    const cursor = new Date(now);
    for (let i = 0; i < 60; i++) {
      const dName = JS_DAY_TO_NAME[cursor.getDay()];
      const wk = getWeekKey(cursor);
      const dayTasks = tasks.filter((t) => t.day === dName);
      if (dayTasks.length) {
        const wDone = doneMap[wk] || {};
        const allDone = dayTasks.every((t) => wDone[t.id]);
        const isFutureOrTodayIncomplete = i === 0 && !allDone;
        if (isFutureOrTodayIncomplete) {
          // today doesn't break the streak yet, it's just not counted — skip and keep checking yesterday
        } else if (!allDone) {
          break;
        } else {
          count += 1;
        }
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [tasks, doneMap, now]);

  const hourMarks = [];
  for (let m = GRID_START_MIN; m <= GRID_END_MIN; m += 60) hourMarks.push(m);
  const gridHeight = ((GRID_END_MIN - GRID_START_MIN) / 60) * HOUR_HEIGHT;

  const isToday = activeDay === todayName;
  const nowMinToday = now.getHours() * 60 + now.getMinutes();
  const nowLineTop = ((nowMinToday - GRID_START_MIN) / 60) * HOUR_HEIGHT;

  function blockStyle(startMin, durMin) {
    const top = ((startMin - GRID_START_MIN) / 60) * HOUR_HEIGHT;
    const height = Math.max((durMin / 60) * HOUR_HEIGHT, 22);
    return { top: `${top}px`, height: `${height}px` };
  }

  // Simple side-by-side layout for tasks whose time ranges overlap, so they don't sit on top of each other.
  const laidOutTasks = useMemo(() => {
    const sorted = [...tasksForDay].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
    const columns = []; // array of end-times per column
    return sorted.map((t) => {
      const start = timeToMinutes(t.time);
      const end = start + (t.dur || 30);
      let col = columns.findIndex((endTime) => endTime <= start);
      if (col === -1) {
        col = columns.length;
        columns.push(end);
      } else {
        columns[col] = end;
      }
      return { ...t, __col: col };
    }).map((t, _, arr) => {
      const totalCols = Math.max(...arr.map((x) => x.__col)) + 1;
      return { ...t, __totalCols: totalCols };
    });
  }, [tasksForDay]);

  if (!loaded || tasks === null) {
    return (
      <div style={{ background: "#0B1220", minHeight: "100vh", color: "#8291A8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "monospace" }}>
        Loading protocol...
      </div>
    );
  }

  return (
    <div style={{ background: "#0B1220", minHeight: "100vh", color: "#E8EDF4", fontFamily: "'JetBrains Mono', monospace", paddingBottom: "80px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        .sg { font-family: 'Space Grotesk', sans-serif; }
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-thumb { background: #22314D; border-radius: 4px; }
        button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid #4FD8E8; outline-offset: 2px; }
      `}</style>

      {/* Header */}
      <div className="px-4 pt-5 pb-3" style={{ borderBottom: "1px solid #22314D" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "11px", letterSpacing: "0.18em", color: "#4FD8E8", fontWeight: 700, textTransform: "uppercase" }}>
              Weekly Protocol
            </div>
            <h1 className="sg" style={{ fontSize: "24px", fontWeight: 700, margin: "4px 0 2px" }}>Mission Control</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={() => setShowLibrary(true)}
              aria-label="Workout library"
              style={{ display: "flex", alignItems: "center", gap: "5px", background: "#101A2C", border: "1px solid #22314D", borderRadius: "20px", padding: "6px 12px", cursor: "pointer", color: "#8291A8" }}
            >
              <Dumbbell size={13} color="#F5A623" />
              <span className="sg" style={{ fontSize: "12px", fontWeight: 700 }}>Workouts</span>
            </button>
            {streak > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "#101A2C", border: "1px solid #F5A623", borderRadius: "20px", padding: "6px 12px" }}>
                <Flame size={13} color="#F5A623" />
                <span className="sg" style={{ fontSize: "13px", fontWeight: 700, color: "#F5A623" }}>{streak}d</span>
              </div>
            )}
          </div>
        </div>
        <div style={{ fontSize: "12.5px", color: "#8291A8" }}>
          <Lock size={10} style={{ display: "inline", verticalAlign: "-1px", marginRight: "4px" }} />
          fixed class schedule · flexible tasks · progress resets each Monday
        </div>
        {notifPermission !== "granted" && (
          <button
            onClick={requestNotifPermission}
            style={{ marginTop: "10px", background: "#101A2C", border: "1px solid #22314D", color: "#F5A623", fontSize: "11px", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Bell size={13} /> Enable notifications while this tab is open
          </button>
        )}
      </div>

      {/* Category stats */}
      <div className="px-4 pt-4" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
        {Object.entries(CATS).map(([key, c]) => (
          <div key={key} style={{ background: "#101A2C", border: "1px solid #22314D", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: c.color, margin: "0 auto 5px" }} />
            <div style={{ fontSize: "8.5px", color: "#8291A8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</div>
            <div className="sg" style={{ fontSize: "13px", fontWeight: 700, marginTop: "2px" }}>
              {weekStats[key]?.done ?? 0}/{weekStats[key]?.total ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* Day tabs */}
      <div className="px-4 pt-5" style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
        {DAY_ORDER.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDay(d)}
            className="sg"
            style={{
              flexShrink: 0, padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 700,
              border: activeDay === d ? "1px solid #4FD8E8" : "1px solid #22314D",
              background: activeDay === d ? "rgba(79,216,232,0.1)" : "#101A2C",
              color: activeDay === d ? "#4FD8E8" : d === todayName ? "#F5A623" : "#8291A8",
              cursor: "pointer",
            }}
          >
            {d}{d === todayName ? " •" : ""}
          </button>
        ))}
      </div>
      <div className="px-4" style={{ fontSize: "11px", color: "#8291A8", marginTop: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{DAY_TAGS[activeDay]}</span>
        {dayProgress && (
          <span style={{ color: dayProgress.pct === 100 ? "#5FD98A" : "#8291A8" }}>
            {dayProgress.done}/{dayProgress.total} done
          </span>
        )}
      </div>
      {dayProgress && (
        <div className="px-4" style={{ marginTop: "6px" }}>
          <div style={{ height: "4px", borderRadius: "2px", background: "#101A2C", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${dayProgress.pct}%`, background: dayProgress.pct === 100 ? "#5FD98A" : "#4FD8E8", transition: "width 0.3s" }} />
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div ref={gridRef} className="px-4 pt-4" style={{ position: "relative", display: "flex", maxHeight: "62vh", overflowY: "auto" }}>
        {/* hour column */}
        <div style={{ width: "52px", flexShrink: 0, position: "relative", height: `${gridHeight}px` }}>
          {hourMarks.map((m) => (
            <div key={m} style={{ position: "absolute", top: `${((m - GRID_START_MIN) / 60) * HOUR_HEIGHT - 6}px`, fontSize: "9.5px", color: "#8291A8" }}>
              {minutesToLabel(m)}
            </div>
          ))}
        </div>

        {/* events column */}
        <div style={{ flex: 1, position: "relative", height: `${gridHeight}px`, borderLeft: "1px solid #22314D" }}>
          {hourMarks.map((m) => (
            <div key={m} style={{ position: "absolute", top: `${((m - GRID_START_MIN) / 60) * HOUR_HEIGHT}px`, left: 0, right: 0, borderTop: "1px solid #17223A" }} />
          ))}

          {isToday && nowMinToday >= GRID_START_MIN && nowMinToday <= GRID_END_MIN && (
            <div style={{ position: "absolute", top: `${nowLineTop}px`, left: 0, right: 0, height: "2px", background: "#FF4F8B", zIndex: 5 }}>
              <div style={{ position: "absolute", left: "-4px", top: "-3px", width: "8px", height: "8px", borderRadius: "50%", background: "#FF4F8B" }} />
            </div>
          )}

          {fixedForDay.map((f) => (
            <div
              key={f.id}
              style={{
                position: "absolute", left: "6px", right: "6px", ...blockStyle(timeToMinutes(f.start), timeToMinutes(f.end) - timeToMinutes(f.start)),
                background: "rgba(130,145,168,0.14)", border: `1px solid ${CATS[f.cat].color}`, borderRadius: "6px", padding: "4px 8px", overflow: "hidden",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 700 }}>
                <Lock size={9} color={CATS[f.cat].color} />
                {f.title} {f.room && <span style={{ color: "#8291A8", fontWeight: 400 }}>· {f.room}</span>}
              </div>
              <div style={{ fontSize: "9.5px", color: "#8291A8" }}>{f.start}–{f.end}</div>
            </div>
          ))}

          {laidOutTasks.map((t) => {
            const widthPct = 100 / t.__totalCols;
            return (
              <div
                key={t.id}
                style={{
                  position: "absolute",
                  left: `calc(6px + ${t.__col * widthPct}%)`,
                  width: `calc(${widthPct}% - 8px)`,
                  ...blockStyle(timeToMinutes(t.time), t.dur || 30),
                  background: "#101A2C", border: `1px solid ${CATS[t.cat].color}`, borderRadius: "6px", padding: "4px 6px", overflow: "hidden",
                  opacity: doneSet[t.id] ? 0.45 : 1, display: "flex", alignItems: "center", gap: "5px",
                }}
              >
                <button
                  onClick={() => toggleDone(t.id)}
                  aria-label={doneSet[t.id] ? `Mark ${t.title} not done` : `Mark ${t.title} done`}
                  style={{ width: "15px", height: "15px", borderRadius: "4px", border: `1.5px solid ${CATS[t.cat].color}`, background: doneSet[t.id] ? CATS[t.cat].color : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                >
                  {doneSet[t.id] && <Check size={10} color="#0B1220" strokeWidth={3} />}
                </button>
                <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => openEditForm(t)}>
                  <div style={{ fontSize: "11px", textDecoration: doneSet[t.id] ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.title}</div>
                  <div style={{ fontSize: "9px", color: "#8291A8" }}>{t.time}</div>
                </div>
                {t.notify && <Bell size={10} color={CATS[t.cat].color} style={{ flexShrink: 0 }} />}
                {t.cat === "gym" && findWorkout(t.title) && (
                  <button onClick={() => setActiveWorkout(findWorkout(t.title))} aria-label={`View routine for ${t.title}`} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: "2px" }}>
                    <Dumbbell size={11} color="#F5A623" />
                  </button>
                )}
                <button onClick={() => openEditForm(t)} aria-label={`Edit ${t.title}`} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: "2px" }}>
                  <Pencil size={11} color="#8291A8" />
                </button>
                <button onClick={() => deleteTask(t)} aria-label={`Delete ${t.title}`} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0, padding: "2px" }}>
                  <Trash2 size={11} color="#8291A8" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add task FAB */}
      <button
        onClick={openNewForm}
        aria-label="Add task"
        style={{ position: "fixed", bottom: "24px", right: "20px", width: "52px", height: "52px", borderRadius: "50%", background: "#4FD8E8", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(79,216,232,0.4)" }}
      >
        <Plus size={24} color="#0B1220" strokeWidth={2.5} />
      </button>

      {/* Add/edit task form modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }} onClick={() => setShowForm(false)}>
          <form onSubmit={submitForm} onClick={(e) => e.stopPropagation()} style={{ background: "#101A2C", border: "1px solid #22314D", borderTopLeftRadius: "16px", borderTopRightRadius: "16px", padding: "20px", width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="sg" style={{ fontWeight: 700, fontSize: "15px" }}>{editingId ? "Edit task" : "New task"}</div>
              <button type="button" onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} color="#8291A8" />
              </button>
            </div>
            <div style={{ fontSize: "10.5px", color: "#8291A8" }}>Tasks are flexible — for locked class times, that's the calendar grid above.</div>
            <input autoFocus placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ background: "#0B1220", border: "1px solid #22314D", borderRadius: "8px", padding: "10px 12px", color: "#E8EDF4", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} style={{ flex: 1, background: "#0B1220", border: "1px solid #22314D", borderRadius: "8px", padding: "10px", color: "#E8EDF4", fontSize: "13px" }}>
                {DAY_ORDER.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} style={{ flex: 1, background: "#0B1220", border: "1px solid #22314D", borderRadius: "8px", padding: "10px", color: "#E8EDF4", fontSize: "13px" }} />
              <input type="number" min="5" step="5" value={form.dur} onChange={(e) => setForm({ ...form, dur: e.target.value })} title="Duration (minutes)" style={{ width: "64px", background: "#0B1220", border: "1px solid #22314D", borderRadius: "8px", padding: "10px", color: "#E8EDF4", fontSize: "13px" }} />
            </div>
            <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} style={{ background: "#0B1220", border: "1px solid #22314D", borderRadius: "8px", padding: "10px", color: "#E8EDF4", fontSize: "13px" }}>
              {Object.entries(CATS).map(([key, c]) => <option key={key} value={key}>{c.label}</option>)}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#8291A8" }}>
              <input type="checkbox" checked={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.checked })} />
              Notify me when this is due
            </label>
            {formConflict && (
              <div style={{ display: "flex", gap: "6px", alignItems: "flex-start", fontSize: "11px", color: "#F5A623", background: "rgba(245,166,35,0.1)", border: "1px solid #F5A623", borderRadius: "8px", padding: "8px 10px" }}>
                <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: "1px" }} />
                <span>{formConflict} — you can still save, just double-check the time.</span>
              </div>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { const t = tasks.find((x) => x.id === editingId); setShowForm(false); setEditingId(null); if (t) deleteTask(t); }}
                  style={{ background: "none", border: "1px solid #22314D", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "#8291A8", cursor: "pointer" }}
                >
                  Delete
                </button>
              )}
              <button type="submit" className="sg" style={{ flex: 1, background: "#4FD8E8", border: "none", borderRadius: "8px", padding: "12px", fontWeight: 700, fontSize: "13px", color: "#0B1220", cursor: "pointer" }}>
                {editingId ? "Save changes" : "Add to protocol"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Workout library */}
      {showLibrary && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }} onClick={() => setShowLibrary(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#101A2C", border: "1px solid #22314D", borderTopLeftRadius: "16px", borderTopRightRadius: "16px", padding: "20px", width: "100%", maxWidth: "480px", maxHeight: "80vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="sg" style={{ fontWeight: 700, fontSize: "15px" }}>Workout library</div>
              <button type="button" onClick={() => setShowLibrary(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} color="#8291A8" />
              </button>
            </div>
            <div style={{ fontSize: "10.5px", color: "#8291A8" }}>No bar needed — built around resistance band, push-up handles, and ab roller.</div>
            {Object.values(WORKOUTS).map((w) => (
              <button
                key={w.label}
                onClick={() => { setActiveWorkout(w); setShowLibrary(false); }}
                style={{ textAlign: "left", background: "#0B1220", border: "1px solid #22314D", borderRadius: "10px", padding: "12px 14px", cursor: "pointer", color: "#E8EDF4" }}
              >
                <div className="sg" style={{ fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                  <Dumbbell size={13} color="#F5A623" /> {w.label}
                </div>
                <div style={{ fontSize: "11px", color: "#8291A8", marginTop: "3px" }}>{w.focus} · {w.exercises.length} exercises</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workout detail */}
      {activeWorkout && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 51 }} onClick={() => setActiveWorkout(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#101A2C", border: "1px solid #22314D", borderTopLeftRadius: "16px", borderTopRightRadius: "16px", padding: "20px", width: "100%", maxWidth: "480px", maxHeight: "82vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="sg" style={{ fontWeight: 700, fontSize: "16px" }}>{activeWorkout.label}</div>
                <div style={{ fontSize: "11px", color: "#8291A8", marginTop: "2px" }}>{activeWorkout.focus}</div>
              </div>
              <button type="button" onClick={() => setActiveWorkout(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={18} color="#8291A8" />
              </button>
            </div>
            <div style={{ fontSize: "10.5px", color: "#F5A623", background: "rgba(245,166,35,0.1)", border: "1px solid #F5A623", borderRadius: "8px", padding: "6px 10px", display: "inline-block", width: "fit-content" }}>
              Equipment: {activeWorkout.equipment}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {activeWorkout.exercises.map((ex, i) => (
                <div key={i} style={{ background: "#0B1220", border: "1px solid #22314D", borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                    <div style={{ fontSize: "12.5px", fontWeight: 700 }}>{ex.name}</div>
                    <div className="sg" style={{ fontSize: "11px", color: "#4FD8E8", fontWeight: 700, whiteSpace: "nowrap" }}>{ex.sets}</div>
                  </div>
                  <div style={{ fontSize: "10.5px", color: "#8291A8", marginTop: "3px" }}>{ex.note}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: "10px", color: "#8291A8", textAlign: "center", marginTop: "2px" }}>
              Rest 30–60 sec between sets · adjust reps to how the band's tension feels
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div style={{ position: "fixed", top: "16px", left: "16px", right: "16px", display: "flex", flexDirection: "column", gap: "8px", zIndex: 60 }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ background: "#101A2C", border: `1px solid ${CATS[toast.cat].color}`, borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
            <Bell size={14} color={CATS[toast.cat].color} style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: "12.5px" }}><b>{toast.time}</b> — {toast.title}</div>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== toast.id))} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={14} color="#8291A8" />
            </button>
          </div>
        ))}
        {undoBuffer && (
          <div style={{ background: "#101A2C", border: "1px solid #22314D", borderRadius: "10px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
            <Trash2 size={14} color="#8291A8" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, fontSize: "12.5px" }}>Deleted "{undoBuffer.task.title}"</div>
            <button onClick={undoDelete} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "1px solid #4FD8E8", borderRadius: "6px", padding: "5px 9px", cursor: "pointer", color: "#4FD8E8", fontSize: "11px" }}>
              <Undo2 size={11} /> Undo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
