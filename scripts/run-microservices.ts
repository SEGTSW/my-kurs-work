import { spawn } from 'child_process';

type Service = {
  name: string;
  entry: string;
  tsconfig: string;
};

const services: Service[] = [
  {
    name: 'auth-service',
    entry: 'services/auth-service/src/main.ts',
    tsconfig: 'services/auth-service/tsconfig.json',
  },
  {
    name: 'room-service',
    entry: 'services/room-service/src/main.ts',
    tsconfig: 'services/room-service/tsconfig.json',
  },
  {
    name: 'booking-service',
    entry: 'services/booking-service/src/main.ts',
    tsconfig: 'services/booking-service/tsconfig.json',
  },
  {
    name: 'api-gateway',
    entry: 'services/api-gateway/src/main.ts',
    tsconfig: 'services/api-gateway/tsconfig.json',
  },
];

const children = services.map((service) => {
  const child = spawn(process.execPath, ['-r', 'ts-node/register', service.entry], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      TS_NODE_FILES: 'true',
      TS_NODE_PROJECT: service.tsconfig,
    },
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${service.name}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${service.name}] ${chunk}`);
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${service.name}] exited with code ${code}`);
      shutdown();
    }
  });

  return child;
});

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }
}

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
