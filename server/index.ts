import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', productsRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[SSPS Backend] Listening on http://localhost:${port}`);
});

