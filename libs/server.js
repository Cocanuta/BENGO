const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');


/**
 * StartServer - Start the web server and socket.io interface.
 * @function
 */
function StartServer() {
  /*
  global.HttpsServer = https.createServer({
    key: fs.readFileSync(Config.SSLKey),
    cert: fs.readFileSync(Config.SSLCert)
  }, express);
  */
  global.HttpsServer = http.createServer(express);
  HttpsServer.listen(Config.Port);

  global.IO = require("socket.io").listen(HttpsServer);
  console.log("Server Listening On Port:", Config.Port);
}

module.exports = {
  Start: StartServer
}
