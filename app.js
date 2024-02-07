// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
});

// Define User model
const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

// Define Task model
const Task = sequelize.define("Task", {
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

// Define associations
User.hasMany(Task);
Task.belongsTo(User);

// Sync models with database
(async () => {
  await sequelize.sync({ force: true });
  console.log("Database synchronized");
})();

// Define routes

// User signup
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.create({ username, password });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username, password } });
    if (user) {
      res.json({ message: "Login successful", user });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create a task
app.post("/tasks", async (req, res) => {
  try {
    const { userId, description, dueDate } = req.body;
    const task = await Task.create({ UserId: userId, description, dueDate });
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tasks for a user
app.get("/tasks/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const tasks = await Task.findAll({ where: { UserId: userId } });
    res.json(tasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a task
app.put("/tasks/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { description, status, dueDate } = req.body;
    const task = await Task.findByPk(taskId);
    if (task) {
      task.description = description;
      task.status = status;
      task.dueDate = dueDate;
      await task.save();
      res.json(task);
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a task
app.delete("/tasks/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const task = await Task.findByPk(taskId);
    if (task) {
      await task.destroy();
      res.json({ message: "Task deleted successfully" });
    } else {
      res.status(404).json({ error: "Task not found" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
