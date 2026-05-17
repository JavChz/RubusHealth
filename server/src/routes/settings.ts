import { Router } from 'express';
import { exec } from 'child_process';
import { loadSettings, saveSettings, type AppSettings } from '../config.js';

export const settingsRouter = Router();

settingsRouter.get('/', (_req, res) => {
  try {
    const settings = loadSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
});

settingsRouter.post('/', (req, res) => {
  try {
    const body = req.body as Partial<AppSettings>;

    // Validate port
    if (body.port !== undefined) {
      const port = Number(body.port);
      if (isNaN(port) || port < 1024 || port > 65535) {
        return res.status(400).json({ error: 'Invalid port. Must be 1024–65535.' });
      }
      body.port = port;
    }

    const updated = saveSettings(body);
    res.json({ success: true, settings: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

settingsRouter.post('/restart', (_req, res) => {
  res.json({ success: true, message: 'Restarting service...' });

  // Restart after response is sent (give the client time to receive it)
  setTimeout(() => {
    exec('systemctl restart rubushealth', (err) => {
      if (err) {
        // Fallback: just restart the process
        console.log('[settings] systemctl unavailable, restarting process...');
        process.exit(0); // systemd/init will restart it
      }
    });
  }, 500);
});

settingsRouter.post('/autostart', (req, res) => {
  const { enable } = req.body as { enable: boolean };
  const cmd = enable
    ? 'systemctl enable rubushealth'
    : 'systemctl disable rubushealth';

  exec(cmd, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to change autostart setting' });
    }
    saveSettings({ autostart: enable });
    res.json({ success: true, autostart: enable });
  });
});

settingsRouter.post('/export', (_req, res) => {
  const settings = loadSettings();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="rubushealth-settings.json"');
  res.json(settings);
});
