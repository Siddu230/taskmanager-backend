const express = require('express');
const cors = require('cors');
const app = express();

// Configure CORS to allow requests from your Netlify domain
const corsOptions = {
  origin: 'https://regal-muffin-be5178.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type'], // Allowed headers
};

app.use(cors(corsOptions));
app.use(express.json());

let tasks = [];
let idCounter = 1;

app.get('/tasks', (req, res) => {
  let filteredTasks = [...tasks];
  const priorityFilter = req.query.priority;
  if (priorityFilter) {
    filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
  }
  const sortBy = req.query.sortBy;
  if (sortBy === 'priority') {
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (sortBy === 'deadline') {
    filteredTasks.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  }
  res.json(filteredTasks);
});

app.post('/tasks', (req, res) => {
  const { title, priority = 'Low', deadline } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const newTask = { id: idCounter++, title, priority, deadline };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, priority, deadline } = req.body;
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  task.title = title || task.title;
  task.priority = priority || task.priority;
  task.deadline = deadline || task.deadline;
  res.json(task);
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});