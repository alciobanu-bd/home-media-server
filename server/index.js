const fastify = require('fastify')({ logger: true });
const path = require('path');
const { connectToMongo } = require('./routes/utils/db');

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: true
});

fastify.register(require('@fastify/multipart'), {
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Serve static files - use a single registration with multiple routes
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname),
  prefix: '/api/',
  decorateReply: true, // Enable decorateReply to use sendFile
  schemaHide: true,
  serve: false  // Don't serve automatically, use the routes below
});

// Serve client assets (SVGs, images, etc.)
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '..', 'client', 'src'),
  prefix: '/assets/',
  decorateReply: false
});

// Serve static files from public directory
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '..', 'client', 'public'),
  prefix: '/',
  decorateReply: false
});

// Register all routes
fastify.register(require('./routes'));

// Start the server
const start = async () => {
  try {
    await connectToMongo();
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 