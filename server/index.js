require("dotenv").config();

const { networkInterfaces } = require("os");
const express = require("express");
const path = require("path");
const ssl = require("http");

const app = express();
const server = ssl.createServer(app);
const socketHandler = require("./socket");

const nets = networkInterfaces();
const netsResults = {};
const netsArray = Object.keys(nets);
for (const name of netsArray) {
  for (const net of nets[name]) {
    if (net.family === "IPv4" && !net.internal) {
      if (!netsResults[name]) netsResults[name] = [];
      netsResults[name].push(net.address);
    }
  }
}
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
global.io = io;
global.app = app;
global.server = server;
global.IP = netsResults.eno2[0] || "localhost";
global.PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname + "/../client/build/manifest.json"));
  });
}

const launch = () => {
  process.env.NODE_ENV === "production"
    ? console.log(`PRODUCTION SERVER LISTENING AT ${PORT}`)
    : console.log(`DEVELOPMENT SERVER LISTENING AT ${PORT}`);
  socketHandler();
};

server.listen(
  {
    port: PORT,
    host: IP,
  },
  launch
);
