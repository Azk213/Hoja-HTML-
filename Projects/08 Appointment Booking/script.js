"use strict";

const STORAGE_KEY = "appointmentData";
const THEME_KEY = "appointlyTheme";

let appointments = [];
let selectedAppointmentId = null;

// -----------------------------
// DOM ELEMENTS
// -----------------------------

const bookingForm = document.getElementById("bookingForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const appointmentTypeInput = document.getElementById("appointmentType");
const appointmentDateInput = document.getElementById("appointmentDate");
const appointmentTimeInput = document.getElementById("appointmentTime");
const notesInput = document.getElementById("notes");

const appointmentsList = document.getElementById("appointmentsList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchAppointments");
const filterStatus = document.getElementById("filterStatus");
const filterType = document.getElementById("filterType");
const sortAppointments = document.getElementById("sortAppointments");

const totalCount = document.getElementById("totalCount");
const upcomingCount = document.getElementById("upcomingCount");
const cancelledCount = document.getElementById("cancelledCount");

const appointmentCardTemplate = document.getElementById(
    "appointmentCardTemplate"
);

// Theme
const themeToggle = document.getElementById("themeToggle");

// View modal
const viewModal = document.getElementById("viewModal");
const viewModalClose = document.getElementById("viewModalClose");
const viewModalCloseBtn = document.getElementById("viewModalCloseBtn");

const viewType = document.getElementById("viewType");
const viewName = document.getElementById("viewName");
const viewEmail = document.getElementById("viewEmail");
const viewDate = document.getElementById("viewDate");
const viewTime = document.getElementById("viewTime");
const viewNotes = document.getElementById("viewNotes");
const viewStatus = document.getElementById("viewStatus");

// Reschedule modal
const rescheduleModal = document.getElementById("rescheduleModal");
const rescheduleForm = document.getElementById("rescheduleForm");
const rescheduleDate = document.getElementById("rescheduleDate");
const rescheduleTime = document.getElementById("rescheduleTime");
const rescheduleModalClose = document.getElementById("rescheduleModalClose");
const rescheduleCancelBtn = document.getElementById("rescheduleCancelBtn");

// Cancel modal
const cancelModal = document.getElementById("cancelModal");
const cancelModalClose = document.getElementById("cancelModalClose");
const keepAppointmentBtn = document.getElementById("keepAppointmentBtn");
const confirmCancelBtn = document.getElementById("confirmCancelBtn");

// Toast
const toastContainer = document.getElementById("toastContainer");

// -----------------------------
// INITIALIZATION
// -----------------------------

document.addEventListener("DOMContentLoaded", () => {
    setMinimumDates();
    loadAppointments();
    loadTheme();
    renderAppointments();
    updateStats();
});

// -----------------------------
// DATE
// -----------------------------

function getToday() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function setMinimumDates() {
    const today = getToday();

    if (appointmentDateInput) {
        appointmentDateInput.min = today;
    }

    if (rescheduleDate) {
        rescheduleDate.min = today;
    }
}

// -----------------------------
// LOCAL STORAGE
// -----------------------------

function loadAppointments() {
    try {
        const savedAppointments = localStorage.getItem(STORAGE_KEY);

        if (!savedAppointments) {
            appointments = [];
            return;
        }

        const parsedAppointments = JSON.parse(savedAppointments);

        if (Array.isArray(parsedAppointments)) {
            appointments = parsedAppointments;
        } else {
            appointments = [];
        }
    } catch (error) {
        console.error("Could not load appointments:", error);
        appointments = [];
    }
}

function saveAppointments() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appointments)
        );
    } catch (error) {
        console.error("Could not save appointments:", error);

        showToast(
            "Could not save your appointment.",
            "error"
        );
    }
}

// -----------------------------
// FORM SUBMISSION
// -----------------------------

bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const type = appointmentTypeInput.value;
    const date = appointmentDateInput.value;
    const time = appointmentTimeInput.value;
    const notes = notesInput.value.trim();

    if (!validateBooking(name, email, type, date, time)) {
        return;
    }

    if (isTimeSlotTaken(date, time)) {
        showToast(
            "This time slot is already booked.",
            "error"
        );
        return;
    }

    const appointment = {
        id: generateId(),
        name,
        email,
        type,
        date,
        time,
        notes,
        status: "upcoming",
        createdAt: new Date().toISOString()
    };

    appointments.push(appointment);

    saveAppointments();

    renderAppointments();
    updateStats();

    bookingForm.reset();

    setMinimumDates();

    showToast(
        "Appointment booked successfully!",
        "success"
    );
});

// -----------------------------
// VALIDATION
// -----------------------------

function validateBooking(name, email, type, date, time) {
    clearValidation();

    let valid = true;

    if (!name) {
        showFieldError(
            fullNameInput,
            "Please enter your name."
        );
        valid = false;
    }

    if (!email) {
        showFieldError(
            emailInput,
            "Please enter your email."
        );
        valid = false;
    } else if (!isValidEmail(email)) {
        showFieldError(
            emailInput,
            "Please enter a valid email."
        );
        valid = false;
    }

    if (!type) {
        showFieldError(
            appointmentTypeInput,
            "Please select an appointment type."
        );
        valid = false;
    }

    if (!date) {
        showFieldError(
            appointmentDateInput,
            "Please select a date."
        );
        valid = false;
    } else if (date < getToday()) {
        showFieldError(
            appointmentDateInput,
            "Please select a future date."
        );
        valid = false;
    }

    if (!time) {
        showFieldError(
            appointmentTimeInput,
            "Please select a time."
        );
        valid = false;
    }

    if (!valid) {
        showToast(
            "Please check the highlighted fields.",
            "error"
        );
    }

    return valid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(input, message) {
    input.setAttribute("aria-invalid", "true");
    input.classList.add("input-error");

    let error = input.parentElement.querySelector(
        ".field-error"
    );

    if (!error) {
        error = document.createElement("small");
        error.className = "field-error";
        input.parentElement.appendChild(error);
    }

    error.textContent = message;
}

function clearValidation() {
    document
        .querySelectorAll(".input-error")
        .forEach((input) => {
            input.classList.remove("input-error");
            input.removeAttribute("aria-invalid");
        });

    document
        .querySelectorAll(".field-error")
        .forEach((error) => error.remove());
}

// Remove validation as user fixes fields
[
    fullNameInput,
    emailInput,
    appointmentTypeInput,
    appointmentDateInput,
    appointmentTimeInput
].forEach((input) => {
    if (!input) return;

    input.addEventListener("input", () => {
        input.classList.remove("input-error");
        input.removeAttribute("aria-invalid");

        const error = input.parentElement.querySelector(
            ".field-error"
        );

        if (error) {
            error.remove();
        }
    });
});

// -----------------------------
// DUPLICATE CHECK
// -----------------------------

function isTimeSlotTaken(date, time, ignoredId = null) {
    return appointments.some((appointment) => {
        return (
            appointment.id !== ignoredId &&
            appointment.date === date &&
            appointment.time === time &&
            appointment.status !== "cancelled"
        );
    });
}

// -----------------------------
// RENDER APPOINTMENTS
// -----------------------------

function renderAppointments() {
    if (!appointmentsList) return;

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const statusFilter = filterStatus
        ? filterStatus.value
        : "all";

    const typeFilter = filterType
        ? filterType.value
        : "all";

    const sortOption = sortAppointments
        ? sortAppointments.value
        : "date-asc";

    let filteredAppointments = appointments.filter(
        (appointment) => {
            const matchesSearch =
                !searchTerm ||
                appointment.name
                    .toLowerCase()
                    .includes(searchTerm) ||
                appointment.email
                    .toLowerCase()
                    .includes(searchTerm) ||
                appointment.type
                    .toLowerCase()
                    .includes(searchTerm);

            const matchesStatus =
                statusFilter === "all" ||
                appointment.status === statusFilter;

            const matchesType =
                typeFilter === "all" ||
                appointment.type === typeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );
        }
    );

    sortAppointmentArray(
        filteredAppointments,
        sortOption
    );

    appointmentsList.innerHTML = "";

    if (filteredAppointments.length === 0) {
        const message = document.createElement("p");

        message.className = "empty-state";

        if (appointments.length === 0) {
            message.textContent = "No appointments yet";
        } else {
            message.textContent =
                "No appointments match your search.";
        }

        appointmentsList.appendChild(message);
        return;
    }

    filteredAppointments.forEach((appointment) => {
        const card = createAppointmentCard(appointment);

        appointmentsList.appendChild(card);
    });
}

// -----------------------------
// CREATE CARD
// -----------------------------

function createAppointmentCard(appointment) {
    const card = appointmentCardTemplate.content
        .cloneNode(true)
        .querySelector(".appointment-card");

    card.dataset.id = appointment.id;

    const typeElement = card.querySelector(
        ".appointment-card__type"
    );

    const statusElement = card.querySelector(
        ".appointment-card__status"
    );

    const dateElement = card.querySelector(
        ".appointment-card__date"
    );

    const timeElement = card.querySelector(
        ".appointment-card__time"
    );

    const nameElement = card.querySelector(
        ".appointment-card__name"
    );

    const emailElement = card.querySelector(
        ".appointment-card__email"
    );

    typeElement.textContent = appointment.type;

    statusElement.textContent =
        capitalize(appointment.status);

    statusElement.classList.add(
        `status--${appointment.status}`
    );

    dateElement.textContent =
        formatDate(appointment.date);

    timeElement.textContent = appointment.time;

    nameElement.textContent = appointment.name;

    emailElement.textContent = appointment.email;

    const viewButton = card.querySelector(
        '[data-action="view"]'
    );

    const rescheduleButton = card.querySelector(
        '[data-action="reschedule"]'
    );

    const cancelButton = card.querySelector(
        '[data-action="cancel"]'
    );

    viewButton.addEventListener("click", () => {
        openViewModal(appointment.id);
    });

    rescheduleButton.addEventListener("click", () => {
        openRescheduleModal(appointment.id);
    });

    cancelButton.addEventListener("click", () => {
        openCancelModal(appointment.id);
    });

    if (appointment.status === "cancelled") {
        rescheduleButton.disabled = true;
        cancelButton.disabled = true;
    }

    return card;
}

// -----------------------------
// SORTING
// -----------------------------

function sortAppointmentArray(array, sortOption) {
    array.sort((a, b) => {
        if (sortOption === "name-asc") {
            return a.name.localeCompare(b.name);
        }

        if (sortOption === "name-desc") {
            return b.name.localeCompare(a.name);
        }

        const dateA = new Date(
            `${a.date} ${convertTo24Hour(a.time)}`
        );

        const dateB = new Date(
            `${b.date} ${convertTo24Hour(b.time)}`
        );

        if (sortOption === "date-desc") {
            return dateB - dateA;
        }

        return dateA - dateB;
    });
}

// -----------------------------
// SEARCH / FILTER
// -----------------------------

if (searchInput) {
    searchInput.addEventListener(
        "input",
        renderAppointments
    );
}

if (filterStatus) {
    filterStatus.addEventListener(
        "change",
        renderAppointments
    );
}

if (filterType) {
    filterType.addEventListener(
        "change",
        renderAppointments
    );
}

if (sortAppointments) {
    sortAppointments.addEventListener(
        "change",
        renderAppointments
    );
}

// -----------------------------
// VIEW MODAL
// -----------------------------

function openViewModal(id) {
    const appointment = findAppointment(id);

    if (!appointment) return;

    selectedAppointmentId = id;

    viewType.textContent = appointment.type;
    viewName.textContent = appointment.name;
    viewEmail.textContent = appointment.email;
    viewDate.textContent = formatDate(appointment.date);
    viewTime.textContent = appointment.time;
    viewNotes.textContent = appointment.notes || "No notes";
    viewStatus.textContent =
        capitalize(appointment.status);

    openModal(viewModal);
}

function closeViewModal() {
    closeModal(viewModal);
    selectedAppointmentId = null;
}

viewModalClose.addEventListener(
    "click",
    closeViewModal
);

viewModalCloseBtn.addEventListener(
    "click",
    closeViewModal
);

// -----------------------------
// RESCHEDULE
// -----------------------------

function openRescheduleModal(id) {
    const appointment = findAppointment(id);

    if (!appointment) return;

    if (appointment.status === "cancelled") {
        showToast(
            "Cancelled appointments cannot be rescheduled.",
            "error"
        );
        return;
    }

    selectedAppointmentId = id;

    rescheduleDate.value = appointment.date;
    rescheduleTime.value = appointment.time;

    rescheduleDate.min = getToday();

    openModal(rescheduleModal);
}

rescheduleForm.addEventListener(
    "submit",
    (event) => {
        event.preventDefault();

        if (!selectedAppointmentId) return;

        const appointment = findAppointment(
            selectedAppointmentId
        );

        if (!appointment) {
            closeModal(rescheduleModal);
            return;
        }

        const newDate = rescheduleDate.value;
        const newTime = rescheduleTime.value;

        if (!newDate || !newTime) {
            showToast(
                "Please select a date and time.",
                "error"
            );
            return;
        }

        if (newDate < getToday()) {
            showToast(
                "You cannot reschedule to a past date.",
                "error"
            );
            return;
        }

        if (
            isTimeSlotTaken(
                newDate,
                newTime,
                appointment.id
            )
        ) {
            showToast(
                "This time slot is already booked.",
                "error"
            );
            return;
        }

        appointment.date = newDate;
        appointment.time = newTime;

        saveAppointments();
        renderAppointments();
        updateStats();

        closeModal(rescheduleModal);

        showToast(
            "Appointment rescheduled successfully!",
            "success"
        );

        selectedAppointmentId = null;
    }
);

rescheduleModalClose.addEventListener(
    "click",
    () => {
        closeModal(rescheduleModal);
        selectedAppointmentId = null;
    }
);

rescheduleCancelBtn.addEventListener(
    "click",
    () => {
        closeModal(rescheduleModal);
        selectedAppointmentId = null;
    }
);

// -----------------------------
// CANCEL APPOINTMENT
// -----------------------------

function openCancelModal(id) {
    const appointment = findAppointment(id);

    if (!appointment) return;

    if (appointment.status === "cancelled") {
        showToast(
            "This appointment is already cancelled.",
            "error"
        );
        return;
    }

    selectedAppointmentId = id;

    openModal(cancelModal);
}

cancelModalClose.addEventListener(
    "click",
    () => {
        closeModal(cancelModal);
        selectedAppointmentId = null;
    }
);

keepAppointmentBtn.addEventListener(
    "click",
    () => {
        closeModal(cancelModal);
        selectedAppointmentId = null;
    }
);

confirmCancelBtn.addEventListener(
    "click",
    () => {
        if (!selectedAppointmentId) return;

        const appointment = findAppointment(
            selectedAppointmentId
        );

        if (!appointment) {
            closeModal(cancelModal);
            return;
        }

        appointment.status = "cancelled";

        saveAppointments();
        renderAppointments();
        updateStats();

        closeModal(cancelModal);

        selectedAppointmentId = null;

        showToast(
            "Appointment cancelled.",
            "success"
        );
    }
);

// -----------------------------
// MODALS
// -----------------------------

function openModal(modal) {
    if (!modal) return;

    modal.hidden = false;

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add("modal-open");

    requestAnimationFrame(() => {
        modal.classList.add("is-open");
    });
}

function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("is-open");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    setTimeout(() => {
        modal.hidden = true;
    }, 200);

    document.body.classList.remove("modal-open");
}

// Overlay closing
document.addEventListener("click", (event) => {
    const overlay = event.target.closest(
        "[data-close-modal]"
    );

    if (!overlay) return;

    const modalId = overlay.dataset.closeModal;

    const modal = document.getElementById(modalId);

    closeModal(modal);

    selectedAppointmentId = null;
});

// Escape closes modals
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (!viewModal.hidden) {
        closeViewModal();
        return;
    }

    if (!rescheduleModal.hidden) {
        closeModal(rescheduleModal);
        selectedAppointmentId = null;
        return;
    }

    if (!cancelModal.hidden) {
        closeModal(cancelModal);
        selectedAppointmentId = null;
    }
});

// -----------------------------
// STATISTICS
// -----------------------------

function updateStats() {
    const total = appointments.length;

    const upcoming = appointments.filter(
        (appointment) =>
            appointment.status === "upcoming"
    ).length;

    const cancelled = appointments.filter(
        (appointment) =>
            appointment.status === "cancelled"
    ).length;

    totalCount.textContent = total;
    upcomingCount.textContent = upcoming;
    cancelledCount.textContent = cancelled;
}

// -----------------------------
// THEME
// -----------------------------

function loadTheme() {
    const savedTheme =
        localStorage.getItem(THEME_KEY);

    if (savedTheme === "dark") {
        applyTheme("dark");
        return;
    }

    if (savedTheme === "light") {
        applyTheme("light");
        return;
    }

    const prefersDark =
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;

    applyTheme(
        prefersDark ? "dark" : "light"
    );
}

function applyTheme(theme) {
    document.documentElement.dataset.theme =
        theme;

    if (themeToggle) {
        const isDark = theme === "dark";

        themeToggle.setAttribute(
            "aria-pressed",
            String(isDark)
        );
    }
}

if (themeToggle) {
    themeToggle.addEventListener(
        "click",
        () => {
            const currentTheme =
                document.documentElement.dataset.theme ||
                "light";

            const newTheme =
                currentTheme === "dark"
                    ? "light"
                    : "dark";

            applyTheme(newTheme);

            localStorage.setItem(
                THEME_KEY,
                newTheme
            );
        }
    );
}

// -----------------------------
// TOAST
// -----------------------------

function showToast(message, type = "info") {
    if (!toastContainer) return;

    const toast = document.createElement("div");

    toast.className = `toast toast--${type}`;

    toast.setAttribute("role", "alert");

    const messageElement =
        document.createElement("span");

    messageElement.className = "toast__message";
    messageElement.textContent = message;

    const closeButton =
        document.createElement("button");

    closeButton.type = "button";
    closeButton.className = "toast__close";
    closeButton.setAttribute(
        "aria-label",
        "Close notification"
    );

    closeButton.textContent = "×";

    closeButton.addEventListener(
        "click",
        () => removeToast(toast)
    );

    toast.appendChild(messageElement);
    toast.appendChild(closeButton);

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("is-visible");
    });

    setTimeout(() => {
        removeToast(toast);
    }, 4000);
}

function removeToast(toast) {
    if (!toast || !toast.isConnected) return;

    toast.classList.remove("is-visible");

    setTimeout(() => {
        toast.remove();
    }, 250);
}

// -----------------------------
// HELPERS
// -----------------------------

function findAppointment(id) {
    return appointments.find(
        (appointment) =>
            appointment.id === id
    );
}

function generateId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2)
    );
}

function capitalize(value) {
    if (!value) return "";

    return value.charAt(0).toUpperCase() +
        value.slice(1);
}

function formatDate(dateString) {
    if (!dateString) return "—";

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
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}

function convertTo24Hour(timeString) {
    if (!timeString) return "00:00";

    const [time, modifier] =
        timeString.split(" ");

    let [hours, minutes] =
        time.split(":").map(Number);

    if (modifier === "AM" && hours === 12) {
        hours = 0;
    }

    if (modifier === "PM" && hours !== 12) {
        hours += 12;
    }

    return `${String(hours).padStart(2, "0")}:${String(
        minutes
    ).padStart(2, "0")}`;
}

// -----------------------------
// AUTO-UPDATE PAST APPOINTMENTS
// -----------------------------

function updateAppointmentStatuses() {
    const now = new Date();

    let changed = false;

    appointments.forEach((appointment) => {
        if (appointment.status !== "upcoming") {
            return;
        }

        const appointmentDateTime = new Date(
            `${appointment.date}T${convertTo24Hour(
                appointment.time
            )}`
        );

        if (appointmentDateTime < now) {
            appointment.status = "completed";
            changed = true;
        }
    });

    if (changed) {
        saveAppointments();
        renderAppointments();
        updateStats();
    }
}

setInterval(
    updateAppointmentStatuses,
    60000
);