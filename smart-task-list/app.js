let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-buttons button');
const enableNotificationsButton = document.getElementById('enable-notifications');

function renderTasks(filter = 'all') {
  taskList.innerHTML = '';
  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.textContent = task.name;
    if (task.completed) span.style.textDecoration = 'line-through';
    li.appendChild(span);
    const button = document.createElement('button');
    button.textContent = 'Удалить';
    button.addEventListener('click', () => {
      tasks = tasks.filter(t => t !== task);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      renderTasks(getCurrentFilter());
    });
    li.appendChild(button);
    taskList.appendChild(li);
  });
}

function getCurrentFilter() {
  return document.querySelector('.filter-buttons button.active').getAttribute('data-filter');
}

addTaskButton.addEventListener('click', () => {
  const taskName = taskInput.value.trim();
  if (taskName) {
    tasks.push({ name: taskName, completed: false });
    localStorage.setItem('tasks', JSON.stringify(tasks));
    taskInput.value = '';
    renderTasks(getCurrentFilter());
    // Отправка уведомления
    if (Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Новая задача', {
          body: taskName,
          icon: 'icons/icon-192x192.png'
        });
      });
    }
  }
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    renderTasks(button.getAttribute('data-filter'));
  });
});

enableNotificationsButton.addEventListener('click', () => {
  if (Notification.permission === 'granted') {
    alert('Уведомления уже включены');
  } else if (Notification.permission === 'denied') {
    alert('Вы запретили отправку уведомлений в настройках браузера');
  } else {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        alert('Уведомления включены');
      } else {
        alert('Уведомления не включены');
      }
    });
  }
});

// Напоминания каждые 2 часа
setInterval(() => {
  const activeTasks = tasks.filter(task => !task.completed);
  if (activeTasks.length > 0 && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification('Напоминание', {
        body: 'У вас есть невыполненные задачи!',
        icon: 'icons/icon-192x192.png'
      });
    });
  }
}, 7200000); // 2 часа