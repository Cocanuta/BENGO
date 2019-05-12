/**
 * The configuration manager module, used to create, save and load the configuration values in the global {@link Config} object.
 * @summary The config manager module.
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
 * A global object to hold all configuration data for easy access from any module.
 * @global
 * @summary The configuration object.
 * @property {String} SSLKey      The SSL Key file destination
 * @property {String} SSLCert     The SSL Certificate file destination
 * @property {String} Conference  The current Conference name
 * @property {Number} Port        The server port
 * @property {String} Database    The SQLite3 database file destination
 */
global.Config = {};

/**
 * Load the configFile and store it in the global Config object. Or if no file found at configFile, create a new Config object and save it to the configFile.
 * @summary Load the configuration.
 * @async
 * @function
 * @return {Promise<Boolean>} The result of the Config object being populated from configFile.
 * @example LoadConfig().then(function(res) {
 *  if(res) console.log("Config Loaded!");
 *  else console.log("Console Failed To Load!");
 * });
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
 * Write the current Config object to the configFile.
 * @summary Save the configuration to file.
 * @function
 * @example SaveConfig();
 */
function SaveConfig() {
  fs.writeFile(configFile, JSON.stringify(Config, null, 2), function(err) {
    if (err) throw err;
    console.log("Config Updated And Saved!");
  });
}

/**
 * Update the current Conference value of the global Config object, then call the {@link SaveConfig} function.
 * @summary Update the current conference value.
 * @function
 * @param  {String} newConference A string containing the desired conference name.
 * @example UpdateConference("Ubisoft");
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
