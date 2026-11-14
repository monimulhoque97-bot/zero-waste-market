require('dotenv').config();
const app = require('./app');
const db = require('./config/database');
const path = require('path');
const seed = require('../../database/seed');

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    console.log('🚀 Initializing ZeroWaste Market Backend...');
    const engine = await db.initDatabase();
    console.log(`[Server] Database initialized using [${engine.toUpperCase()}] engine.`);

    // Check if tables are seeded; if completely empty, run safe initial seed
    try {
      const [rows] = await db.query('SELECT COUNT(*) as count FROM users');
      const count = rows[0]?.count || 0;
      if (count === 0) {
        console.log('[Server] No users detected. Performing initial demo data seeding...');
        await seed();
      }
    } catch (seedErr) {
      console.log('[Server] Auto-seed check finished or table initialized.');
    }

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🌿 ZERO WASTE MARKET API SERVER IS RUNNING`);
      console.log(`📍 Location: Guwahati, Assam, India`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📦 Database Engine: ${db.getActiveEngine()}`);
      console.log(`=======================================================`);
    });

    // Graceful Shutdown
    const shutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (err) {
    console.error('❌ [Server] Failed to launch backend server:', err);
    process.exit(1);
  }
}

startServer();
