const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const { createClient } = require("@supabase/supabase-js");

app.use(express.json());

const users = [];

dotenv.config();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

//create one student account usually by admin only but right now we will overlook that
app.post("/student/signup", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const { error } = await supabase.from("Students").insert({
      student_id: req.body.student_id,
      first_name: req.body.first_name,
      password: hashedPassword,
      email: req.body.email,
    });
    if (error) {
      res.status(400).send({ error });
    }
    res.status(201).send();
  } catch {
    res.status(500).send();
  }
});
//login
app.post("/students/login", async (req, res) => {
  try {
    if (!req.bobdy.password || !req.boby.student_id) {
      return res.status(400).send("student_id and password are required");
    }
    const { data, error } = await supabase
      .from("Students")
      .select("*")
      .eq("student_id", req.body.student_id);

    if (error) {
      return res.status(400).send({ error });
    }
    if (data.length === 0) {
      return res.status(400).send("Cannot find user");
    }

    if (await bcrypt.compare(req.body.password, data[0].password)) {
      res.send("Success");
    } else {
      res.send("Not Allowed");
    }
  } catch {
    res.status(500).send();
  }
});

app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/users", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    console.log(salt);
    console.log(hashedPassword);
    const user = { name: req.body.name, password: hashedPassword };
    users.push(user);
    res.status(201).send();
  } catch {
    res.status(500).send();
  }
});

app.post("/users/login", async (req, res) => {
  const user = users.find((user) => user.name === req.body.name);
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send("Success");
    } else {
      res.send("Not Allowed");
    }
  } catch {
    res.status(500).send();
  }
});

app.listen(3001);
