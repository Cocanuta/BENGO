/**
 * The database controller module used to create, insert and update {@Link Player} data in the connected SQLite database.
 * @summary The database controller module.
 * @module Database
 * @requires better-sqlite3-helper
 * @requires shuffle
 */
const DB = require('better-sqlite3-helper');
const shuffle = require('shuffle-array');

/**
 * Open a connection to the sqlite3 database.
 * @summary Connect to the database.
 * @function
 * @example Connect();
 */
function Connect() {
  DB({
    path: __dirname + Config.Database,
    memory: false,
    readonly: false,
    fileMustExist: true,
    WAL: false,
    migrate: false
  });
  console.log("Connected To Database!");
}

/**
 * @typedef {Object} Tile
 * @summary An object to hold Bingo Tile information.
 * @property {Number} TileID The ID of the Bingo tile.
 * @property {String} Title The Title of the Bingo tile.
 * @property {Boolean} Chcked Wether or not the Player has checked the Bingo tile.
 */

/**
 * @typedef {Object} Player
 * @summary An object to hold {@link Player} information.
 * @property {Number} TwitchID The Players Twitch ID.
 * @property {Tile[]} Tiles The Players Bingo tile array.
 * @property {Boolean} Moderate If the player is under moderation.
 * @property {Boolean} Banned If the player has been banned.
 */

/**
 * Search the database for players where 'Moderate' = true.
 * @summary Retrive the current moderation queue.
 * @function
 * @return {Player[]} An array of {@link Player}'s who are currently being moderated.
 * @example GetModerationQueue();
 */
function GetModerationQueue() {
  let modQueue = DB().query('SELECT * FROM Players WHERE Moderate = ?', 1);
  for (let i = 0; i < modQueue.length; i++) {
    modQueue[i].Tiles = GetCard(JSON.parse(modQueue[i].Tiles));
  }
  return modQueue;
}

/**
 * Update a player's tiles in the database.
 * @summary Update a {@link Player} in the database.
 * @param  {Number} twitchID The Twitch ID of the {@link Player}.
 * @param  {Tile[]} tiles The updated {@link Tile}'s to be entered int othe database.
 * @function
 * @example UpdatePlayer('112334323', [ { 'TileID': 1, 'Title': "Foo", 'Checked': false }, { 'TileID': 2, 'Title': "Bar", 'Checked': true } ]);
 */
function UpdatePlayer(twitchID, tiles) {
  for (let i = 0; i < tiles.length; i++) {
    delete tiles[i].Title;
  }
  DB().update('Players', {
    Tiles: JSON.stringify(tiles)
  }, {
    TwitchID: twitchID
  });
}

/**
 * Update a {@link Player}'s Moderation state
 * @summary Update a {@link Player} mod state.
 * @param  {Number} twitchID The Twitch ID of the {@link Player}.
 * @param  {Boolean} state The new moderation state of the {@link Player}.
 * @function
 * @example UpdateModState('112334323', false);
 */
function UpdateModState(twitchID, state) {
  DB().update('Players', {
    Moderate: Number(state)
  }, {
    TwitchID: twitchID
  });
}

function Test() {
  let tiles = {
    "Microsoft": [],
    "Bethesda": [],
    "PC": [],
    "Ubisoft": [],
    "KindaFunny": [],
    "SquareEnix": [],
    "Nintendo": [],
    "Devolver": []
  };
  let availableTiles = DB().query('SELECT * FROM Tiles');
  availableTiles = shuffle(availableTiles);

  for (let conference in tiles) {
    for (let tile in availableTiles) {
      if (availableTiles[tile].Conference == conference || availableTiles[tile].Conference == "All") {
        tiles[conference].push(tile);
      }
    }
    tiles[conference] = shuffle(tiles[conference]);
  }
  console.log(tiles);
}


/**
 * Retrieve a {@link Player} from the database or create a new {@link Player} and add them to the database.
 * @summary Get a {@link Player} from the database or Create a new one.
 * @param  {Number} twitchID The Twitch ID of the {@link Player}.
 * @return {Player} The {@link Player} retreived from the Database.
 * @example GetPlayer('112334323');
 */
function GetPlayer(twitchID) {
  let playerData = DB().queryFirstRow('SELECT * FROM Players WHERE TwitchID = ?', twitchID);
  if (playerData) {
    playerData.Tiles = GetCard(JSON.parse(playerData.Tiles));
    return playerData;
  } else {
    let tiles = [];
    let availableTiles = DB().query('SELECT * FROM Tiles');
    availableTiles = shuffle(availableTiles).slice(0, 15);
    for (let i = 0; i < availableTiles.length; i++) {
      tiles.push({
        TileID: availableTiles[i].ID,
        Checked: false
      });
    }
    try {
      DB().insert('Players', {
        TwitchID: twitchID,
        Tiles: JSON.stringify(tiles)
      });
      console.log("New Player '%d' added to the database.", twitchID);
      return {
        TwitchID: twitchID,
        Tiles: GetCard(tiles)
      };
    } catch (e) {
      console.error(e);
      console.error("Error making new player with ID: ", twitchID);
      return null;
    }
  }
}

/**
 * Add the relevant Title's to a {@link Tile[]} array.
 * @summary Get the {@link Tile} Title from the database.
 * @param  {Tile[]} tileArray An array of {@link Tile}'s without Title values.
 * @return {Tile[]} A new array of {@link Tile}'s with Title values.
 * @example GetCard([ { 'TileID': 1, Checked: false }, { 'TileID': 2, Checked: true } ]);
 */
function GetCard(tileArray) {
  const allTiles = DB().query('SELECT * FROM Tiles');
  for (let i = 0; i < tileArray.length; i++) {
    tileArray[i].Title = allTiles.find(t => t.ID === tileArray[i].TileID).Title;
  }
  return tileArray;
}

module.exports = {
  Connect: Connect,
  GetPlayer: GetPlayer,
  GetCard: GetCard,
  UpdatePlayer: UpdatePlayer,
  UpdateModState: UpdateModState,
  GetModerationQueue: GetModerationQueue
}
