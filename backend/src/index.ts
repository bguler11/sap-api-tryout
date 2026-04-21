import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './services/db.service';
import environmentsRouter from './routes/environments';
import sapApisRouter from './routes/sapApis';
import proxyRouter from './routes/proxy';
import historyRouter from './routes/history';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/environments', environmentsRouter);
app.use('/api/sap/apis', sapApisRouter);
app.use('/api/proxy', proxyRouter);
app.use('/api/history', historyRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`SAP API Try-Out Backend çalışıyor: http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('DB başlatılamadı:', err);
  process.exit(1);
});
