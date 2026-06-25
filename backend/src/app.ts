import 'dotenv/config';
import express from 'express';
import { corsMiddleware } from './middleware/cors.middleware';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import pblRoutes from './routes/pbl.routes';
import grantRoutes from './routes/grant.routes';
import reviewRoutes from './routes/review.routes';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

app.use(corsMiddleware);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/pbl', pblRoutes);
app.use('/api/grants', grantRoutes);
app.use('/api/review', reviewRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Mantra4Change API server running on http://localhost:${PORT}`);
  console.log(`AI Narratives: ${process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== 'PLACEHOLDER_REPLACE_WITH_REAL_KEY' ? 'ENABLED' : 'DISABLED (fallback mode)'}`);
});

export default app;
