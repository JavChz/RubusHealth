# 🫐 RubusHealth

**Lightweight, mobile-first Raspberry Pi monitoring dashboard.**

Instantly know if your device is alive and healthy — CPU, RAM, disk, temperature, network, and processes. Installs in one command.

---

## ⚡ One-line install

```bash
curl -fsSL https://raw.githubusercontent.com/JavChz/RubusHealth/main/scripts/install.sh | bash
```

**What this does:**
1. Detects your OS (Debian / Raspberry Pi OS)
2. Installs Node.js LTS if needed
3. Clones the repo to `~/.rubushealth`
4. Builds the application
5. Creates and starts a `systemd` service
6. Prints your access URL

---

## 🌐 Accessing the Dashboard

After install, open in your browser:

```
http://<your-pi-ip>:48721
```

The installer prints the exact URL. You can also find your Pi's IP with `hostname -I`.

---

## 📊 What You See

| Section | Details |
|---------|---------|
| **Status** | Alive / Offline indicator, system uptime |
| **Temperature** | Live °C with Pi-model-specific throttle thresholds — glows red when hot |
| **CPU** | Usage %, core count, model, speed |
| **RAM** | Used / total, percentage |
| **Disk** | Used / total on `/`, filesystem type |
| **Network** | RX/TX live rates and cumulative totals |
| **Processes** | Top 8 by CPU or memory, sortable |
| **History** | 30m / 1h / 6h / 24h charts for CPU, Temp, RAM, Disk |

---

## 🛠 CLI Commands

```bash
rubushealth status     # Check service status
rubushealth start      # Start the service
rubushealth stop       # Stop the service
rubushealth restart    # Restart the service
rubushealth logs       # View recent logs
rubushealth update     # Pull latest version and rebuild
rubushealth version    # Show installed version
rubushealth uninstall  # Remove completely
```

---

## 🔄 Updating

```bash
rubushealth update
```

The app will also display a banner in the UI when an update is available.

---

## 🗑 Uninstalling

```bash
rubushealth uninstall
```

This stops the service, removes it from systemd, deletes `~/.rubushealth`, and removes the CLI binary.

---

## ⚙️ Configuration

Open the Settings panel (gear icon ⚙) in the UI to:

- Change the port (default: `48721`)
- Adjust collection interval (default: 15s)
- Change data retention window (default: 24h)
- Restart the service
- Export settings as JSON

---

## 🌡 Temperature Thresholds

RubusHealth detects your Pi model and uses the correct thermal limits:

| Model | Throttle Onset | Throttle Hard | Critical |
|-------|---------------|---------------|---------|
| Pi 1 / 2 | 70°C | 80°C | 85°C |
| Pi 3 / Zero 2 | 80°C | 85°C | 90°C |
| Pi 4 | 80°C | 85°C | 90°C |
| Pi 5 | 85°C | 90°C | 95°C |

The temperature card turns yellow at the onset threshold and red at critical.

---

## 🔌 API

Full OpenAPI 3.1 docs served at:
```
http://<your-pi-ip>:48721/api/docs
```

Quick reference:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Liveness probe |
| `/api/version` | GET | Version + update check |
| `/api/stats` | GET | Live system snapshot |
| `/api/history?range=1h` | GET | Historical data (30m/1h/6h/24h) |
| `/api/settings` | GET / POST | Read / update settings |
| `/api/settings/restart` | POST | Restart the service |

---

## 📁 Project Structure

```
RubusHealth/
├── server/          # Express API (TypeScript)
│   └── src/
│       ├── index.ts           # Entry point
│       ├── collector.ts       # Metrics poller (15s)
│       ├── db.ts              # SQLite via better-sqlite3
│       └── routes/            # stats, history, settings, health, version, docs
├── web/             # React + Vite + TailwindCSS v4 frontend
│   └── src/
│       ├── components/        # All UI components
│       ├── store/             # Zustand stores
│       └── hooks/             # usePolling
├── scripts/
│   ├── install.sh             # One-command installer
│   ├── update.sh              # Updater
│   └── rubushealth.sh         # CLI
└── version.json               # Single source of truth for version
```

---

## 🧪 Tech Stack

- **Backend**: Node.js + TypeScript + Express + better-sqlite3 + systeminformation
- **Frontend**: React 18 + Vite + TailwindCSS v4 + Zustand + Recharts + Lucide
- **Storage**: SQLite (15s intervals, 24h retention by default)
- **Port**: `48721` (auto-selects next if busy)

---

## 📄 License

MIT © [JavChz](https://github.com/JavChz)
