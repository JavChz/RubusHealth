import net from 'net';

const BLACKLISTED_PORTS = new Set([3000, 5000, 5432, 27017, 22, 80, 443]);

/**
 * Check if a TCP port is available on 0.0.0.0
 */
export function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

/**
 * Find the next available port starting from `startPort`,
 * skipping blacklisted ports.
 */
export async function findAvailablePort(startPort: number): Promise<number> {
  let port = startPort;
  while (port < 65535) {
    if (!BLACKLISTED_PORTS.has(port)) {
      const available = await isPortAvailable(port);
      if (available) return port;
    }
    port++;
  }
  throw new Error('No available ports found');
}
