// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, session } = require("electron")
const { join } = require("path")
const express = require("express")
const { json, st } = express;
const isDev = (()=>{
  const {env} = process; // eslint-disable-line n/prefer-global/process
  const isEnvSet = 'ELECTRON_IS_DEV' in env;
  const getFromEnv = Number.parseInt(env.ELECTRON_IS_DEV, 10) === 1;

  return isEnvSet ? getFromEnv : !app.isPackaged;
})();

const path = require("path");
const fs = require("fs");
const os = require("os");

// Change the version if required.
const reactDevToolsVersion = "5.1";

const reactDevToolsPath = path.join(
  os.homedir(),
  // For Linux. Change this for any other operating system.
  "/.config/google-chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/" + reactDevToolsVersion + ".0_0"
)

const localServerApp = express();
const PORT = 3001;
const startLocalServer = (done) => {
  localServerApp.use(json({ limit: "100mb" }));
  //localServerApp.use(st(__dirname));
  localServerApp.listen(PORT, async () => {
    done();
  });
};

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1550,
    height: 900,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    },
    icon: path.join(__dirname, "public", "favicon.png")
  });

  // and load the index.html of the app.
  //   mainWindow.loadFile('index.html')
  mainWindow.loadURL(isDev
    ? 'http://localhost:3000'
    : `file://${join(__dirname, '../build/index.html')}`);

  setTimeout(() => {
    // Reload!
    mainWindow.reload();
  }, 1000)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  await session.defaultSession.loadExtension(reactDevToolsPath);
})

app.whenReady().then(() => {
  startLocalServer(createWindow);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  }
);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function isValidLevelName(n) { return n.slice(-5) === ".json" && !isNaN(Number(n.slice(0, -5))) && Number(n.slice(0, -5)) > 0};

/**
 * Allows the user to select a directory and get its levels.
 * Returns something like:
 * { levels: {
 *    1: { hard: 0 }
 *    10: { hard: 0 }
 *    and so on...
 *    }, dir: "some dir"
 * }
 */
ipcMain.handle('read-dir-levels', async () => {
  let levels = {};
  // Open a dialog.
  const { dialog } = require('electron');
  const dir = dialog.showOpenDialogSync({ properties: ['openDirectory'] });
  if (!dir) return {};
  // Loop through every file in the directory.
  const files = fs.readdirSync(dir[0]);
  // Now get the level data of each one.
  for (const file of files) {
    if (!isValidLevelName(file)) continue;
    const text = fs.readFileSync(path.join(dir[0], file));
    const data = JSON.parse(text);
    if (data) levels[Number(file.slice(0, -5))] = { hard: data.hard || 0};
  }
  return {levels: levels, dir: dir[0]};
})

/**
 * Gets the data of a level.
 * @param level The level number of the level to load.
 * @param dir The directory of the level to load.
 */
ipcMain.handle('read-level', async (e, level, dir) => {
  if (!dir) return {invalid: true};
  // Now get the level data the level.
  let text;
  try {
    text = fs.readFileSync(path.join(dir, level + ".json"));
  } catch(e) {
    console.warn("Level file for level " + level + " has error: " + e + "! That's weird...");
    return {invalid: true};
  }
  const data = JSON.parse(text);
  delete data.invalid;
  return data;
});

/**
 * Saves the data of a level.
 * @param level The level number of the level to save.
 * @param dir The directory of the level to save.
 * @param data The data of the level to save. Must be a JSON object.
 */
ipcMain.handle('save-level', async (e, level, dir, data) => {
  if (!dir) return {invalid: true};
  // Now get the level data the level.
  fs.writeFileSync(path.join(dir, level + ".json"), dataToLevelText(data));
  return e.returnValue;
});

/**
 * Converts a level JSON to a stored Circle Match Level.
 */
function dataToLevelText(data) {
  return JSON.stringify(data);
}