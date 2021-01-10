let clientsConnected = 0;

function setSocketIO() {
  io.on("connection", (socket) => {
    clientsConnected += 1;
    process.env.NODE_ENV === "production" &&
      console.log(`CLIENT CONNECTED\nTotal clients: ${clientsConnected}`);
    global.socket = socket;
    setSocketListeners();
  });
}

function setSocketListeners() {
  socket.on("disconnect", () => {
    clientsConnected -= 1;
    process.env.NODE_ENV === "production" &&
      console.log(`CLIENT DISCONNECTED\nTotal clients: ${clientsConnected}`);
  });
}

module.exports = function () {
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
  global.io = io;
  setSocketIO();
};
