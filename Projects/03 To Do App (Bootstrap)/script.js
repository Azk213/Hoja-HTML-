const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

renderTasks();

function addTask() {
    const text = taskInput.value.trim();

    if (!text) return;

    tasks.push({ text, completed: false });
    taskInput.value = "";

    saveTask();
}

taskInput.addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
});

function saveTask() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items center"

        if (task.completed) {
            li.classList.add("completed");
        }

        li.innerHTML = `
        <span onclick="toggleTask(${index})">${task.text}</span>

        <div class="task-buttons">
            <button class="btn btn-sm btn-outline-primary" onclick="editTask(${index})">✒️</button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${index})">🗑️</button>
        </div>`;

        taskList.appendChild(li);
    });

    taskCount.textContent = `${tasks.length} tasks`;
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTask();
}

function deleteTask(index) {
    tasks.splice(index, 1);
    saveTask();
}

function editTask(index) {
    const newText = prompt("Edit Task: ", tasks[index].text);

    if (newText !== null) {
        tasks[index].text = newText.trim();
        saveTask();
    }
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTask();
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    document.body.classList.toggle("light");
}