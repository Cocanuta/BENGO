// Includes
const fs = require('fs');

// Configuration File
const configFile = __dirname + "/config.json";

// Config holder
global.Config = {};

function LoadConfig() {
  console.log("Loading Config...");
  return new Promise(function(res, err) {
    fs.exists(configFile, function(exists) {
      if(exists) {
        fs.readFile(configFile, function(error, data) {
          if(error) {
            err(error);
          } else {
            Config = JSON.parse(data);
            console.log("Config Loaded!");
            res(true);
          }
        });
      } else {
        console.log("No Config Found, Creating One...");
        Config.SSLKey = './key/privkey.pem';
        Config.SSLCert = './key/fullchain.pem';
        Config.Conference = "Microsoft";
        Config.Port = 3000;
        Config.Database = './data.db';
        fs.writeFile(configFile, JSON.stringify(Config, null, 2), function(error) {
          if(error) err(error);
          console.log("Config Created!");
          res(true);
        });
      }
  });
});
}

function SaveConfig() {
  fs.writeFile(configFile, JSON.stringify(Config, null, 2), function(err) {
    if(err) throw err;
    console.log("Config Updated And Saved!");
  });
}

function UpdateConference(newConference) {
  Config.Conference = newConference;
  SaveConfig();
}

module.exports = {
  Load: LoadConfig,
  Save: SaveConfig,
  UpdateConference: UpdateConference
}
