import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';

async function main() {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`🚀 API running on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
