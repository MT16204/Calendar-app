const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_IN_MONTH = [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const calendar = document.querySelector('.calendar');
const calendarDays = calendar.querySelector('.calendar-days');
const monthElement = document.querySelector('#month');
const yearElement = calendar.querySelector('#year');
const taskList = document.getElementById("task-list");
const inputBox = document.getElementById("input-box");
const darkModeToggle = document.querySelector('.dark-mode-switch');

const state = {
    selectedDate: null,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    todayDate: new Date()
};

const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

const getFebruaryDays = (year) => isLeapYear(year) ? 29 : 28;

const getMonthDays = (month, year) => {
    return month === 1 ? getFebruaryDays(year) : DAYS_IN_MONTH[month];
};

const formatDateKey = (year, month, day) => {
    return `tasks_${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const getSelectedDateKey = () => {
    if (!state.selectedDate) return null;
    const [year, month, day] = state.selectedDate.split('-');
    return formatDateKey(year, month, day);
};

const createTaskElement = (text, isChecked) => {
    const li = document.createElement("li");
    const textNode = document.createTextNode(text);
    const deleteButton = document.createElement("span");
    
    li.appendChild(textNode);
    deleteButton.textContent = "×";
    li.appendChild(deleteButton);
    
    if (isChecked) {
        li.classList.add("checked");
    }
    
    return li;
};

const getTasksFromStorage = () => {
    const dateKey = getSelectedDateKey();
    return JSON.parse(localStorage.getItem(dateKey)) || [];
};

const saveTasksToStorage = (tasks) => {
    const dateKey = getSelectedDateKey();
    localStorage.setItem(dateKey, JSON.stringify(tasks));
};

const addTask = () => {
    const taskText = inputBox.value.trim();
    if (taskText && state.selectedDate) {
        const li = createTaskElement(taskText, false);
        taskList.appendChild(li);
        
        const tasksForDate = getTasksFromStorage();
        tasksForDate.push({ text: taskText, checked: false });
        saveTasksToStorage(tasksForDate);
        
        inputBox.value = "";
    }
};

const updateTaskList = () => {
    const updatedTasks = Array.from(taskList.querySelectorAll("li")).map(li => ({
        text: li.firstChild.textContent,
        checked: li.classList.contains("checked")
    }));
    saveTasksToStorage(updatedTasks);
};

const loadTasksForDate = (date) => {
    state.selectedDate = date;
    taskList.innerHTML = "";

    const tasksForDate = getTasksFromStorage();
    tasksForDate.forEach(task => {
        const li = createTaskElement(task.text, task.checked);
        taskList.appendChild(li);
    });
};

const createCalendarDay = (dayNumber, isCurrentDay = false) => {
    const day = document.createElement('div');
    day.classList.add('calendar-day-hover');
    day.innerHTML = `${dayNumber}<span></span><span></span><span></span><span></span>`;
    
    if (isCurrentDay) {
        day.classList.add('curr-date');
    }
    
    return day;
};

const createEmptyDay = () => {
    const day = document.createElement('div');
    day.classList.add('empty-day');
    return day;
};

const generateCalendar = (month = state.currentMonth, year = state.currentYear) => {
    calendarDays.innerHTML = '';
    monthElement.innerHTML = MONTH_NAMES[month];
    yearElement.innerHTML = year;

    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = getMonthDays(month, year);
    
    Array.from({ length: firstDayOfWeek }).forEach(() => {
        calendarDays.appendChild(createEmptyDay());
    });
    
    Array.from({ length: daysInMonth }).forEach((_, index) => {
        const dayNumber = index + 1;
        const isCurrentDay = !state.hasUserClicked && 
                           dayNumber === state.todayDate.getDate() && 
                           year === state.todayDate.getFullYear() && 
                           month === state.todayDate.getMonth();
        
        const day = createCalendarDay(dayNumber, isCurrentDay);
        calendarDays.appendChild(day);
    });
    
    attachDayClickEvents();

    if (!state.hasUserClicked && 
        month === state.todayDate.getMonth() && 
        year === state.todayDate.getFullYear()) {
        const today = calendarDays.children[firstDayOfWeek + state.todayDate.getDate() - 1];
        if (today) {
            today.classList.add('curr-date');
        }
    }
};

const attachDayClickEvents = () => {
    document.querySelectorAll('.calendar-days div:not(.empty-day)').forEach(day => {
        day.addEventListener('click', () => {
            state.hasUserClicked = true;

            document.querySelectorAll('.calendar-days div').forEach(d => {
                d.classList.remove('selected');
                d.classList.remove('curr-date');
            });

            day.classList.add('selected');

            const selectedDay = parseInt(day.textContent.trim());
            const isToday = 
                selectedDay === state.todayDate.getDate() &&
                state.currentMonth === state.todayDate.getMonth() &&
                state.currentYear === state.todayDate.getFullYear();

            if (isToday) {
                day.classList.add('selected');
            }

            const selectedMonth = state.currentMonth + 1;
            const selectedYear = state.currentYear;
            state.selectedDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
            loadTasksForDate(state.selectedDate);
        });
    });
};

const initializeCalendar = () => {
    document.querySelectorAll('.calendar-days div').forEach(day => {
        const dayNumber = parseInt(day.textContent.trim());
        const isToday =
            dayNumber === state.todayDate.getDate() &&
            state.currentMonth === state.todayDate.getMonth() &&
            state.currentYear === state.todayDate.getFullYear();

        if (isToday) {
            day.classList.add('curr-date');
        }
    });
};


const handleCalendarNavigation = {
    prevMonth: () => {
        if (state.currentMonth === 0) {
            state.currentMonth = 11;
            state.currentYear--;
        } else {
            state.currentMonth--;
        }
        generateCalendar();
    },
    
    nextMonth: () => {
        if (state.currentMonth === 11) {
            state.currentMonth = 0;
            state.currentYear++;
        } else {
            state.currentMonth++;
        }
        generateCalendar();
    },
    
    prevYear: () => {
        state.currentYear--;
        generateCalendar();
    },
    
    nextYear: () => {
        state.currentYear++;
        generateCalendar();
    }
};

const handleTaskEvents = (e) => {
    if (e.target.tagName === "LI") {
        e.target.classList.toggle("checked");
        updateTaskList();
    } else if (e.target.tagName === "SPAN") {
        const taskItem = e.target.parentElement;
        const taskText = taskItem.firstChild.textContent;
        
        const tasksForDate = getTasksFromStorage()
            .filter(task => task.text !== taskText);
        saveTasksToStorage(tasksForDate);
        
        taskItem.remove();
    }
};

document.querySelector('#prev-month').onclick = handleCalendarNavigation.prevMonth;
document.querySelector('#next-month').onclick = handleCalendarNavigation.nextMonth;
document.querySelector('#prev-year').onclick = handleCalendarNavigation.prevYear;
document.querySelector('#next-year').onclick = handleCalendarNavigation.nextYear;
taskList.addEventListener("click", handleTaskEvents);
darkModeToggle.onclick = () => {
    document.querySelector('body').classList.toggle('light');
    document.querySelector('body').classList.toggle('dark');
};

document.addEventListener("DOMContentLoaded", () => {
    const today = new Date();
    state.selectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    state.hasUserClicked = false;
    generateCalendar();
    loadTasksForDate(state.selectedDate);
});