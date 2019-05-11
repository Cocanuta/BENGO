console.log("Server Starting...");

const Configuration = require(__dirname + '/libs/config');
const Server = require(__dirname + '/libs/server');
global.Database = require(__dirname + '/libs/database');
const SocketIO = require(__dirname + '/libs/IO');

Configuration.Load().then(function(res) {
  Server.Start();
  Database.Connect();
  SocketIO.Start();
  console.log("Bingo Server Started Up!");
}, function(err) {
  console.log(err);
});
