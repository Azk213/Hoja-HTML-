"use strict";

const STORAGE_KEY = "attendlyAttendance";
const THEME_KEY = "attendlyTheme";

let students = [
    { id: 1, name: "Adrián Arnu" },
    { id: 2, name: "Alexis Ciria" },
    { id: 3, name: "Diego Aguado" },
    { id: 4, name: "Jacobo Ortega" },
    { id: 5, name: "Joan Martínez" },
    { id: 6, name: "Jorge Cestero" },
    { id: 7, name: "Lamini" },
    { id: 8, name: "Pol Fortuny" },
    { id: 9, name: "Rachad Fettal" },
    { id: 10, name: "Thiago Pitarch" }
];

let attendanceData = {};
let selectedDate = getToday();


// ==========================================
// ELEMENTS
// ==========================================

const dateInput =
    document.getElementById("attendanceDate");

const todayDisplay =
    document.getElementById("todayDisplay");

const studentList =
    document.getElementById("studentList");

const searchInput =
    document.getElementById("searchStudents");

const markAllPresent =
    document.getElementById("markAllPresent");

const markAllAbsent =
    document.getElementById("markAllAbsent");

const saveButton =
    document.getElementById("saveAttendance");

const totalStudents =
    document.getElementById("totalStudents");

const presentCount =
    document.getElementById("presentCount");

const absentCount =
    document.getElementById("absentCount");

const attendancePercentage =
    document.getElementById("attendancePercentage");

const reportDate =
    document.getElementById("reportDate");

const reportPercentage =
    document.getElementById("reportPercentage");

const reportPresent =
    document.getElementById("reportPresent");

const reportAbsent =
    document.getElementById("reportAbsent");

const attendanceReport =
    document.getElementById("attendanceReport");

const themeToggle =
    document.getElementById("themeToggle");


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    loadData();

    loadTheme();

    selectedDate = getToday();

    if (dateInput) {
        dateInput.value = selectedDate;
        dateInput.max = selectedDate;
    }

    if (todayDisplay) {
        todayDisplay.textContent =
            formatShortDate(selectedDate);
    }

    renderStudents();
    updateStatistics();
    renderReport();
});


// ==========================================
// DATE
// ==========================================

function getToday() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function formatDate(dateString) {

    const [year, month, day] =
        dateString.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    return date.toLocaleDateString(
        undefined,
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );
}


function formatShortDate(dateString) {

    const [year, month, day] =
        dateString.split("-");

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );
}


// ==========================================
// LOCAL STORAGE
// ==========================================

function loadData() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            attendanceData = {};
            return;
        }

        const parsed =
            JSON.parse(saved);

        if (
            parsed &&
            typeof parsed === "object"
        ) {
            attendanceData = parsed;
        } else {
            attendanceData = {};
        }

    } catch (error) {

        console.error(
            "Could not load attendance:",
            error
        );

        attendanceData = {};
    }
}


function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(attendanceData)
        );

    } catch (error) {

        showToast(
            "Could not save attendance.",
            "error"
        );
    }
}


// ==========================================
// STUDENT LIST
// ==========================================

function renderStudents() {

    if (!studentList) return;

    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const filtered =
        students.filter(student =>
            student.name
                .toLowerCase()
                .includes(search)
        );

    studentList.innerHTML = "";

    if (filtered.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "empty-state";

        empty.textContent =
            "No students found.";

        studentList.appendChild(empty);

        return;
    }

    filtered.forEach(student => {

        const row =
            createStudentRow(student);

        studentList.appendChild(row);
    });
}


// ==========================================
// STUDENT ROW
// ==========================================

function createStudentRow(student) {

    const row =
        document.createElement("div");

    row.className =
        "student-row";

    const info =
        document.createElement("div");

    info.className =
        "student-info";

    const bullet =
        document.createElement("span");

    bullet.className =
        "student-bullet";

    bullet.textContent = "•";

    const name =
        document.createElement("span");

    name.className =
        "student-name";

    name.textContent =
        student.name;

    info.appendChild(bullet);
    info.appendChild(name);


    const actions =
        document.createElement("div");

    actions.className =
        "attendance-actions";


    const presentButton =
        document.createElement("button");

    presentButton.type = "button";
    presentButton.className =
        "attendance-btn present-btn";

    presentButton.textContent =
        "Present";


    const absentButton =
        document.createElement("button");

    absentButton.type = "button";
    absentButton.className =
        "attendance-btn absent-btn";

    absentButton.textContent =
        "Absent";


    const currentStatus =
        getStatus(student.id);


    if (currentStatus === "present") {

        presentButton.classList.add(
            "active"
        );
    }

    if (currentStatus === "absent") {

        absentButton.classList.add(
            "active"
        );
    }


    presentButton.addEventListener(
        "click",
        () => {

            setAttendance(
                student.id,
                "present"
            );

        }
    );


    absentButton.addEventListener(
        "click",
        () => {

            setAttendance(
                student.id,
                "absent"
            );

        }
    );


    actions.appendChild(
        presentButton
    );

    actions.appendChild(
        absentButton
    );


    row.appendChild(info);
    row.appendChild(actions);

    return row;
}


// ==========================================
// SET ATTENDANCE
// ==========================================

function setAttendance(
    studentId,
    status
) {

    if (!attendanceData[selectedDate]) {

        attendanceData[selectedDate] = {};
    }

    attendanceData[selectedDate][studentId] =
        status;

    saveData();

    renderStudents();
    updateStatistics();
    renderReport();
}


// ==========================================
// GET STATUS
// ==========================================

function getStatus(studentId) {

    return (
        attendanceData[selectedDate]?.[
            studentId
        ] || null
    );
}


// ==========================================
// MARK ALL PRESENT
// ==========================================

markAllPresent.addEventListener(
    "click",
    () => {

        if (!attendanceData[selectedDate]) {

            attendanceData[selectedDate] =
                {};
        }

        students.forEach(student => {

            attendanceData[selectedDate][
                student.id
            ] = "present";

        });

        saveData();

        renderStudents();
        updateStatistics();
        renderReport();

        showToast(
            "All students marked present.",
            "success"
        );
    }
);


// ==========================================
// MARK ALL ABSENT
// ==========================================

markAllAbsent.addEventListener(
    "click",
    () => {

        if (!attendanceData[selectedDate]) {

            attendanceData[selectedDate] =
                {};
        }

        students.forEach(student => {

            attendanceData[selectedDate][
                student.id
            ] = "absent";

        });

        saveData();

        renderStudents();
        updateStatistics();
        renderReport();

        showToast(
            "All students marked absent.",
            "info"
        );
    }
);


// ==========================================
// DATE CHANGE
// ==========================================

dateInput.addEventListener(
    "change",
    () => {

        if (!dateInput.value) return;

        selectedDate =
            dateInput.value;

        if (todayDisplay) {

            todayDisplay.textContent =
                formatShortDate(selectedDate);
        }

        renderStudents();
        updateStatistics();
        renderReport();
    }
);


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    renderStudents
);


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const records =
        attendanceData[selectedDate] || {};

    let present = 0;
    let absent = 0;

    students.forEach(student => {

        const status =
            records[student.id];

        if (status === "present") {
            present++;
        }

        if (status === "absent") {
            absent++;
        }
    });


    const marked =
        present + absent;


    const percentage =
        marked === 0
            ? 0
            : Math.round(
                (present / marked) * 100
            );


    totalStudents.textContent =
        students.length;

    presentCount.textContent =
        present;

    absentCount.textContent =
        absent;

    attendancePercentage.textContent =
        `${percentage}%`;
}


// ==========================================
// REPORT
// ==========================================

function renderReport() {

    if (!attendanceReport) return;

    const records =
        attendanceData[selectedDate] || {};

    let present = 0;
    let absent = 0;


    attendanceReport.innerHTML = "";


    students.forEach(student => {

        const status =
            records[student.id];


        if (status === "present") {
            present++;
        }

        if (status === "absent") {
            absent++;
        }


        const row =
            document.createElement("div");

        row.className =
            "report-row";


        const name =
            document.createElement("span");

        name.className =
            "report-name";

        name.textContent =
            student.name;


        const statusElement =
            document.createElement("span");

        statusElement.className =
            "report-status";


        if (status === "present") {

            statusElement.textContent =
                "Present";

            statusElement.classList.add(
                "status-present"
            );

        } else if (status === "absent") {

            statusElement.textContent =
                "Absent";

            statusElement.classList.add(
                "status-absent"
            );

        } else {

            statusElement.textContent =
                "Not Marked";

            statusElement.classList.add(
                "status-unmarked"
            );
        }


        row.appendChild(name);
        row.appendChild(statusElement);

        attendanceReport.appendChild(row);
    });


    const marked =
        present + absent;


    const percentage =
        marked === 0
            ? 0
            : Math.round(
                (present / marked) * 100
            );


    if (reportDate) {

        reportDate.textContent =
            formatDate(selectedDate);
    }

    if (reportPercentage) {

        reportPercentage.textContent =
            `${percentage}%`;
    }

    if (reportPresent) {

        reportPresent.textContent =
            present;
    }

    if (reportAbsent) {

        reportAbsent.textContent =
            absent;
    }
}


// ==========================================
// SAVE
// ==========================================

saveButton.addEventListener(
    "click",
    () => {

        saveData();

        showToast(
            "Attendance saved successfully.",
            "success"
        );
    }
);


// ==========================================
// THEME
// ==========================================

function loadTheme() {

    const savedTheme =
        localStorage.getItem(THEME_KEY);

    if (savedTheme) {

        applyTheme(savedTheme);

        return;
    }


    const prefersDark =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;


    applyTheme(
        prefersDark
            ? "dark"
            : "light"
    );
}


function applyTheme(theme) {

    document.documentElement.dataset.theme =
        theme;

    if (themeToggle) {

        themeToggle.textContent =
            theme === "dark"
                ? "☾"
                : "☀";
    }
}


themeToggle.addEventListener(
    "click",
    () => {

        const current =
            document.documentElement
                .dataset
                .theme || "light";


        const next =
            current === "dark"
                ? "light"
                : "dark";


        applyTheme(next);

        localStorage.setItem(
            THEME_KEY,
            next
        );
    }
);


// ==========================================
// TOAST
// ==========================================

function showToast(
    message,
    type = "info"
) {

    const container =
        document.getElementById(
            "toastContainer"
        );


    const toast =
        document.createElement("div");

    toast.className =
        `toast toast-${type}`;

    toast.textContent =
        message;


    container.appendChild(toast);


    requestAnimationFrame(() => {

        toast.classList.add("show");

    });


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

        setTimeout(() => {

            toast.remove();

        }, 250);

    }, 3000);
}