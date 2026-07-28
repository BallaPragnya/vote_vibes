import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import config from './config/env.js'; // 1. Load environment variables
import corsOptions from './config/cors.js';
import routes from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// 2. Initialize Express
const app = express();

// Security middleware
app.use(helmet());

// 3. Parse JSON & URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Register request logger
app.use(requestLogger);

// 5. Configure CORS
app.use(cors(corsOptions));

// 6. Register routes
app.use('/', routes);

// 7. Handle 404 errors
app.use(notFoundHandler);

// 8. Register centralized error handler
app.use(errorHandler);

export default app;
