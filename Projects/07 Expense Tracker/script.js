const STORAGE_KEY = 'expenseTrackerTransactions';
const THEME_KEY = 'expenseTrackerTheme';

let transactions = [];
let currentFilter = 'all';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const transactionForm = document.getElementById('transaction-form');
const titleInput = document.getElementById('title');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const typeInput = document.getElementById('type');
const dateInput = document.getElementById('date');
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const transactionList = document.getElementById('transaction-list');
const emptyState = document.getElementById('empty-state');
const themeToggle = document.getElementById('theme-toggle');
const filterAllBtn = document.getElementById('filter-all');
const filterIncomeBtn = document.getElementById('filter-income');
const filterExpenseBtn = document.getElementById('filter-expense');
const filterButtons = [filterAllBtn, filterIncomeBtn, filterExpenseBtn];

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return String(Date.now()) + String(Math.random()).slice(2);
}

function formatCurrency(amount) {
  return currencyFormatter.format(Math.abs(Number(amount) || 0));
}

function formatSignedAmount(amount, type) {
  const formatted = formatCurrency(amount);
  return type === 'income' ? '+' + formatted : '-' + formatted;
}

function formatDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return '';
  }
  const parts = dateStr.split('-');
  return parts[2] + '-' + parts[1] + '-' + parts[0];
}

function normalizeType(value) {
  return String(value).toLowerCase() === 'income' ? 'income' : 'expense';
}

function isValidDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const parts = dateStr.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return (
    date.getFullYear() === parts[0] &&
    date.getMonth() === parts[1] - 1 &&
    date.getDate() === parts[2]
  );
}

function isValidTransaction(transaction) {
  return (
    transaction &&
    typeof transaction.id === 'string' &&
    typeof transaction.title === 'string' &&
    transaction.title.trim().length > 0 &&
    typeof transaction.amount === 'number' &&
    transaction.amount > 0 &&
    typeof transaction.category === 'string' &&
    transaction.category.trim().length > 0 &&
    (transaction.type === 'income' || transaction.type === 'expense') &&
    typeof transaction.date === 'string' &&
    isValidDate(transaction.date)
  );
}

function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    return;
  }
}

function loadTransactions() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      transactions = [];
      return;
    }
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      transactions = [];
      return;
    }
    transactions = parsed.filter(isValidTransaction);
  } catch (error) {
    transactions = [];
  }
}

function calculateTotals() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(function (transaction) {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  return {
    income: totalIncome,
    expense: totalExpense,
    balance: totalIncome - totalExpense
  };
}

function updateSummary() {
  const totals = calculateTotals();
  balanceEl.textContent = formatCurrency(totals.balance);
  incomeEl.textContent = formatCurrency(totals.income);
  expenseEl.textContent = formatCurrency(totals.expense);
}

function getFilteredTransactions() {
  if (currentFilter === 'income') {
    return transactions.filter(function (transaction) {
      return transaction.type === 'income';
    });
  }
  if (currentFilter === 'expense') {
    return transactions.filter(function (transaction) {
      return transaction.type === 'expense';
    });
  }
  return transactions.slice();
}

function setActiveFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach(function (button) {
    button.classList.remove('filter-btn--active');
  });

  if (filter === 'income') {
    filterIncomeBtn.classList.add('filter-btn--active');
  } else if (filter === 'expense') {
    filterExpenseBtn.classList.add('filter-btn--active');
  } else {
    filterAllBtn.classList.add('filter-btn--active');
  }

  renderTransactions();
}

function updateEmptyState(show) {
  emptyState.style.display = show ? 'block' : 'none';
}

function createTransactionItem(transaction) {
  const item = document.createElement('li');
  item.className = transaction.type;
  item.dataset.id = transaction.id;
  item.dataset.type = transaction.type === 'income' ? 'Income' : 'Expense';

  const titleEl = document.createElement('span');
  titleEl.className = 'transaction-title';
  titleEl.textContent = transaction.title;

  const metaEl = document.createElement('span');
  metaEl.className = 'transaction-category';
  metaEl.textContent =
    transaction.category +
    ' · ' +
    formatDate(transaction.date) +
    ' · ' +
    (transaction.type === 'income' ? 'Income' : 'Expense');

  const amountEl = document.createElement('span');
  amountEl.className = 'transaction-amount';
  amountEl.textContent = formatSignedAmount(transaction.amount, transaction.type);

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.setAttribute('aria-label', 'Delete transaction');
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', function () {
    deleteTransaction(transaction.id);
  });

  item.appendChild(titleEl);
  item.appendChild(metaEl);
  item.appendChild(amountEl);
  item.appendChild(deleteBtn);

  return item;
}

function renderTransactions() {
  const filtered = getFilteredTransactions();

  while (transactionList.firstChild) {
    transactionList.removeChild(transactionList.firstChild);
  }

  filtered.forEach(function (transaction) {
    transactionList.appendChild(createTransactionItem(transaction));
  });

  updateEmptyState(filtered.length === 0);
}

function addTransaction(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value.trim();
  const type = normalizeType(typeInput.value);
  const date = dateInput.value;

  if (!title) {
    titleInput.focus();
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    amountInput.focus();
    return;
  }

  if (!category) {
    categoryInput.focus();
    return;
  }

  if (!isValidDate(date)) {
    dateInput.focus();
    return;
  }

  const transaction = {
    id: generateId(),
    title: title,
    amount: amount,
    category: category,
    type: type,
    date: date
  };

  transactions.unshift(transaction);
  saveTransactions();
  renderTransactions();
  updateSummary();
  transactionForm.reset();
  setDefaultDate();
}

function deleteTransaction(id) {
  const index = transactions.findIndex(function (transaction) {
    return transaction.id === id;
  });

  if (index === -1) {
    return;
  }

  transactions.splice(index, 1);
  saveTransactions();
  renderTransactions();
  updateSummary();
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function loadTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light') {
      applyTheme('light');
    } else {
      applyTheme('dark');
    }
  } catch (error) {
    applyTheme('dark');
  }
}

function toggleTheme() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const newTheme = isLight ? 'dark' : 'light';
  applyTheme(newTheme);

  try {
    localStorage.setItem(THEME_KEY, newTheme);
  } catch (error) {
    return;
  }
}

function setDefaultDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  dateInput.value = year + '-' + month + '-' + day;
}

function init() {
  loadTheme();
  loadTransactions();
  setDefaultDate();
  setActiveFilter('all');
  updateSummary();

  transactionForm.addEventListener('submit', addTransaction);
  themeToggle.addEventListener('click', toggleTheme);

  filterAllBtn.addEventListener('click', function () {
    setActiveFilter('all');
  });

  filterIncomeBtn.addEventListener('click', function () {
    setActiveFilter('income');
  });

  filterExpenseBtn.addEventListener('click', function () {
    setActiveFilter('expense');
  });
}

document.addEventListener('DOMContentLoaded', init);