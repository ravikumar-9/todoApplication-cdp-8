const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get todos API 1
//sc-1
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q } = request.query;
  if (status !== undefined) {
    const getTodosQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
    status='${status}';`;
    const todosArray = await db.all(getTodosQuery);
    response.send(todosArray);
  } else if (priority !== undefined) {
    const getTodosQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
    priority='${priority}';`;
    const todosArray = await db.all(getTodosQuery);
    response.send(todosArray);
  } else if (priority !== undefined && status !== undefined) {
    const getTodosQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
    priority='${priority}' AND status='${status}';`;
    const todosArray = await db.all(getTodosQuery);
    response.send(todosArray);
  } else if (search_q !== undefined) {
    const getTodosQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
    todo LIKE '%${search_q}%';`;
    const todosArray = await db.all(getTodosQuery);
    response.send(todosArray);
  }
});

//GET todoBYID API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoByIDQuery = `SELECT * FROM 
    todo
    WHERE id='${todoId}';`;
  const todoArray = await db.get(todoByIDQuery);
  response.send(todoArray);
});

//ADD todo API
app.post("/todos/", async (request, response) => {
  const todoBody = request.body;
  const { id, todo, priority, status } = todoBody;
  const addTodoQuery = `INSERT INTO 
  todo(id,todo,priority,status)
    VALUES(
       '${id}',
      '${todo}',
       '${priority}',
       '${status}' 
    );`;
  await db.all(addTodoQuery);
  response.send("Todo Successfully Added");
});

//UPDATE TODO API
app.put("/todos/:todoId/", async (request, response) => {
  const requestBody = request.body;
  const { todoId } = request.params;
  let updateColumn = "";
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;

    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }

  const prevTodoQuery = `SELECT 
  * FROM
  todo
  WHERE todo='${todoId}';`;

  const prevTodo = await db.get(prevTodoQuery);

  const {
    todo = prevTodo.todo,
    status = prevTodo.status,
    priority = prevTodo.priority,
  } = request.body;

  const updatedTodoQuery = `UPDATE todo
  SET 
  todo='${todo}',
 priority='${priority}',
  status='${status}'
  WHERE id='${todoId}';`;

  const data = await db.run(updatedTodoQuery);
  response.send(`${updatedColumn} Updated`);
});

//DELETE TODO API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  deleteTodoQuery = `DELETE FROM todo
    WHERE id='${todoId}';`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
