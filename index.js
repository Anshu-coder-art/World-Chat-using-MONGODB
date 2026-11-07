const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
require("dotenv").config();

// Basic configuration
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// MongoDB connection
const dbUrl = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/whatsapp";

let dbConnection;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!dbConnection) {
    dbConnection = mongoose.connect(dbUrl).catch((err) => {
      dbConnection = null;
      throw err;
    });
  }

  await dbConnection;
}

// //my code for local connection
// main()
//   .then(() => {
//     console.log("connection successful");
//   })
//   .catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect("mongodb://127.0.0.1:27017/whatsapp");
// }

// Connect to database before processing routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// INDEX ROUTE
app.get("/chats", async (req, res, next) => {
  try {
    let chats = await Chat.find();
    let length = chats.length;

    res.render("index.ejs", { chats, length });
  } catch (err) {
    next(err);
  }
});

// NEW ROUTE
app.get("/chats/new", (req, res) => {
  res.render("new.ejs");
});

// CREATE CHAT
app.post("/chats", async (req, res, next) => {
  try {
    let { from, msg, to } = req.body;

    let newChat = new Chat({
      from,
      msg,
      to,
      created_at: new Date(),
    });

    await newChat.save();

    res.redirect("/chats");
  } catch (err) {
    next(err);
  }
});

// EDIT ROUTE
app.get("/chats/:id/edit", async (req, res, next) => {
  try {
    let { id } = req.params;
    let chat = await Chat.findById(id);

    res.render("edit.ejs", { chat });
  } catch (err) {
    next(err);
  }
});

// UPDATE CHAT
app.put("/chats/:id", async (req, res, next) => {
  try {
    let { id } = req.params;
    let { msg: newmsg } = req.body;

    await Chat.findByIdAndUpdate(id, {
      msg: newmsg,
      created_at: new Date(),
    });

    res.redirect("/chats");
  } catch (err) {
    next(err);
  }
});

// DELETE CHAT
app.delete("/chats/:id", async (req, res, next) => {
  try {
    let { id } = req.params;

    await Chat.findByIdAndDelete(id);

    res.redirect("/chats");
  } catch (err) {
    next(err);
  }
});

// HOME ROUTE
app.get("/", (req, res) => {
  res.redirect("/chats");
});

// ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Something went wrong!");
});

// LOCALHOST + VERCEL SUPPORT
if (require.main === module) {
  app.listen(8080, () => {
    console.log("Server is listening on port 8080");
  });
}

// Export Express app for Vercel
module.exports = app;
