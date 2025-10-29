# Private Electron Browser (Self-contained)

This is a minimal, self-contained Electron private browser:

- Uses an ephemeral session (partitioned, not stored on disk).
- Clears cache and storage on exit.
- Denies all permission requests (camera, mic, geolocation).
- Removes Referer headers and sets `DNT` header.
- Blocks a tiny example list of known trackers (extend as needed).
- Runs without requiring any other third-party applications.

> **Important:** This project does *not* change your external IP address — it is **not** a VPN or proxy changer. To change IP you must route traffic through a remote VPN or proxy service (those are external). See the notes below.

## Install & run
1. `git clone <repo>`
2. `cd private-electron-browser`
3. `npm install`
4. `npm start`

## Notes & limitations
- The embedded browser uses an ephemeral session and attempts to reduce fingerprinting and leaks, but it is not a full privacy browser like Tor Browser.
- **No external VPN/proxy** is included here. If you want to route this app's traffic through a remote proxy, you can:
  - Use Electron session `setProxy()` to point to a SOCKS5/HTTP proxy (requires a remote proxy endpoint).
  - Or run a system VPN (WireGuard/OpenVPN) — both are external to this repo.
- WebRTC may still leak IP in some environments — the app tries to reduce it with flags but not all Chromium builds behave the same. Use a network-level VPN for full IP hiding.
- You can extend the `blockedHosts` list in `main.js` to add more tracker hosts.
