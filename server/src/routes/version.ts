import { Router } from 'express';
import { checkForUpdate, getLocalVersion } from '../utils/version.js';

export const versionRouter = Router();

versionRouter.get('/', async (_req, res) => {
  try {
    const info = await checkForUpdate();
    res.json(info);
  } catch {
    res.json({
      updateAvailable: false,
      currentVersion: getLocalVersion(),
      latestVersion: getLocalVersion(),
    });
  }
});
