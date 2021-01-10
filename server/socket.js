const socketioJwt = require("socketio-jwt");

let clientsConnected = 0;

function setSocketIO() {
  io.on("connection", (socket) => {
    clientsConnected += 1;
    global.socket = socket;
    setSocketListeners();
  });
}

function setSocketListeners() {
  socket.on("disconnect", () => {
    clientsConnected -= 1;
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
