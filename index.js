const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const path = require("path");
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.resolve("./public")));

const users = {};

io.on("connection", (socket) => {
  // console.log("A new user is connected", socket.id);
  socket.on('new_user', (name) => {
    users[socket.id] = name;
    socket.broadcast.emit('name', name);
  })

  //   socket.on("chat-message", (msg) => {
  //     console.log("a new user message", msg);
  //     // io.emit('new_message', msg);                    // send msg to every client/user including sender
  //     socket.broadcast.emit('new_message',msg);          //send msg to every client/user excluding sender
  //   });
  // });

  socket.on("chat-message", (msg) => {
    console.log("a new user message", msg);
    socket.broadcast.emit('new_message',{message: msg, name: users[socket.id]});          //send msg to every client/user excluding sender
  });

  // User is typing event
  socket.on("startTyping", () => {
    socket.broadcast.emit("user_typing", users[socket.id]);
  });

  // User stopped typing event
  socket.on("stopTyping", () => {
    socket.broadcast.emit("user_stopped_typing", users[socket.id]);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('leave',users[socket.id]);
    delete users[socket.id];
  })
});

app.get("/", (req, res) => {
  res.sendFile("/public/index.html");
});

server.listen(9000, () => {
  console.log("server started at port : 9000");
});
