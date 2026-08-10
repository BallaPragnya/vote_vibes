import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import config from './config/env.js'; // 1. Load environment variables
import corsOptions from './config/cors.js';
import routes from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// 2. Initialize Express
const app = express();

// Trust reverse proxy header in production (e.g., Nginx, Cloudflare, AWS ALB)
if (config.isProduction) {
  app.set('trust proxy', 1);
}

// Security headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows cross-origin image/file fetching for candidate uploads
  })
);

// 3. Parse JSON & URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Register request logger
app.use(requestLogger);

// 5. Configure CORS
app.use(cors(corsOptions));

// 6. Apply Global Rate Limiter to /api routes
if (!config.isTest) {
  app.use('/api', globalRateLimiter);
}

// 7. Serve static uploads with secure headers (prevent MIME-sniffing & inline script execution)
app.use(
  '/uploads',
  express.static('uploads', {
    setHeaders: (res, filePath) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'");
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache static assets for 1 day
    },
  })
);

// 8. Register routes
app.use('/', routes);

// 9. Handle 404 errors
app.use(notFoundHandler);

// 10. Register centralized error handler
app.use(errorHandler);

export default app;
