// server/server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let waitingUser = null;

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("join", ({ name }) => {
    socket.username = name;
    if (waitingUser) {
      io.to(socket.id).emit("matched", waitingUser.username);
      io.to(waitingUser.id).emit("matched", name);
      socket.partner = waitingUser;
      waitingUser.partner = socket;
      waitingUser = null;
    } else {
      waitingUser = socket;
      socket.emit("waiting");
    }
  });

  socket.on("message", (msg) => {
    if (socket.partner) {
      io.to(socket.partner.id).emit("message", { name: socket.username, text: msg });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (waitingUser === socket) {
      waitingUser = null;
    }
    if (socket.partner) {
      io.to(socket.partner.id).emit("partner_disconnected");
      socket.partner = null;
    }
  });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});

