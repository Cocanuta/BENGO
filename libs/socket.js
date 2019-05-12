/**
 * The socket controller used to manage all socket.io and web connections and events.
 * @summary The socket and web server controller module.
 * @module Socket
 * @requires socket.io
 * @requires express
 * @requires https
 * @requires fs
 */

const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const io = require('socket.io')();

/**
 * Start the web server and socket.io interface.
 * @summary Start listening for connections.
 * @function
 */
function StartSockets() {
  /*
  global.HttpsServer = https.createServer({
    key: fs.readFileSync(Config.SSLKey),
    cert: fs.readFileSync(Config.SSLCert)
  }, express);
  */
  global.HttpsServer = http.createServer(express);
  HttpsServer.listen(Config.Port);
  io.listen(HttpsServer);
  console.log("Sockets Listening On Port:", Config.Port);
}

io.on("connection", function(socket) {
  console.log("Client Connected!");
  socket.on('requestTiles', function(data) {
    if (data.TwitchID) {
      socket.TwitchID = data.TwitchID;
      socket.emit('sendTiles', Database.GetPlayer(data.TwitchID));
    } else {
      console.error("No TwitchID provided");
      // TODO: Send Error To Client.
    }
  });
  socket.on('requestModQueue', function() {
    socket.moderator = true;
    socket.emit('sendModQueue', Database.GetModerationQueue());
  });
  socket.on('updateTiles', function(data) {
    Database.UpdatePlayer(data.TwitchID, data.Tiles);
    SendToTwitchID(data.TwitchID, 'sendTiles', Database.GetPlayer(data.TwitchID));
    SendToModerators('sendModQueue', Database.GetModerationQueue());
    let checkedCount = 0;
    for (let i = 0; i < data.Tiles.length; i++) {
      if (data.Tiles[i].Checked)
        checkedCount++;
    }
    if(checkedCount == data.Tiles.length) {
      SendToTwitchID(data.TwitchID, 'enableBingo');
    }
  });
  socket.on('callBingo', function(data) {
    if (data.TwitchID) {
      Database.UpdateModState(data.TwitchID, true);
      socket.emit('sendTiles', Database.GetPlayer(data.TwitchID));
      SendToModerators('sendModQueue', Database.GetModerationQueue());
    }
  });
  socket.on('modDeny', function(data) {
    if (data.TwitchID) {
      Database.UpdateModState(data.TwitchID, false);
      SendToTwitchID(data.TwitchID, 'sendTiles', Database.GetPlayer(data.TwitchID));
      SendToModerators('sendModQueue', Database.GetModerationQueue());
    }
  });
});

/**
 * Send a Socket.io event to a specificed TwitchID
 * @summary Send an event to a Player.
 * @function
 * @param  {String} twitchID    The TwitchID of the target player.
 * @param  {String} event       The socket.io event to be sent.
 * @param  {Object} data        The data to be sent with the event.
 * @example SendToTwitchID('112334323', 'sendTiles', { 'foo': bar });
 */
function SendToTwitchID(twitchID, event, data = null) {
  const sockets = io.sockets.sockets;
  for (let soc in sockets) {
    if (sockets[soc].hasOwnProperty("TwitchID") && sockets[soc].TwitchID == data.TwitchID) {
      sockets[soc].emit(event, data);
    }
  }
}

/**
 * Send a Socket.io event to all connected moderators
 * @summary Send an event to all mods.
 * @function
 * @param  {String} event   The socket.io event to be sent.
 * @param  {Object} data    The data to be sent with the event.
 * @example SendToModerators('sendModQueue', { 'foo': bar });
 */
function SendToModerators(event, data = null) {
  const sockets = io.sockets.sockets;
  for (let soc in sockets) {
    if (sockets[soc].hasOwnProperty("moderator") && sockets[soc].moderator === true) {
      sockets[soc].emit(event, data);
    }
  }
}

module.exports = {
  Start: StartSockets,
  SendToTwitchID: SendToTwitchID,
  SendToModerators: SendToModerators
}
