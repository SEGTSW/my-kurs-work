import { createApp } from './app';
import { env } from './env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Auth Service listening on port ${env.port}`);
});
