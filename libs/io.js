function StartSocketIO() {
  IO.on("connection", function(socket) {
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
      let checkedCount = 0;
      for (let i = 0; i < data.Tiles.length; i++) {
        if (data.Tiles[i].Checked)
          checkedCount++;
      }
      for (let soc in IO.sockets.sockets) {
        if (IO.sockets.sockets[soc].hasOwnProperty("moderator") &&
          IO.sockets.sockets[soc].moderator === true) {
          IO.sockets.sockets[soc].emit('sendModQueue', Database.GetModerationQueue());
        }
        if (IO.sockets.sockets[soc].hasOwnProperty("TwitchID") &&
          IO.sockets.sockets[soc].TwitchID == data.TwitchID) {
          IO.sockets.sockets[soc].emit('sendTiles', Database.GetPlayer(data.TwitchID));
          if (checkedCount == 15 && !data.Moderate)
            IO.sockets.sockets[soc].emit('enableBingo');
        }
      }
    });
    socket.on('callBingo', function(data) {
      if (data.TwitchID) {
        Database.UpdateModState(data.TwitchID, true);
        socket.emit('sendTiles', Database.GetPlayer(data.TwitchID));
        for (let soc in IO.sockets.sockets) {
          if (IO.sockets.sockets[soc].hasOwnProperty("moderator") &&
            IO.sockets.sockets[soc].moderator === true) {
            IO.sockets.sockets[soc].emit('sendModQueue', Database.GetModerationQueue());
          }
        }
      }
    });
    socket.on('modDeny', function(data) {
      if (data.TwitchID) {
        Database.UpdateModState(data.TwitchID, false);
        for (let soc in IO.sockets.sockets) {
          if (IO.sockets.sockets[soc].hasOwnProperty("moderator") &&
            IO.sockets.sockets[soc].moderator === true) {
            IO.sockets.sockets[soc].emit('sendModQueue', Database.GetModerationQueue());
          }
          if (IO.sockets.sockets[soc].hasOwnProperty("TwitchID") &&
            IO.sockets.sockets[soc].TwitchID == data.TwitchID) {
            IO.sockets.sockets[soc].emit('sendTiles', Database.GetPlayer(data.TwitchID));
          }
        }
      }
    });
  });
}

module.exports = {
  Start: StartSocketIO
}
