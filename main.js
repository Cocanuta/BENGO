/**
 * The main server wrapper used to run the entire backend server.
 * @summary The main server script.
 * @module MainServer
 * @requires Config
 * @requires Socket
 * @requires Database
 */

console.log("Server Starting...");

const Configuration = require(__dirname + '/libs/config');
const Socket = require(__dirname + '/libs/socket');
global.Database = require(__dirname + '/libs/database');

Configuration.Load().then(function(res) {
  if(res) {
    Socket.Start();
    Database.Connect();
    console.log("Bingo Server Started Up!");
  } else {
    console.log("An error caused the server to close.");
    process.exit(1);
  }
}, function(err) {
  console.log(err);
});
