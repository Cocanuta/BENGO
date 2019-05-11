/**
 * Config Manager
 * @module Config
 * @requires fs
 */
const fs = require('fs'); // Load File System

/**
 * The location of the configuration file.
 * @readonly
 * @const {String}
 */
const configFile = __dirname + "/../config.json";

/**
 * The global Configuration container.
 * @global
 * @const {Object}
 */
global.Config = {};

/**
 * LoadConfig - Load the configFile and store it in the global Config object. Or if no file found at configFile, create a new Config object and save it to the configFile.
 * @async
 * @function
 * @return {Promise<Boolean>} The result of the Config object being populated from configFile.
 */
function LoadConfig() {
  console.log("Loading Config...");
  return new Promise(function(res, err) {
    fs.exists(configFile, function(exists) {
      if (exists) {
        fs.readFile(configFile, function(error, data) {
          if (error) {
            err(error);
            res(false);
          } else {
            Config = JSON.parse(data);
            console.log("Config Loaded!");
            res(true);
          }
        });
      } else {
        console.log("No Config Found, Creating One...");
        Config = {
          SSLKey: '/../key/privkey.pem',
          SSLCert: '/../key/fullchain.pem',
          Conference: "Microsoft",
          Port: 3000,
          Database: '../data.db'
        };
        fs.writeFile(configFile, JSON.stringify(Config, null, 2), function(error) {
          if (error) {
            err(error);
            res(false);
          }
          console.log("Config Created!");
          res(true);
        });
      }
    });
  });
}

/**
 * SaveConfig - Write the current Config object to the configFile.
 * @function
 */
function SaveConfig() {
  fs.writeFile(configFile, JSON.stringify(Config, null, 2), function(err) {
    if (err) throw err;
    console.log("Config Updated And Saved!");
  });
}

/**
 * UpdateConference - Update the current Conference value of the global Config object, then call the {@link SaveConfig} function.
 * @function
 * @param  {String} newConference A string containing the desired conference name.
 */
function UpdateConference(newConference) {
  Config.Conference = newConference;
  SaveConfig();
}

module.exports = {
  Load: LoadConfig,
  Save: SaveConfig,
  UpdateConference: UpdateConference
}
