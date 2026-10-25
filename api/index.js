'use strict';

const app = require('../server/server');
const { connectDB, getConnectionType } = require('../server/config/db');
const { seed } = require('../server/config/seed');

let initPromise = null;

/**
 * Initializes database connection and seeds demo data once per serverless instance lifecycle.
 */
async function ensureInitialized() {
  if (!initPromise) {
    initPromise = (async () => {
      try {
        const { connectionType } = await connectDB();
        console.log(`[Vercel Serverless] Database connected (${connectionType} mode).`);

        // Ensure default users, rooms, and hotel exist (idempotent seed)
        try {
          await seed();
          console.log('[Vercel Serverless] Demo seed completed.');
        } catch (seedErr) {
          console.log('[Vercel Serverless] Seed notice:', seedErr.message);
        }
      } catch (err) {
        console.error('[Vercel Serverless] Startup error:', err.message);
      }
    })();
  }
  return initPromise;
}

/**
 * Vercel Serverless Function entry point.
 * Wraps Express application and ensures database is ready before processing the request.
 */
const handler = async (req, res) => {
  await ensureInitialized();
  return app(req, res);
};

handler.app = app;
handler.ensureInitialized = ensureInitialized;

module.exports = handler;
