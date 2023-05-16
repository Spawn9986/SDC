const faker = require("@faker-js/faker").faker;
// or, if desiring a different locale
// import { fakerDE as faker } from '@faker-js/faker';

const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  host: "127.0.0.1",
  database: "todo_db",
  password: "password",
  port: 6432,
});

faker.seed(100000);

for (let i = 0; i < ;100000 i++) {
  let fname = faker.person.fullName();

  let todoObj = {
    full_name: fname,
    completed: Boolean(Math.round(Math.random())),
  };

  pool.query(
    "INSERT INTO todos (name, completed) VALUES ($1, $2)",
    [todoObj.full_name, todoObj.completed],
    (err, res) => {
      if (err) {
        console.log(err.stack);
      } else {
        console.log(`Inserted todos with id ${res.insertId}`);
      }
    }
  );
}

const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./todo_api/src/config/database");
const TaskModel = require("./todo_api/src/models/task");

const PORT = process.env.PORT || 8082;
const PGHOST = process.env.POSTGRES_HOST || "127.0.0.1";
const PGPORT = process.env.POSTGRES_PORT || 5432;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
// If we wanted to restrict the origin of HTTP requests:
// var corsOptions = {
//   origin: "http://localhost:3000"
// };
// app.use(cors(corsOptions));

// Controller containing the CRUD methods
const tasksController = require("./todo_api/src/tasksController");

app.get("/", function (req, res, next) {
  // res.send(`Welcome to Todo API`);
  res.status(200).json({ message: "Welcome to Tasks api" });
});

app.get("/todos", (req, res) => {
  pool
    .query(`SELECT * FROM todos`)
    .then((result) => {
      res.send(result.rows);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error retrieving data from database");
    });
});

// API endpoints
app.get("/api/tasks", tasksController.findAll);

app.post("/api/tasks", tasksController.create);

app.put("/api/tasks/:id", tasksController.update);

app.delete("/api/tasks/:id", tasksController.delete);

const initApp = async () => {
  console.log("Testing the database connection..");
  /**
   * Test the database connection to Sequelize.
   */
  try {
    await db.authenticate();
    console.log("Connection has been established successfully.");

    // Syncronize the Task model.
    TaskModel.sync({
      alter: true,
    })
      .then(() => {
        console.log("Synced tasks table");
      })
      .catch((err) => {
        console.log("Failed to sync db table: " + err.message);
      });

    app.listen(PORT, () => {
      console.log(
        `Server is up and running at: http://localhost:${PORT} and connecting to postgres on ${PGHOST} port ${PGPORT}`
      );
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error.original);
  }
};

/**
 * Initialize the application.
 */
initApp();
