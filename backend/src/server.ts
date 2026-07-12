import { env } from './config/env';   // must be first — validates env vars on boot
import app from './app';
import { prisma } from './lib/prisma';

async function main() {
  // Confirm DB connectivity before accepting traffic
  await prisma.$connect();
  console.log('✅ Database connected');

  app.listen(env.PORT, () => {
    console.log(`🚀 Swift API running on http://localhost:${env.PORT}`);
    console.log(`   Health: http://localhost:${env.PORT}/health`);
  });
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
