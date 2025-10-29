// main.js — Private Electron Browser (self-contained, ephemeral)
const { app, BrowserWindow, session, dialog } = require('electron');
const path = require('path');

let mainWindow = null;

const PARTITION_NAME = `private_${Date.now()}`; // ephemeral partition

// Useful chromium flags to reduce fingerprinting/leaks
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors'); // example
app.commandLine.appendSwitch('disable-client-side-phishing-detection');
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('disable-sync');
app.commandLine.appendSwitch('disable-plugins');
app.commandLine.appendSwitch('disable-translate');
app.commandLine.appendSwitch('disable-crash-reporter');
// Try to reduce WebRTC exposure (best-effort)
app.commandLine.appendSwitch('force-webrtc-ip-handling-policy', 'disable_non_proxied_udp');

// Create the private session with no cache
function createPrivateSession() {
  return session.fromPartition(PARTITION_NAME, { cache: false });
}

async function createWindow() {
  const ses = createPrivateSession();

  // Privacy settings for the session
  await ses.setPermissionRequestHandler((webContents, permission, callback) => {
    // Deny all permission requests by default (geolocation, camera, mic, etc.)
    // You can allow selectively here.
    callback(false);
  });

  // Policy: disable cache, block many trackers/resources
  await ses.setUserAgent('PrivateBrowser/1.0'); // simple user agent (customize)
  await ses.clearStorageData(); // ensure clean

  // Block requests to common trackers & disable sending referer
  ses.webRequest.onBeforeSendHeaders((details, callback) => {
    // remove Referer header to reduce leakage
    if (details.requestHeaders && details.requestHeaders.Referer) {
      delete details.requestHeaders.Referer;
    }
    // Spoof or trim other headers if you like
    details.requestHeaders['DNT'] = '1';
    callback({ requestHeaders: details.requestHeaders });
  });

  // Basic blocker: block known big trackers/resources (very small example)
  const blockedHosts = ['tracker.', 'ads.', 'doubleclick.net', 'google-analytics.com', 'googlesyndication.com'];
  ses.webRequest.onBeforeRequest({ urls: ['*://*/*'] }, (details, cb) => {
    for (const b of blockedHosts) {
      if (details.url.includes(b)) return cb({ cancel: true });
    }
    return cb({ cancel: false });
  });

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Private Browser',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      session: ses,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('close', async (e) => {
    // Clear late as well (redundant) — attempt sync cleanup
    try {
      const s = mainWindow.webContents.session;
      await s.clearCache();
      await s.clearStorageData();
    } catch (err) {
      console.error('Error clearing session on close', err);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure complete cleanup on quit
async function cleanAndExit() {
  try {
    // get session by name and clear storage
    const s = session.fromPartition(PARTITION_NAME);
    await s.clearStorageData();
    await s.clearCache();
  } catch (e) {
    console.error('cleanup error', e);
  }
  app.quit();
}

app.whenReady().then(async () => {
  try {
    await createWindow();
  } catch (e) {
    dialog.showErrorBox('Startup error', String(e));
    app.quit();
  }
});

app.on('window-all-closed', async () => {
  await cleanAndExit();
});

app.on('before-quit', async (e) => {
  // ensure clearing
  await cleanAndExit();
});
