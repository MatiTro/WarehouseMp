const express = require("express");
require("dotenv").config();

const app = express();
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

app.use(bodyParser.json());
app.use(cors());
app.use(
  express.urlencoded(),
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
const DBSOURCE = "baza.db";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.log("mamy problem " + err.message);
    throw err;
  } else {
    // wwalimy dane
  }
});

app.get("/api/getTasks", (req, res) => {
  var sql = "Select * from Task";

  db.all(sql, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      dane: rows,
    });
  });
});

app.get("/api/getUsers", (req, res) => {
  var sql = "Select * from Users";

  db.all(sql, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      dane: rows,
    });
  });
});

app.get("/api/getUser/:id", (req, res) => {
  let id = req.params.id;
  var sql = "Select * from Users where id = ?";

  db.all(sql, [id], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      dane: rows,
    });
  });
});

app.post("/api/addTasks", (req, res) => {
  console.log(req.body);

  const { data, status } = req.body;

  var sql = "INSERT INTO Task (name, description, column) VALUES (?,?,?)";

  db.all(sql, [data.name, data.description, status], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    } else {
      res.json({ message: "git" });
    }
  });
});

app.delete("/api/deleteTasks/:id", (req, res) => {
  let id = req.params.id;
  var sql = "DELETE from Task where id = ? ";

  console.log("usuwanie");
  console.log(id);

  db.run(sql, [id], (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    } else {
      res.json({ message: "git" });
    }
    console.log("usunięte");
  });
});

app.delete("/api/deleteUser/:id", (req, res) => {
  let id = req.params.id;
  var sql = "DELETE from Users where id = ? ";

  db.run(sql, [id], (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    } else {
      res.json({ message: "git" });
    }
    console.log("usunięte");
  });
});

app.put("/api/updateUsers/:id", async (req, res) => {
  let id = req.params.id;

  console.log(req.body);
  console.log(id);
  var errors = [];
  try {
    const { Username, Email, Password } = req.body.data;

    if (!Username) {
      errors.push("Username is missing");
    }
    if (!Email) {
      errors.push("Email is missing");
    }
    if (!Password) {
      errors.push("Password is missing");
    }
    if (errors.length) {
      res.status(400).json({ error: errors.join(",") });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(Password, salt);

    const data = {
      Username: Username,
      Email: Email,
      Password: hashPassword,
      Salt: salt,
      type: req.body.data.type,
      DateCreated: Date("now"),
    };

    console.log(data);

    var sql =
      "UPDATE Users SET Username = ?, Email = ?, Password = ?, Salt = ?, DataCreated = ? , Type = ? WHERE id = ?";
    var params = [
      data.Username,
      data.Email,
      data.Password,
      data.Salt,
      Date("now"),
      data.type,
      id,
    ];
    db.run(sql, params, function (err, innerResult) {
      if (err) {
        res.status(400).json({ error: err.message });
        console.log(err.message);
        return;
      } else {
        res.status(201).json("Success");
        console.log(innerResult);
      }
    });
  } catch (err) {
    console.log(err);
  }
});

app.put("/api/updateTasks/:column/:id", (req, res) => {
  let id = req.params.id;
  let column = req.params.column;

  var sql = "UPDATE TASK SET column = ? WHERE id = ?  ";

  console.log("usuwanie");
  console.log(id);
  console.log(column);

  db.run(sql, [column, id], (err) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    } else {
      res.json({ message: "git" });
    }
    console.log("usunięte");
  });
});

app.post("/api/register", async (req, res) => {
  console.log(req.body);
  var errors = [];
  try {
    const { Username, Email, Password } = req.body;

    if (!Username) {
      errors.push("Username is missing");
    }
    if (!Email) {
      errors.push("Email is missing");
    }
    if (!Password) {
      errors.push("Password is missing");
    }
    if (errors.length) {
      res.status(400).json({ error: errors.join(",") });
      return;
    }

    var sql = "SELECT * FROM Users WHERE Email = ?";
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(Password, salt);

    db.all(sql, Email, (err, result) => {
      if (err) {
        res.status(402).json({ error: err.message });
        return;
      }
      if (result.length === 0) {
        const data = {
          Username: Username,
          Email: Email,
          Password: hashPassword,
          Salt: salt,
          DateCreated: Date("now"),
        };

        console.log(data);

        var sql =
          "INSERT INTO Users (Username, Email, Password, Salt, DataCreated, Type) VALUES (?,?,?,?,?,?)";
        var params = [
          data.Username,
          data.Email,
          data.Password,
          data.Salt,
          Date("now"),
          "Moderator",
        ];
        db.run(sql, params, function (err, innerResult) {
          if (err) {
            res.status(400).json({ error: err.message });
            return;
          } else {
            res.status(201).json("Success");
            console.log(innerResult);
          }
        });
      } else res.status(404).send("User Already Exist. Please Login");
    });
  } catch (err) {
    console.log(err);
  }
});

// * L O G I N
function compareAsync(param1, param2) {
  console.log("comparce async");
  return new Promise(function (resolve, reject) {
    bcrypt.compare(param1, param2, function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

app.post("/api/login", async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email) return res.status(400).send("Email is required");
    if (!Password) return res.status(400).send("Password is required");

    let sql = "SELECT * FROM Users WHERE Email = ?";
    const user = [];

    db.all(sql, Email, (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      rows.forEach(function (row) {
        user.push(row);
      });

      console.log(user[0]);

      const validPassword = compareAsync(Password, user[0].Password);

      if (validPassword) {
        // * CREATE JWT TOKEN
        var token = jwt.sign(
          {
            type: user[0].type,
            user_id: user[0].Id,
            username: user[0].Username,
            Email,
          },
          process.env.TOKEN_KEY,
          {
            expiresIn: "1h", // 60s = 60 seconds - (60m = 60 minutes, 2h = 2 hours, 2d = 2 days)
          }
        );

        user[0].Token = token;
      } else {
        return res.status(400).send("No Match");
      }

      return res.status(200).send(token);
    });
  } catch (err) {
    console.log(err);
  }
});

app.listen(2002, console.log("działaaa"));
