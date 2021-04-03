const socketioJwt = require("socketio-jwt");

let users = [];

function getUsersData() {
  return {
    size: users.length,
    data: users.map((user) => {
      return {
        username: user.username,
      };
    }),
  };
}

class User {
  constructor(socket) {
    this.username = socket.handshake.headers.username;
    this.socket = socket;
    this.setSocketListeners();
  }
  setSocketListeners(socket) {
    this.socket.on("FORCE_DISCONNECT", () => {
      this.socket.disconnect();
    });
    this.socket.on("disconnect", () => {
      users = users.filter(
        (user) => user.socket.client.id !== this.socket.client.id
      );
      io.sockets.emit("USERS_CONNECTED", getUsersData());
    });
  }
}

function setSocketIO() {
  io.on("connection", (socket) => {
    let alreadyIn = false;
    for (const user of users) {
      if (user.socket.client.id === socket.client.id) alreadyIn = true;
      if (user.username === socket.handshake.headers.username) alreadyIn = true;
      if (alreadyIn) break;
    }
    if (alreadyIn) {
      io.sockets.emit("USERS_CONNECTED", getUsersData());
      return;
    }
    users.push(new User(socket));
    io.sockets.emit("USERS_CONNECTED", getUsersData());
  });
}

module.exports = function () {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
  global.io = io;
  io.use(
    socketioJwt.authorize({
      secret: process.env.JWT_TOKEN || "placeholder_jwt",
      handshake: true,
      auth_header_required: true,
      callback: false,
    })
  );
  setSocketIO();
};
