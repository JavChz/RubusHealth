import { Router } from 'express';
import { getLocalVersion } from '../utils/version.js';

export const docsRouter = Router();

docsRouter.get('/', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const version = getLocalVersion();

  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'RubusHealth API',
      description: 'Raspberry Pi monitoring dashboard API',
      version,
      contact: {
        url: 'https://github.com/JavChz/RubusHealth',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [{ url: `${baseUrl}/api`, description: 'Local instance' }],
    paths: {
      '/health': {
        get: {
          summary: 'Health check',
          description: 'Lightweight liveness probe',
          operationId: 'getHealth',
          tags: ['System'],
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      version: { type: 'string', example: '1.0.0' },
                      uptime: { type: 'number', description: 'System uptime in seconds' },
                      processUptime: { type: 'number', description: 'Process uptime in seconds' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/version': {
        get: {
          summary: 'Version info',
          description: 'Returns current and latest version with update availability',
          operationId: 'getVersion',
          tags: ['System'],
          responses: {
            '200': {
              description: 'Version information',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      updateAvailable: { type: 'boolean' },
                      currentVersion: { type: 'string' },
                      latestVersion: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/stats': {
        get: {
          summary: 'Live system stats',
          description: 'Returns a complete snapshot of current system metrics',
          operationId: 'getStats',
          tags: ['Metrics'],
          responses: {
            '200': {
              description: 'System stats snapshot',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      cpu: {
                        type: 'object',
                        properties: {
                          usage: { type: 'number', description: 'CPU usage percent' },
                          cores: { type: 'number' },
                          physicalCores: { type: 'number' },
                          model: { type: 'string' },
                          speed: { type: 'number', description: 'Speed in GHz' },
                        },
                      },
                      temperature: {
                        type: 'object',
                        properties: {
                          current: { type: 'number', description: 'CPU temperature in Celsius' },
                          status: {
                            type: 'string',
                            enum: ['normal', 'warning', 'throttling', 'critical'],
                            description: 'Thermal status based on Pi model thresholds',
                          },
                          thresholds: {
                            type: 'object',
                            properties: {
                              onset: { type: 'number' },
                              hard: { type: 'number' },
                              critical: { type: 'number' },
                            },
                          },
                          chipset: { type: 'string' },
                        },
                      },
                      ram: {
                        type: 'object',
                        properties: {
                          used: { type: 'number', description: 'Used RAM in bytes' },
                          total: { type: 'number', description: 'Total RAM in bytes' },
                          free: { type: 'number' },
                          percent: { type: 'number' },
                        },
                      },
                      disk: {
                        type: 'object',
                        properties: {
                          used: { type: 'number', description: 'Used disk in bytes' },
                          total: { type: 'number', description: 'Total disk in bytes' },
                          percent: { type: 'number' },
                          mount: { type: 'string' },
                          fs: { type: 'string' },
                        },
                      },
                      network: {
                        type: 'object',
                        properties: {
                          interface: { type: 'string' },
                          rxRate: { type: 'number', description: 'Receive rate bytes/sec' },
                          txRate: { type: 'number', description: 'Transmit rate bytes/sec' },
                          rxTotal: { type: 'number' },
                          txTotal: { type: 'number' },
                        },
                      },
                      system: {
                        type: 'object',
                        properties: {
                          hostname: { type: 'string' },
                          platform: { type: 'string' },
                          distro: { type: 'string' },
                          release: { type: 'string' },
                          arch: { type: 'string' },
                          uptime: { type: 'number', description: 'System uptime in seconds' },
                        },
                      },
                      processes: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            pid: { type: 'number' },
                            name: { type: 'string' },
                            cpu: { type: 'number' },
                            mem: { type: 'number' },
                            state: { type: 'string' },
                          },
                        },
                      },
                      meta: {
                        type: 'object',
                        properties: {
                          version: { type: 'string' },
                          updateAvailable: { type: 'boolean' },
                          latestVersion: { type: 'string' },
                          collectedAt: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/history': {
        get: {
          summary: 'Historical metrics',
          description: 'Returns time-series metric data from SQLite',
          operationId: 'getHistory',
          tags: ['Metrics'],
          parameters: [
            {
              name: 'range',
              in: 'query',
              schema: { type: 'string', enum: ['30m', '1h', '6h', '24h'], default: '1h' },
              description: 'Time range for historical data',
            },
          ],
          responses: {
            '200': {
              description: 'Historical data array',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      range: { type: 'string' },
                      count: { type: 'number' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            timestamp: { type: 'number' },
                            cpu: { type: 'number' },
                            temp: { type: 'number' },
                            ram: { type: 'number' },
                            disk: { type: 'number' },
                            netRx: { type: 'number' },
                            netTx: { type: 'number' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/settings': {
        get: {
          summary: 'Get settings',
          operationId: 'getSettings',
          tags: ['Settings'],
          responses: {
            '200': { description: 'Current settings object' },
          },
        },
        post: {
          summary: 'Update settings',
          operationId: 'updateSettings',
          tags: ['Settings'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    port: { type: 'number' },
                    autostart: { type: 'boolean' },
                    collectIntervalSeconds: { type: 'number' },
                    retentionHours: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Updated settings' },
          },
        },
      },
      '/settings/restart': {
        post: {
          summary: 'Restart the service',
          operationId: 'restartService',
          tags: ['Settings'],
          responses: {
            '200': { description: 'Restart initiated' },
          },
        },
      },
    },
    tags: [
      { name: 'System', description: 'System health and version endpoints' },
      { name: 'Metrics', description: 'Live and historical metric data' },
      { name: 'Settings', description: 'Application configuration' },
    ],
  };

  res.json(spec);
});
