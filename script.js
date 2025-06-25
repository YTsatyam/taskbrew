/* ======= Utility ======= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ======= Storage ======= */
const STORAGE_KEY = 'taskbrew-data';
const readTasks = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
const saveTasks = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

/* ======= State ======= */
let tasks = readTasks(); // array of {id,text,priority,completed}
let currentFilter = 'all';

/* ======= DOM Refs ======= */
const taskList = $('#taskList');
const taskForm = $('#taskForm');
const taskInput = $('#taskInput');
const priorityInput = $('#priorityInput');

/* ======= Rendering ======= */
function render() {
  taskList.innerHTML = '';

  const filtered = tasks.filter((t) =>
    currentFilter === 'all'
      ? true
      : currentFilter === 'active'
      ? !t.completed
      : t.completed
  );

  if (!filtered.length) {
    taskList.innerHTML =
      '<li style="text-align:center;opacity:.6">No tasks 🙌</li>';
    return;
  }

  filtered.forEach((t) => {
    const li = document.createElement('li');
    li.className = 'task' + (t.completed ? ' completed' : '');
    li.dataset.id = t.id;
    li.dataset.priority = t.priority;

    /* escape HTML */
    const safe = t.text.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[m]));

    li.innerHTML = `
      <input type="checkbox" ${t.completed ? 'checked' : ''} aria-label="Mark completed">
      <span class="task-text" contenteditable="true">${safe}</span>
      <button class="delete" title="Delete">🗑️</button>
    `;
    taskList.appendChild(li);
  });
}

/* ======= CRUD Helpers ======= */
function addTask(text, priority) {
  tasks.push({ id: Date.now(), text, priority, completed: false });
  saveTasks(tasks);
  render();
}
function toggleTask(id) {
  tasks = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks(tasks);
  render();
}
function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks(tasks);
  render();
}
function updateTask(id, text) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, text } : t));
  saveTasks(tasks);
  render();
}

/* ======= Event Listeners ======= */
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text, priorityInput.value);
  taskInput.value = '';
});

taskList.addEventListener('click', (e) => {
  const li = e.target.closest('.task');
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.matches('input[type="checkbox"]')) toggleTask(id);
  if (e.target.matches('.delete')) deleteTask(id);
});

taskList.addEventListener(
  'blur',
  (e) => {
    if (e.target.classList.contains('task-text')) {
      const li = e.target.closest('.task');
      updateTask(Number(li.dataset.id), e.target.textContent.trim());
    }
  },
  true
);

$$('.filters button').forEach((btn) =>
  btn.addEventListener('click', () => {
    $$('.filters button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  })
);

$('#themeToggle').addEventListener('click', () => {
  const root = document.documentElement;
  const now = root.getAttribute('data-theme');
  root.setAttribute('data-theme', now === 'light' ? 'dark' : 'light');
});

/* ======= Initial Paint ======= */
render();
