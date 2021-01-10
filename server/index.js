require("dotenv").config();

const { networkInterfaces } = require("os");
const express = require("express");
const path = require("path");
const ssl = require("http");

const app = express();
const server = ssl.createServer(app);
const socketHandler = require("./socket");

global.app = app;
global.server = server;

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/../client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname + "/../client/build/manifest.json"));
  });
}

function setIPPort() {
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
  global.IP =
    process.env.NODE_ENV === "development"
      ? "localhost"
      : process.env.IP || netsResults.eno2[0];
  global.PORT = process.env.PORT || 4000;
}

setIPPort();
server.listen(
  {
    port: PORT,
    host: IP,
  },
  () => {
    socketHandler();
  }
);
